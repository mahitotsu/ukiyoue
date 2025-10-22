/**
 * JSON Schema Validator for Ukiyoue Framework
 *
 * Validates JSON documents against JSON Schema Draft-07:
 * - Schema compliance validation
 * - Format validation (uri, date-time, etc.)
 * - Common definitions resolution ($ref)
 * - Detailed error reporting
 *
 * Satisfies: ADR-002 (JSON Schema Draft-07), FR-AUTO-002 (schema-validator component)
 */

import type { ErrorObject } from 'ajv';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';

export interface SchemaValidationError {
  type: 'schema-error' | 'validation-error' | 'file-error';
  path: string;
  message: string;
  keyword?: string;
  params?: Record<string, unknown>;
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: SchemaValidationError[];
}

export interface SchemaValidationOptions {
  /** Report all errors, not just the first one (default: true) */
  allErrors?: boolean;
  /** Strict mode for schema validation (default: true) */
  strict?: boolean;
  /** Include verbose error information (default: true) */
  verbose?: boolean;
  /** Load common definitions from _common.json (default: true) */
  loadCommonSchema?: boolean;
  /** Path to common schema file (default: auto-detect from schema path) */
  commonSchemaPath?: string;
}

/**
 * Convert Ajv ErrorObject to SchemaValidationError
 */
function convertAjvError(error: ErrorObject): SchemaValidationError {
  return {
    type: 'validation-error',
    path: error.instancePath || '/',
    message: error.message || 'Unknown validation error',
    keyword: error.keyword,
    params: error.params as Record<string, unknown>,
  };
}

/**
 * Create configured Ajv instance
 */
function createAjvInstance(options: SchemaValidationOptions): Ajv {
  const ajv = new Ajv({
    allErrors: options.allErrors !== false,
    strict: options.strict !== false,
    verbose: options.verbose !== false,
  });

  // Add format validation (uri, date-time, email, etc.)
  addFormats(ajv);

  return ajv;
}

/**
 * Load common schema definitions if available
 */
function loadCommonSchema(ajv: Ajv, schemaPath: string, options: SchemaValidationOptions): void {
  if (options.loadCommonSchema === false) {
    return;
  }

  try {
    const commonPath = options.commonSchemaPath || resolve(dirname(schemaPath), '../_common.json');
    const commonSchema = JSON.parse(readFileSync(commonPath, 'utf8'));
    ajv.addSchema(commonSchema);
  } catch {
    // _common.json not found or not needed, continue without it
  }
}

/**
 * Validate JSON document against JSON Schema
 */
export function validateSchema(
  schema: object,
  document: unknown,
  schemaPath?: string,
  options: SchemaValidationOptions = {}
): SchemaValidationResult {
  const errors: SchemaValidationError[] = [];

  try {
    // Create Ajv instance
    const ajv = createAjvInstance(options);

    // Load common schema if path is provided
    if (schemaPath) {
      loadCommonSchema(ajv, schemaPath, options);
    }

    // Compile schema
    const validate = ajv.compile(schema);

    // Validate document
    if (validate(document)) {
      return { valid: true, errors: [] };
    }

    // Convert Ajv errors to our format
    if (validate.errors) {
      errors.push(...validate.errors.map(convertAjvError));
    }

    return { valid: false, errors };
  } catch (error) {
    // Schema compilation or validation error
    errors.push({
      type: 'schema-error',
      path: '/',
      message: error instanceof Error ? error.message : String(error),
    });

    return { valid: false, errors };
  }
}

/**
 * Validate JSON document from file paths
 */
export function validateSchemaFromFiles(
  schemaPath: string,
  documentPath: string,
  options: SchemaValidationOptions = {}
): SchemaValidationResult {
  const errors: SchemaValidationError[] = [];

  try {
    // Load schema
    const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));

    // Load document
    const document = JSON.parse(readFileSync(documentPath, 'utf8'));

    // Validate
    return validateSchema(schema, document, schemaPath, options);
  } catch (error) {
    // File loading or parsing error
    errors.push({
      type: 'file-error',
      path: '/',
      message: error instanceof Error ? error.message : String(error),
    });

    return { valid: false, errors };
  }
}
