#!/usr/bin/env bun
/**
 * Minimal JSON Schema Validator for Ukiyoue Framework
 *
 * Usage:
 *   bun tools/src/validate-minimal.ts <schema-path> <document-path>
 *
 * Example:
 *   bun tools/src/validate-minimal.ts \
 *     schemas/layer1/project-charter.json \
 *     examples/templates/project-charter.json
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { resolve, basename, dirname } from 'path';
import chalk from 'chalk';

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error(chalk.red('❌ Error: Missing arguments'));
  console.log(chalk.yellow('\nUsage:'));
  console.log(chalk.cyan('  bun tools/src/validate-minimal.ts <schema-path> <document-path>'));
  console.log(chalk.yellow('\nExample:'));
  console.log(chalk.cyan('  bun tools/src/validate-minimal.ts \\'));
  console.log(chalk.cyan('    schemas/layer1/project-charter.json \\'));
  console.log(chalk.cyan('    examples/templates/project-charter.json'));
  process.exit(1);
}

const schemaPath = resolve(args[0]);
const dataPath = resolve(args[1]);

try {
  // Load schema
  console.log(chalk.blue('📋 Loading schema...'));
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
  console.log(chalk.green(`✅ Schema loaded: ${basename(schemaPath)}`));

  // Load document
  console.log(chalk.blue('📄 Loading document...'));
  const data = JSON.parse(readFileSync(dataPath, 'utf8'));
  console.log(chalk.green(`✅ Document loaded: ${basename(dataPath)}`));

  // Create validator with strict settings
  console.log(chalk.blue('🔍 Validating...'));
  const ajv = new Ajv({
    allErrors: true, // Report all errors, not just the first one
    strict: true, // Strict mode for schema validation
    verbose: true, // Include schema and data in errors
  });
  addFormats(ajv); // Add format validation (uri, date-time, etc.)

  // Load _common.json if it exists (for $ref resolution)
  try {
    const commonPath = resolve(dirname(schemaPath), '../_common.json');
    const commonSchema = JSON.parse(readFileSync(commonPath, 'utf8'));
    ajv.addSchema(commonSchema);
    console.log(chalk.blue('📚 Common definitions loaded'));
  } catch {
    // _common.json not found or not needed, continue
  }

  const validate = ajv.compile(schema);

  // Validate
  if (validate(data)) {
    console.log(chalk.green.bold('\n✅ Valid'));
    console.log(chalk.gray('Document conforms to schema'));
    process.exit(0);
  } else {
    console.log(chalk.red.bold('\n❌ Validation errors:'));

    if (validate.errors) {
      validate.errors.forEach((error, index) => {
        console.log(chalk.yellow(`\n[Error ${index + 1}]`));
        console.log(chalk.red(`  Path:     ${error.instancePath || '/'}`));
        console.log(chalk.red(`  Message:  ${error.message}`));

        if (error.params && Object.keys(error.params).length > 0) {
          console.log(chalk.gray(`  Params:   ${JSON.stringify(error.params)}`));
        }

        if (error.keyword) {
          console.log(chalk.gray(`  Keyword:  ${error.keyword}`));
        }
      });
    }

    console.log(chalk.red.bold(`\nTotal errors: ${validate.errors?.length || 0}`));
    process.exit(1);
  }
} catch (error) {
  console.error(chalk.red.bold('\n❌ Fatal error:'));
  if (error instanceof Error) {
    console.error(chalk.red(error.message));
    if (error.stack) {
      console.error(chalk.gray(error.stack));
    }
  } else {
    console.error(chalk.red(String(error)));
  }
  process.exit(1);
}
