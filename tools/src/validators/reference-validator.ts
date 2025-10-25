/**
 * Reference Validator for Ukiyoue Framework
 *
 * Validates traceability reference integrity:
 * - Checks that all referenced document IDs exist
 * - Detects circular references
 * - Validates reference types against artifact input rules
 * - Validates relatedDocuments, derivedFrom, satisfies fields
 *
 * Satisfies: FR-AUTO-002 (link-checker component)
 */

import artifactInputRules from '@ukiyoue/schemas/constraints/artifact-input-rules.json';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

export interface ReferenceValidationError {
  type:
    | 'missing-reference'
    | 'circular-reference'
    | 'invalid-format'
    | 'invalid-input-type'
    | 'missing-term-reference'
    | 'term-type-mismatch'
    | 'term-constraint-violation'
    | 'synonym-used'
    | 'deprecated-term-used';
  field: string;
  documentId: string;
  referencedId: string;
  message: string;
  path: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface ReferenceValidationResult {
  valid: boolean;
  errors: ReferenceValidationError[];
}

export interface DocumentIndex {
  [id: string]: {
    filePath: string;
    type: string;
  };
}

/**
 * Extract all document IDs from a JSON document recursively
 */
function extractReferences(
  obj: unknown,
  path: string = '',
  refs: Array<{ field: string; id: string; path: string }> = []
): Array<{ field: string; id: string; path: string }> {
  if (typeof obj !== 'object' || obj === null) {
    return refs;
  }

  const referenceFields = [
    'derivedFrom',
    'satisfies',
    'relatedDocuments',
    'affectedArtifacts', // Risk Register: each risk's affected artifacts
    'relatedDecisions', // ADR: related ADRs
    'parentId',
    'childIds',
    'dependsOn',
    'blocks',
    'relates',
  ];

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;

    if (referenceFields.includes(key)) {
      // Handle array of references
      if (Array.isArray(value)) {
        value.forEach((id, index) => {
          if (typeof id === 'string') {
            refs.push({
              field: key,
              id,
              path: `${currentPath}[${index}]`,
            });
          }
        });
      }
      // Handle single reference
      else if (typeof value === 'string') {
        refs.push({
          field: key,
          id: value,
          path: currentPath,
        });
      }
    }
    // Handle nested objects (like traceability.derivedFrom)
    else if (typeof value === 'object' && value !== null) {
      extractReferences(value, currentPath, refs);
    }
  }

  return refs;
}

/**
 * Normalize artifact type to canonical form
 * e.g., "ProjectCharter" -> "project-charter", "PM-CHARTER" -> "project-charter"
 */
function normalizeArtifactType(type: string): string {
  // Convert to lowercase and hyphenated
  const normalized = type
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');

  // Check if it's already a canonical type
  if (artifactInputRules.rules[normalized as keyof typeof artifactInputRules.rules]) {
    return normalized;
  }

  // Check aliases
  for (const [canonical, aliases] of Object.entries(artifactInputRules.typeAliases)) {
    if (aliases.includes(type) || aliases.includes(normalized)) {
      return canonical;
    }
  }

  return normalized;
}

/**
 * Validate that referenced document type is allowed as input
 */
function validateInputType(
  documentType: string,
  referencedType: string,
  field: string
): { valid: boolean; message?: string } {
  const normalizedDocType = normalizeArtifactType(documentType);
  const normalizedRefType = normalizeArtifactType(referencedType);

  // Only validate derivedFrom field (input validation)
  if (field !== 'derivedFrom') {
    return { valid: true };
  }

  const rules =
    artifactInputRules.rules[normalizedDocType as keyof typeof artifactInputRules.rules];

  if (!rules) {
    // Unknown artifact type, skip validation
    return { valid: true };
  }

  // Check if it's a continuous input artifact (Risk Register, ADR)
  if ('continuousInputs' in rules && rules.continuousInputs) {
    // These artifacts accept inputs from any layer, no strict validation
    return { valid: true };
  }

  const allowedInputs: string[] = rules.inputs || [];

  if (allowedInputs.length === 0) {
    // No inputs allowed (e.g., Project Charter)
    return {
      valid: false,
      message: `${documentType} should not have derivedFrom references (starting point artifact)`,
    };
  }

  if (!allowedInputs.includes(normalizedRefType)) {
    const allowedList = allowedInputs.join(', ');
    return {
      valid: false,
      message: `${documentType} can only derive from [${allowedList}], but found ${referencedType}`,
    };
  }

  return { valid: true };
}

