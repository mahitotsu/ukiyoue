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

export interface ReferenceValidationError {
  type: 'missing-reference' | 'circular-reference' | 'invalid-format' | 'invalid-input-type';
  field: string;
  documentId: string;
  referencedId: string;
  message: string;
  path: string;
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
export function validateReferencesAcrossDocuments(
  documents: Array<Record<string, unknown>>,
  documentIndex: DocumentIndex
): ReferenceValidationResult {
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
    valid: errors.length === 0,
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
