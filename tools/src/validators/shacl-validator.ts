/**
 * SHACL Validator for Ukiyoue JSON-LD documents
 *
 * Validates RDF graph structure and ontology-level constraints using SHACL shapes.
 */

import { DataFactory, Parser, Store } from 'n3';
import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import SHACLValidator from 'rdf-validate-shacl';

export interface ShaclValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ShaclValidationOptions {
  shapesPath?: string;
  documentIndexPath?: string; // Directory to scan for all documents
  verbose?: boolean;
}

interface DocumentIndex {
  [id: string]: {
    type: string;
    filePath: string;
  };
}

/**
 * Parse Turtle file into RDF Store
 */
async function parseTurtleFile(filePath: string): Promise<Store> {
  const content = await readFile(filePath, 'utf-8');
  const parser = new Parser({ format: 'text/turtle' });
  const store = new Store();

  return new Promise((resolve, reject) => {
    parser.parse(content, (error, quad, _prefixes) => {
      if (error) {
        reject(error);
      } else if (quad) {
        store.addQuad(quad);
      } else {
        // Parsing complete
        resolve(store);
      }
    });
  });
}

/**
 * Build document index by scanning directory for JSON files
 */
async function buildDocumentIndex(dirPath: string): Promise<DocumentIndex> {
  const index: DocumentIndex = {};

  async function scanDirectory(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        await scanDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        try {
          const content = await readFile(fullPath, 'utf-8');
          const doc = JSON.parse(content) as Record<string, unknown>;

          if (doc.id && doc.type && typeof doc.id === 'string' && typeof doc.type === 'string') {
            index[doc.id] = {
              type: doc.type,
              filePath: fullPath,
            };
          }
        } catch {
          // Ignore invalid JSON files
        }
      }
    }
  }

  await scanDirectory(dirPath);
  return index;
}

/**
 * Convert JSON-LD document to RDF Store
 */
async function jsonLdToStore(data: unknown, documentIndex?: DocumentIndex): Promise<Store> {
  const store = new Store();
  const processedIds = new Set<string>();

  async function addDocumentToStore(doc: Record<string, unknown>): Promise<void> {
    const type = doc.type as string;
    const id = doc.id as string;

    // Skip if already processed
    if (processedIds.has(id)) {
      return;
    }
    processedIds.add(id);

    // Create type triple
    const subject = DataFactory.namedNode(`https://ukiyoue.example.org/artifact/${id}`);
    const rdfType = DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    // Convert kebab-case to PascalCase for class name
    const className =
      type.charAt(0).toUpperCase() +
      type.slice(1).replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase());
    const object = DataFactory.namedNode(`https://ukiyoue.example.org/vocab#${className}`);
    store.addQuad(DataFactory.quad(subject, rdfType, object));

    // Add derivedFrom triples if present (check both doc.derivedFrom and doc.traceability.derivedFrom)
    let derivedFrom: string[] = [];
    if ('derivedFrom' in doc && Array.isArray(doc.derivedFrom)) {
      derivedFrom = doc.derivedFrom as string[];
    } else if (
      'traceability' in doc &&
      typeof doc.traceability === 'object' &&
      doc.traceability !== null
    ) {
      const traceability = doc.traceability as Record<string, unknown>;
      if ('derivedFrom' in traceability && Array.isArray(traceability.derivedFrom)) {
        derivedFrom = traceability.derivedFrom as string[];
      }
    }

    if (derivedFrom.length > 0) {
      const derivedFromPred = DataFactory.namedNode(
        'https://ukiyoue.example.org/vocab#derivedFrom'
      );
      for (const ref of derivedFrom) {
        if (typeof ref === 'string') {
          const refObj = DataFactory.namedNode(`https://ukiyoue.example.org/artifact/${ref}`);
          store.addQuad(DataFactory.quad(subject, derivedFromPred, refObj));

          // Add type information for referenced document if available in index
          if (documentIndex && documentIndex[ref]) {
            const refType = documentIndex[ref].type;
            const refClassName =
              refType.charAt(0).toUpperCase() +
              refType.slice(1).replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase());
            const refClassNode = DataFactory.namedNode(
              `https://ukiyoue.example.org/vocab#${refClassName}`
            );
            const refSubject = DataFactory.namedNode(`https://ukiyoue.example.org/artifact/${ref}`);
            store.addQuad(DataFactory.quad(refSubject, rdfType, refClassNode));

            // Recursively load referenced document
            try {
              const refContent = await readFile(documentIndex[ref].filePath, 'utf-8');
              const refDoc = JSON.parse(refContent) as Record<string, unknown>;
              await addDocumentToStore(refDoc);
            } catch {
              // Ignore errors loading referenced documents
            }
          }
        }
      }
    }
  }

  // Parse JSON-LD (simplified - proper implementation would use jsonld.js)
  if (typeof data === 'object' && data !== null && 'type' in data) {
    const doc = data as Record<string, unknown>;
    await addDocumentToStore(doc);
  }

  return store;
}

/**
 * Validate JSON-LD document against SHACL shapes
 */
export async function validateShacl(
  data: unknown,
  options: ShaclValidationOptions = {}
): Promise<ShaclValidationResult> {
  const errors: string[] = [];

  try {
    // Determine shapes file path
    const shapesPath =
      options.shapesPath ||
      resolve(import.meta.dir, '../../../schemas/shacl/artifact-constraints.ttl');

    if (options.verbose) {
      console.log(`Loading SHACL shapes from: ${shapesPath}`);
    }

    // Load SHACL shapes
    const shapesGraph = await parseTurtleFile(shapesPath);

    // Build document index if path provided
    let documentIndex: DocumentIndex | undefined;
    if (options.documentIndexPath) {
      if (options.verbose) {
        console.log(`Building document index from: ${options.documentIndexPath}`);
      }
      documentIndex = await buildDocumentIndex(options.documentIndexPath);
      if (options.verbose) {
        console.log(`Document index built: ${Object.keys(documentIndex).length} documents`);
      }
    }

    // Convert JSON-LD document to RDF store
    const dataGraph = await jsonLdToStore(data, documentIndex);

    if (options.verbose) {
      console.log(
        `Data graph has ${dataGraph.size} triples, shapes graph has ${shapesGraph.size} triples`
      );
    }

    // Validate using SHACL
    const validator = new SHACLValidator(shapesGraph);
    const report = await validator.validate(dataGraph);

    if (!report.conforms) {
      // Extract validation errors
      for (const result of report.results) {
        const message = result.message?.[0]?.value || 'SHACL constraint violation';
        const focusNode = result.focusNode?.value || 'unknown';
        const path = result.path?.value || 'unknown';
        errors.push(`${message} (focus: ${focusNode}, path: ${path})`);
      }
    }

    return {
      valid: report.conforms,
      errors,
    };
  } catch (error) {
    errors.push(
      `SHACL validation error: ${error instanceof Error ? error.message : String(error)}`
    );
    return {
      valid: false,
      errors,
    };
  }
}

/**
 * Check if SHACL validation is available
 */
export function isShaclAvailable(): boolean {
  try {
    // Assume SHACL is available if this module loads
    return true;
  } catch {
    return false;
  }
}
