import Ajv, { type ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import chalk from 'chalk';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { basename, dirname, join, resolve } from 'path';

interface ValidateOptions {
  schema?: string;
  verbose?: boolean;
}

/**
 * Validate JSON document against JSON Schema
 */
export async function validate(file: string, options: ValidateOptions): Promise<void> {
  try {
    // Load JSON file
    const filePath = resolve(file);
    const json = JSON.parse(readFileSync(filePath, 'utf-8'));

    console.log(chalk.blue(`Validating: ${filePath}`));

    // Determine schema path
    let schemaPath: string;
    if (options.schema) {
      schemaPath = resolve(options.schema);
    } else {
      // Auto-detect schema based on document type
      schemaPath = await detectSchemaPath(json, filePath);
    }

    console.log(chalk.gray(`Schema: ${schemaPath}`));

    // Load schema
    const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));

    // Create Ajv instance with strict mode
    const ajv = new Ajv({
      allErrors: true,
      strict: true,
      verbose: options.verbose,
    });
    addFormats(ajv);

    // Load dependent schemas (for $ref resolution)
    await loadDependentSchemas(ajv, schemaPath, schema);

    // Compile schema once
    const validateFn = ajv.compile(schema);

    // If JSON is an array, validate each item
    let isValid: boolean;
    if (Array.isArray(json)) {
      isValid = json.every((item) => validateFn(item));
      // Collect all errors from array validation
      if (!isValid && validateFn.errors) {
        // Ajv's errors array contains errors from all validations
        // We need to limit to meaningful errors
      }
    } else {
      isValid = validateFn(json);
    }

    if (isValid) {
      console.log(chalk.green('✓ Validation successful'));

      // Check $IMPORT references
      const importErrors = checkImportReferences(json, filePath);
      if (importErrors.length > 0) {
        console.log(chalk.red('\n✗ $IMPORT reference errors:\n'));
        for (const error of importErrors) {
          console.log(chalk.red(`  ${error.field}: ${error.message}`));
          console.log(chalk.gray(`    Reference: ${error.reference}`));
          console.log(chalk.gray(`    Expected path: ${error.expectedPath}`));
        }
        process.exit(1);
      }

      process.exit(0);
    } else {
      console.log(chalk.red('✗ Validation failed\n'));
      printErrors(validateFn.errors || [], options.verbose || false);
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
}

/**
 * Auto-detect schema path based on document type
 */
async function detectSchemaPath(json: unknown, filePath: string): Promise<string> {
  // Find project root by looking for schemas directory
  // Start from the file's directory and go up
  let currentDir = dirname(filePath);
  let schemasDir = '';

  // Try to find schemas directory (max 5 levels up)
  for (let i = 0; i < 5; i++) {
    const candidatePath = join(currentDir, 'schemas');
    if (existsSync(candidatePath)) {
      schemasDir = candidatePath;
      break;
    }
    const parentDir = resolve(currentDir, '..');
    if (parentDir === currentDir) break; // Reached root
    currentDir = parentDir;
  }

  // If not found, try from tools directory (fallback)
  if (!schemasDir) {
    // Try relative to the current module
    const toolsDir = resolve(dirname(new URL(import.meta.url).pathname), '../..');
    const toolsSchemaPath = resolve(toolsDir, '../schemas');
    if (existsSync(toolsSchemaPath)) {
      schemasDir = toolsSchemaPath;
    } else {
      throw new Error('Could not locate schemas directory');
    }
  }

  // Check if it's a typed document (check both "type" and "@type")
  if (typeof json === 'object' && json !== null) {
    const type = ('type' in json ? json.type : null) || ('@type' in json ? json['@type'] : null);

    if (typeof type === 'string') {
      // Map type to schema file
      const typeSchemaMap: Record<string, string> = {
        BusinessRequirements: 'types/business-requirements.schema.json',
        Stakeholder: 'components/stakeholder.schema.json',
        Requirement: 'components/requirement.schema.json',
        UseCase: 'components/use-case.schema.json',
      };

      if (type in typeSchemaMap) {
        return resolve(schemasDir, typeSchemaMap[type]);
      }
    }
  }

  // Check by filename pattern
  const filename = basename(filePath);
  if (filename === 'stakeholders.json') {
    // Array of stakeholders
    return resolve(schemasDir, 'components/stakeholder.schema.json');
  }
  if (filename === 'use-cases.json') {
    return resolve(schemasDir, 'components/use-case.schema.json');
  }
  if (filename.includes('requirements')) {
    return resolve(schemasDir, 'components/requirement.schema.json');
  }

  // Default to base schema
  return resolve(schemasDir, 'document-base.schema.json');
}

/**
 * Print validation errors in human-readable format
 */
function printErrors(errors: ErrorObject[], verbose: boolean): void {
  for (const error of errors) {
    const path = error.instancePath || '(root)';
    const keyword = error.keyword;
    const message = error.message || 'Unknown error';

    console.log(chalk.red(`  ${path}:`));
    console.log(chalk.gray(`    ${keyword}: ${message}`));

    if (verbose && error.params) {
      console.log(chalk.gray(`    params: ${JSON.stringify(error.params)}`));
    }

    if (error.data !== undefined && verbose) {
      console.log(chalk.gray(`    data: ${JSON.stringify(error.data, null, 2)}`));
    }

    console.log(); // Empty line between errors
  }

  console.log(chalk.yellow(`Total errors: ${errors.length}`));
}

/**
 * Load dependent schemas for $ref resolution
 */
async function loadDependentSchemas(
  ajv: Ajv,
  schemaPath: string,
  mainSchema: unknown
): Promise<void> {
  const schemasDir = resolve(dirname(schemaPath), '..');
  const mainSchemaId =
    typeof mainSchema === 'object' && mainSchema !== null && '$id' in mainSchema
      ? (mainSchema.$id as string)
      : null;

  // Load document-base.schema.json
  const baseSchemaPath = join(schemasDir, 'document-base.schema.json');
  if (existsSync(baseSchemaPath)) {
    const baseSchema = JSON.parse(readFileSync(baseSchemaPath, 'utf-8'));
    // Check if schema is already added and not the main schema
    if (baseSchema.$id && baseSchema.$id !== mainSchemaId && !ajv.getSchema(baseSchema.$id)) {
      ajv.addSchema(baseSchema);
    }
  }

  // Load all component schemas
  const componentsDir = join(schemasDir, 'components');
  if (existsSync(componentsDir)) {
    const files = readdirSync(componentsDir);
    for (const file of files) {
      if (file.endsWith('.schema.json')) {
        const componentPath = join(componentsDir, file);
        const componentSchema = JSON.parse(readFileSync(componentPath, 'utf-8'));
        // Check if schema is already added and not the main schema
        if (
          componentSchema.$id &&
          componentSchema.$id !== mainSchemaId &&
          !ajv.getSchema(componentSchema.$id)
        ) {
          ajv.addSchema(componentSchema);
        }
      }
    }
  }
}

interface ImportError {
  field: string;
  reference: string;
  expectedPath: string;
  message: string;
}

/**
 * Check $IMPORT references and verify referenced files exist
 */
function checkImportReferences(json: unknown, documentPath: string): ImportError[] {
  const errors: ImportError[] = [];
  const documentDir = dirname(documentPath);
  const importPattern = /^\$IMPORT\((.+\.json)\)$/;

  function checkObject(obj: unknown, path: string = ''): void {
    if (typeof obj !== 'object' || obj === null) {
      return;
    }

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        checkObject(item, `${path}[${index}]`);
      });
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof value === 'string') {
        const match = value.match(importPattern);
        if (match) {
          const filename = match[1];
          const expectedPath = resolve(documentDir, filename);

          if (!existsSync(expectedPath)) {
            errors.push({
              field: currentPath,
              reference: value,
              expectedPath,
              message: `Referenced file does not exist`,
            });
          }
        }
      } else if (typeof value === 'object') {
        checkObject(value, currentPath);
      }
    }
  }

  checkObject(json);
  return errors;
}