/**
 * Detect circular references using DFS
 */
function detectCircularReferences(
  documentId: string,
  references: Map<string, string[]>,
  visited: Set<string> = new Set(),
  path: string[] = []
): string[] | null {
  if (visited.has(documentId)) {
    // Found a cycle
    return [...path, documentId];
  }

  visited.add(documentId);
  path.push(documentId);

  const refs = references.get(documentId) || [];
  for (const refId of refs) {
    const cycle = detectCircularReferences(refId, references, new Set(visited), [...path]);
    if (cycle) {
      return cycle;
    }
  }

  return null;
}

/**
 * Validate reference integrity for a single document
 */
export function validateReferences(
  document: Record<string, unknown>,
  documentIndex: DocumentIndex
): ReferenceValidationResult {
  const errors: ReferenceValidationError[] = [];
  const documentId = document.id as string;
  const documentType = (document['@type'] as string) || (document.type as string);

  if (!documentId || typeof documentId !== 'string') {
    return {
      valid: false,
      errors: [
        {
          type: 'invalid-format',
          field: 'id',
          documentId: 'unknown',
          referencedId: '',
          message: 'Document must have a valid string "id" field',
          path: '/id',
        },
      ],
    };
  }

  // Extract all references from the document
  const references = extractReferences(document);

  // Check each reference exists in the index and validate input types
  for (const ref of references) {
    const referencedDoc = documentIndex[ref.id];

    if (!referencedDoc) {
      errors.push({
        type: 'missing-reference',
        field: ref.field,
        documentId,
        referencedId: ref.id,
        message: `Referenced document "${ref.id}" does not exist`,
        path: `/${ref.path}`,
      });
    } else if (documentType) {
      // Validate input type
      const referencedType = referencedDoc.type;
      const typeValidation = validateInputType(documentType, referencedType, ref.field);

      if (!typeValidation.valid) {
        errors.push({
          type: 'invalid-input-type',
          field: ref.field,
          documentId,
          referencedId: ref.id,
          message: typeValidation.message || 'Invalid input type',
          path: `/${ref.path}`,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate reference integrity across multiple documents
 */
export async function validateReferencesAcrossDocuments(
  documents: Array<Record<string, unknown>>,
  documentIndex: DocumentIndex,
  options: {
    projectRoot?: string;
    skipTerminology?: boolean;
  } = {}
): Promise<ReferenceValidationResult> {
  const errors: ReferenceValidationError[] = [];
  const references = new Map<string, string[]>();

  // First pass: collect all references
  for (const doc of documents) {
    const docId = doc.id as string;
    if (!docId) {
      continue;
    }

    const refs = extractReferences(doc);
    references.set(
      docId,
      refs.map((r) => r.id)
    );

    // Validate individual document references
    const result = validateReferences(doc, documentIndex);
    errors.push(...result.errors);

    // Validate terminology references (ADR-009)
    if (!options.skipTerminology) {
      const termResult = await validateTermReferences(doc, {
        projectRoot: options.projectRoot,
        skipTerminology: options.skipTerminology,
      });
      errors.push(...termResult.errors);
    }
  }

  // Second pass: detect circular references
  for (const docId of references.keys()) {
    const cycle = detectCircularReferences(docId, references);
    if (cycle) {
      errors.push({
        type: 'circular-reference',
        field: 'traceability',
        documentId: docId,
        referencedId: cycle.join(' → '),
        message: `Circular reference detected: ${cycle.join(' → ')}`,
        path: '/traceability',
      });
    }
  }

  return {
    valid: errors.filter((e) => e.severity !== 'warning' && e.severity !== 'info').length === 0,
    errors,
  };
}

/**
 * Build document index from file paths
 */
export async function buildDocumentIndex(filePaths: string[]): Promise<DocumentIndex> {
  const index: DocumentIndex = {};

  for (const filePath of filePaths) {
    try {
      const content = await Bun.file(filePath).text();
      const parsed: unknown = JSON.parse(content);

      // Type guard: ensure parsed is an object
      if (typeof parsed !== 'object' || parsed === null) {
        continue;
      }

      const doc = parsed as Record<string, unknown>;

      if (typeof doc.id === 'string') {
        index[doc.id] = {
          filePath,
          type: typeof doc['@type'] === 'string' ? doc['@type'] : 'unknown',
        };
      }
    } catch {
      // Skip invalid files
    }
  }

  return index;
}

// ========================================
// Terminology Reference Validation (ADR-009)
// ========================================

export interface TermReference {
  path: string;
  fieldName: string;
  termId: string;
  dataType?: string;
  constraints?: {
    required?: boolean;
    unique?: boolean;
  };
}

export interface DataDictionary {
  id: string;
  type: string;
  terms: Array<{
    id: string;
    term: string;
    canonicalName?: string;
    dataType?: string;
    domain?: string;
    layer?: string;
    constraints?: {
      required?: boolean;
      unique?: boolean;
      minLength?: number;
      maxLength?: number;
    };
    synonyms?: string[];
    deprecated?: boolean;
    replacedBy?: string;
  }>;
}

/**
 * Extract termReference fields from a document recursively
 */
function extractTermReferences(obj: unknown, path: string = ''): TermReference[] {
  const refs: TermReference[] = [];

  if (typeof obj !== 'object' || obj === null) {
    return refs;
  }

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;

    if (key === 'termReference' && typeof value === 'string') {
      // Get parent object to extract field information
      const parentObj = obj as Record<string, unknown>;

      refs.push({
        path: currentPath,
        fieldName: (parentObj.name as string) || (parentObj.term as string) || 'unknown',
        termId: value,
        dataType:
          (parentObj.dataType as string | undefined) || (parentObj.type as string | undefined),
        constraints: parentObj.constraints as TermReference['constraints'],
      });
    } else if (typeof value === 'object' && value !== null) {
      refs.push(...extractTermReferences(value, currentPath));
    }
  }

  return refs;
}

/**
 * Find Data Dictionary file in project
 */
async function findDataDictionary(projectRoot: string): Promise<string | null> {
  // Common locations for data-dictionary.json
  const searchPaths = [
    join(projectRoot, 'layer2-requirements', 'data-dictionary.json'),
    join(projectRoot, 'data-dictionary.json'),
  ];

  for (const searchPath of searchPaths) {
    try {
      await Bun.file(searchPath).text();
      return searchPath;
    } catch {
      // File doesn't exist, continue
    }
  }

  // Recursive search in subdirectories
  try {
    const entries = await readdir(projectRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const subPath = join(projectRoot, entry.name);
        const found = await findDataDictionary(subPath);
        if (found) {
          return found;
        }
      } else if (entry.isFile() && entry.name === 'data-dictionary.json') {
        return join(projectRoot, entry.name);
      }
    }
  } catch {
    // Permission error or other issue
  }

  return null;
}

/**
 * Load Data Dictionary from file
 */
async function loadDataDictionary(filePath: string): Promise<DataDictionary | null> {
  try {
    const content = await Bun.file(filePath).text();
    const parsed: unknown = JSON.parse(content);

    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }

    const dict = parsed as Record<string, unknown>;

    if (!dict.terms || !Array.isArray(dict.terms)) {
      return null;
    }

    // Runtime validation passed, safe to cast
    return dict as unknown as DataDictionary;
  } catch {
    return null;
  }
}

/**
 * Validate terminology references in a document
 */
export async function validateTermReferences(
  data: unknown,
  options: {
    projectRoot?: string;
    dataDictionaryPath?: string;
    skipTerminology?: boolean;
  } = {}
): Promise<ReferenceValidationResult> {
  const errors: ReferenceValidationError[] = [];

  // Skip if explicitly disabled
  if (options.skipTerminology) {
    return { valid: true, errors: [] };
  }

  // Type guard
  if (typeof data !== 'object' || data === null) {
    return { valid: true, errors: [] };
  }

  const doc = data as Record<string, unknown>;
  const documentId = (doc.id as string) || 'unknown';

  // Load Data Dictionary
  let dictPath = options.dataDictionaryPath;
  if (!dictPath && options.projectRoot) {
    const foundPath = await findDataDictionary(options.projectRoot);
    if (foundPath) {
      dictPath = foundPath;
    }
  }

  if (!dictPath) {
    // No Data Dictionary found - this is OK, terminology validation is optional
    return { valid: true, errors: [] };
  }

  const dictionary = await loadDataDictionary(dictPath);
  if (!dictionary) {
    // Could not load dictionary - skip validation
    return { valid: true, errors: [] };
  }

  // Extract term references
  const termRefs = extractTermReferences(data);

  // Validate each term reference
  for (const ref of termRefs) {
    const term = dictionary.terms.find((t) => t.id === ref.termId);

    // 1. Check if term exists
    if (!term) {
      errors.push({
        type: 'missing-term-reference',
        field: 'termReference',
        documentId,
        referencedId: ref.termId,
        message: `Term '${ref.termId}' not found in Data Dictionary`,
        path: `/${ref.path}`,
        severity: 'error',
      });
      continue;
    }

    // 2. Check if term is deprecated
    if (term.deprecated) {
      const replacement = term.replacedBy ? ` Use '${term.replacedBy}' instead.` : '';
      errors.push({
        type: 'deprecated-term-used',
        field: ref.fieldName,
        documentId,
        referencedId: ref.termId,
        message: `Term '${term.term}' (${ref.termId}) is deprecated.${replacement}`,
        path: `/${ref.path}`,
        severity: 'warning',
      });
    }

    // 3. Check data type consistency
    if (ref.dataType && term.dataType && ref.dataType !== term.dataType) {
      errors.push({
        type: 'term-type-mismatch',
        field: ref.fieldName,
        documentId,
        referencedId: ref.termId,
        message: `Type mismatch: field type '${ref.dataType}' does not match term type '${term.dataType}'`,
        path: `/${ref.path}`,
        severity: 'error',
      });
    }

    // 4. Check constraint consistency
    if (ref.constraints && term.constraints) {
      if (term.constraints.required && !ref.constraints.required) {
        errors.push({
          type: 'term-constraint-violation',
          field: ref.fieldName,
          documentId,
          referencedId: ref.termId,
          message: `Field '${ref.fieldName}' should be required according to term definition`,
          path: `/${ref.path}`,
          severity: 'warning',
        });
      }

      if (term.constraints.unique && !ref.constraints.unique) {
        errors.push({
          type: 'term-constraint-violation',
          field: ref.fieldName,
          documentId,
          referencedId: ref.termId,
          message: `Field '${ref.fieldName}' should have unique constraint according to term definition`,
          path: `/${ref.path}`,
          severity: 'warning',
        });
      }
    }
  }

  // 5. Check if field names use synonyms instead of canonical names
  for (const term of dictionary.terms) {
    if (!term.synonyms || term.synonyms.length === 0) {
      continue;
    }

    // Search for synonym usage in field names (simple text search)
    const docStr = JSON.stringify(data);
    for (const synonym of term.synonyms) {
      if (docStr.includes(`"${synonym}"`)) {
        errors.push({
          type: 'synonym-used',
          field: synonym,
          documentId,
          referencedId: term.id,
          message: `Found synonym '${synonym}', consider using canonical term '${term.term}' (${term.id})`,
          path: '/document',
          severity: 'info',
        });
      }
    }
  }

  return {
    valid: errors.filter((e) => e.severity === 'error').length === 0,
    errors,
  };
}
