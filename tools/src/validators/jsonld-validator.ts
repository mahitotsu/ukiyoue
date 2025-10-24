/**
 * JSON-LD Validator for Ukiyoue Framework
 *
 * Validates JSON-LD documents:
 * - Checks @context validity and accessibility
 * - Validates JSON-LD 1.1 compliance (ADR-003)
 * - Performs expansion to verify semantic correctness
 * - Detects common JSON-LD errors
 *
 * Satisfies: ADR-003 (JSON-LD 1.1), FR-AUTO-002 (metadata-validator component)
 */

import { getSemanticsDir } from '@ukiyoue/semantics';
import * as jsonld from 'jsonld';

export interface JsonLdValidationError {
  type:
    | 'missing-context'
    | 'invalid-context'
    | 'expansion-error'
    | 'invalid-type'
    | 'network-error';
  field: string;
  message: string;
  path: string;
  details?: unknown;
}

export interface JsonLdValidationResult {
  valid: boolean;
  errors: JsonLdValidationError[];
  expandedDocument?: jsonld.NodeObject[];
}

export interface JsonLdValidationOptions {
  /** Allow remote context loading (default: false for security) */
  allowRemoteContexts?: boolean;
  /** Custom document loader for @context resolution */
  documentLoader?: jsonld.DocumentLoader;
  /** Validate expansion (default: true) */
  validateExpansion?: boolean;
  /** Expected @type value (optional) */
  expectedType?: string;
}

/**
 * Default document loader that prevents remote context loading
 */
const secureDocumentLoader: jsonld.DocumentLoader = async (url: string) => {
  throw new Error(
    `Remote context loading is disabled for security. URL: ${url}\n` +
      'Please use local context files or enable allowRemoteContexts option.'
  );
};

/**
 * Create a document loader that resolves local contexts
 * Uses @ukiyoue/semantics package to locate context files
 */
export function createLocalDocumentLoader(
  contextBaseUrl: string,
  allowRemote = false
): jsonld.DocumentLoader {
  const semanticsDir = getSemanticsDir();

  return async (url: string) => {
    // If it's a local Ukiyoue context, load from file system
    if (url.startsWith(contextBaseUrl)) {
      // Extract relative path after base URL
      // e.g., "https://ukiyoue.example.org/contexts/base.jsonld" -> "base.jsonld"
      const relativePath = url.substring(contextBaseUrl.length);
      // Context files are in semantics/context/ directory
      const filePath = `${semanticsDir}/context/${relativePath}`;

      try {
        const content = await Bun.file(filePath).text();
        return {
          contextUrl: undefined,
          document: JSON.parse(content),
          documentUrl: url,
        };
      } catch (error) {
        throw new Error(`Failed to load local context: ${url}\nPath: ${filePath}\n${error}`);
      }
    }

    // Also support legacy single "context" path (without trailing slash for backwards compatibility)
    if (url.includes('ukiyoue.example.org/context/')) {
      const match = url.match(/\/context\/(.+\.jsonld)$/);
      if (match) {
        const fileName = match[1];
        const filePath = `${semanticsDir}/context/${fileName}`;

        try {
          const content = await Bun.file(filePath).text();
          return {
            contextUrl: undefined,
            document: JSON.parse(content),
            documentUrl: url,
          };
        } catch (error) {
          throw new Error(`Failed to load local context: ${url}\nPath: ${filePath}\n${error}`);
        }
      }
    }

    // For other URLs, either allow remote or throw error
    if (allowRemote) {
      // Fetch remote URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch remote context: ${url}`);
      }
      const document = await response.json();
      return {
        contextUrl: undefined,
        document,
        documentUrl: url,
      };
    }

    throw new Error(`Context URL not in allowed local base: ${url}`);
  };
}

/**
 * Validate JSON-LD document structure
 */
export async function validateJsonLd(
  document: unknown,
  options: JsonLdValidationOptions = {}
): Promise<JsonLdValidationResult> {
  const errors: JsonLdValidationError[] = [];

  // Check if document is an object
  if (typeof document !== 'object' || document === null) {
    return {
      valid: false,
      errors: [
        {
          type: 'invalid-context',
          field: 'document',
          message: 'Document must be a JSON object',
          path: '/',
        },
      ],
    };
  }

  const doc = document as Record<string, unknown>;

  // Check @context field existence
  if (!doc['@context']) {
    errors.push({
      type: 'missing-context',
      field: '@context',
      message: 'Document must have @context field for JSON-LD compliance',
      path: '/@context',
    });
  }

  // Check @type field existence (recommended)
  if (!doc['@type']) {
    errors.push({
      type: 'invalid-type',
      field: '@type',
      message: 'Document should have @type field for semantic clarity',
      path: '/@type',
    });
  } else if (options.expectedType && doc['@type'] !== options.expectedType) {
    errors.push({
      type: 'invalid-type',
      field: '@type',
      message: `Expected @type "${options.expectedType}" but got "${doc['@type']}"`,
      path: '/@type',
    });
  }

  // If basic structure is invalid, return early
  if (errors.length > 0 && !doc['@context']) {
    return { valid: false, errors };
  }

  // Validate expansion (tests semantic correctness)
  if (options.validateExpansion !== false) {
    try {
      const documentLoader = options.documentLoader || secureDocumentLoader;

      const expanded = await jsonld.expand(doc, {
        documentLoader,
        // JSON-LD 1.1 compliance (ADR-003)
        processingMode: 'json-ld-1.1',
      });

      // Check if expansion resulted in valid output
      if (!expanded || expanded.length === 0) {
        errors.push({
          type: 'expansion-error',
          field: '@context',
          message: 'Document expansion resulted in empty output',
          path: '/',
        });
      }

      return {
        valid: errors.length === 0,
        errors,
        expandedDocument: expanded,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Determine error type
      let errorType: JsonLdValidationError['type'] = 'expansion-error';
      if (errorMessage.includes('loading remote context') || errorMessage.includes('network')) {
        errorType = 'network-error';
      } else if (errorMessage.includes('context')) {
        errorType = 'invalid-context';
      }

      errors.push({
        type: errorType,
        field: '@context',
        message: `JSON-LD expansion failed: ${errorMessage}`,
        path: '/@context',
        details: error,
      });

      return {
        valid: false,
        errors,
      };
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate that @context uses JSON-LD 1.1 features (ADR-003)
 */
export function validateJsonLd11Context(context: unknown): JsonLdValidationError[] {
  const errors: JsonLdValidationError[] = [];

  if (typeof context !== 'object' || context === null) {
    return errors; // Context validation will be handled by expansion
  }

  const ctx = context as Record<string, unknown>;

  // Check for @version: 1.1 (recommended for JSON-LD 1.1)
  if (ctx['@version'] !== 1.1) {
    errors.push({
      type: 'invalid-context',
      field: '@version',
      message: 'Context should specify @version: 1.1 for JSON-LD 1.1 compliance (ADR-003)',
      path: '/@context/@version',
    });
  }

  return errors;
}
