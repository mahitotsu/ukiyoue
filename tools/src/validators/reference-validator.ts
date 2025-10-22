/**
 * Reference Validator for Ukiyoue Framework
 *
 * Validates traceability reference integrity:
 * - Checks that all referenced document IDs exist
 * - Detects circular references
 * - Validates relatedDocuments, derivedFrom, satisfies fields
 *
 * Satisfies: FR-AUTO-002 (link-checker component)
 */

export interface ReferenceValidationError {
  type: 'missing-reference' | 'circular-reference' | 'invalid-format';
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

  // Check each reference exists in the index
  for (const ref of references) {
    if (!documentIndex[ref.id]) {
      errors.push({
        type: 'missing-reference',
        field: ref.field,
        documentId,
        referencedId: ref.id,
        message: `Referenced document "${ref.id}" does not exist`,
        path: `/${ref.path}`,
      });
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
