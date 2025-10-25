#!/usr/bin/env bun
/**
 * Comprehensive Validator for Ukiyoue Framework
 *
 * Validates Ukiyoue JSON documents with:
 * 1. JSON Schema validation (ADR-002: Draft-07)
 * 2. Traceability reference integrity (FR-AUTO-002: link-checker)
 * 3. JSON-LD semantic validation (ADR-003: JSON-LD 1.1)
 *
 * Usage:
 *   bun tools/src/validate.ts <document-path> [options]
 *   bun tools/src/validate.ts <directory-path> [options]
 *
 * Options:
 *   --skip-schema        Skip JSON Schema validation
 *   --skip-references    Skip reference integrity checks
 *   --skip-jsonld        Skip JSON-LD validation
 *   --skip-shacl         Skip SHACL validation (when --full-validation is used)
 *   --full-validation    Enable all validations including SHACL (slow, recommended for CI/CD)
 *   --allow-remote       Allow remote @context loading (security: disabled by default)
 *   --schema <path>      Explicit schema file path
 *   --verbose            Show detailed validation output
 *
 * Examples:
 *   # Validate single document (all checks)
 *   bun tools/src/validate.ts examples/project-charter.json
 *
 *   # Validate directory (all checks)
 *   bun tools/src/validate.ts examples/
 *
 *   # Schema validation only
 *   bun tools/src/validate.ts examples/project-charter.json --skip-references --skip-jsonld
 *
 *   # Skip JSON-LD validation
 *   bun tools/src/validate.ts examples/ --skip-jsonld
 *
 *   # Full validation including SHACL (CI/CD recommended)
 *   bun tools/src/validate.ts examples/ --full-validation
 */

import { getSchemasDir } from '@ukiyoue/schemas';
import chalk from 'chalk';
import { existsSync, lstatSync, readdirSync, readFileSync } from 'fs';
import { basename, dirname, extname, join, resolve } from 'path';
import {
  createLocalDocumentLoader,
  validateJsonLd,
  validateJsonLd11Context,
} from './validators/jsonld-validator.js';
import { buildDocumentIndex, validateReferences } from './validators/reference-validator.js';
import { validateSchema } from './validators/schema-validator.js';
import { validateShacl } from './validators/shacl-validator.js';

// Parse command line arguments
interface CliOptions {
  skipSchema: boolean;
  skipReferences: boolean;
  skipJsonLd: boolean;
  skipShacl: boolean;
  fullValidation: boolean;
  allowRemote: boolean;
  schemaPath?: string;
  verbose: boolean;
}

function parseArgs(): { paths: string[]; options: CliOptions } {
  const args = process.argv.slice(2);
  const paths: string[] = [];
  const options: CliOptions = {
    skipSchema: false,
    skipReferences: false,
    skipJsonLd: false,
    skipShacl: false,
    fullValidation: false,
    allowRemote: false,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) {
      continue;
    }

    if (arg === '--skip-schema') {
      options.skipSchema = true;
    } else if (arg === '--skip-references') {
      options.skipReferences = true;
    } else if (arg === '--skip-jsonld') {
      options.skipJsonLd = true;
    } else if (arg === '--skip-shacl') {
      options.skipShacl = true;
    } else if (arg === '--full-validation') {
      options.fullValidation = true;
    } else if (arg === '--allow-remote') {
      options.allowRemote = true;
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg === '--schema') {
      options.schemaPath = args[++i];
    } else if (!arg.startsWith('--')) {
      paths.push(arg);
    }
  }

  return { paths, options };
}

// Collect all JSON files from a directory
function collectJsonFiles(path: string): string[] {
  const files: string[] = [];

  if (lstatSync(path).isFile()) {
    if (extname(path) === '.json') {
      files.push(path);
    }
    return files;
  }

  // Directory: recursively collect JSON files
  const entries = readdirSync(path, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(path, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectJsonFiles(fullPath));
    } else if (entry.isFile() && extname(entry.name) === '.json') {
      files.push(fullPath);
    }
  }

  return files;
}

// Infer schema path from document type
function inferSchemaPath(document: Record<string, unknown>): string | null {
  const type = document['@type'];
  if (typeof type !== 'string') {
    return null;
  }

  // Convert PascalCase to kebab-case
  const kebab = type
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .slice(1);

  // Use @ukiyoue/schemas package to get schemas directory
  const schemaBase = getSchemasDir();
  const layers = ['layer1', 'layer2', 'layer3', 'layer4', 'layer5', 'layer6'];

  for (const layer of layers) {
    const schemaPath = join(schemaBase, layer, `${kebab}.json`);
    if (existsSync(schemaPath)) {
      return schemaPath;
    }
  }

  return null;
}

// Main validation function
async function validateDocument(
  filePath: string,
  options: CliOptions,
  documentIndex?: Record<string, { filePath: string; type: string }>,
  projectRoot?: string
): Promise<boolean> {
  console.log(chalk.blue(`\n📄 Validating: ${basename(filePath)}`));

  let document: Record<string, unknown>;
  try {
    const content = readFileSync(filePath, 'utf8');
    const parsed: unknown = JSON.parse(content);
    if (typeof parsed !== 'object' || parsed === null) {
      console.error(chalk.red('❌ Parsed JSON is not an object'));
      return false;
    }
    document = parsed as Record<string, unknown>;
  } catch (error) {
    console.error(chalk.red(`❌ Failed to parse JSON: ${error}`));
    return false;
  }

  let hasErrors = false;

  // 1. JSON Schema Validation
  if (!options.skipSchema) {
    console.log(chalk.blue('  🔍 JSON Schema validation...'));

    const schemaPath = options.schemaPath || inferSchemaPath(document);
    if (!schemaPath) {
      console.log(chalk.yellow('  ⚠️  Schema not found, skipping schema validation'));
    } else {
      if (options.verbose) {
        console.log(chalk.gray(`     Schema: ${schemaPath}`));
      }

      try {
        const schemaText = readFileSync(schemaPath, 'utf8');
        const schema = JSON.parse(schemaText) as object;

        // Use schema-validator
        const result = validateSchema(schema, document, schemaPath, {
          allErrors: true,
          strict: true,
          verbose: options.verbose,
          loadCommonSchema: true,
        });

        if (result.valid) {
          console.log(chalk.green('  ✅ Schema validation passed'));
        } else {
          console.log(chalk.red('  ❌ Schema validation failed:'));
          // Show schema location relative to package if in node_modules
          const displayPath = schemaPath.includes('node_modules')
            ? schemaPath.substring(schemaPath.indexOf('node_modules'))
            : schemaPath;
          console.log(chalk.gray(`     Schema: ${displayPath}`));
          result.errors.forEach((error, index) => {
            console.log(chalk.red(`     [${index + 1}] ${error.path}: ${error.message}`));
            if (options.verbose && error.params) {
              console.log(chalk.gray(`         Details: ${JSON.stringify(error.params)}`));
            }
          });
          console.log(
            chalk.yellow(
              `     💡 Tip: Check schema in @ukiyoue/schemas package or use --verbose for details`
            )
          );
          hasErrors = true;
        }
      } catch (error) {
        console.error(chalk.red(`  ❌ Schema validation error: ${error}`));
        hasErrors = true;
      }
    }
  }

  // 2. Reference Integrity Validation
  if (!options.skipReferences && documentIndex) {
    console.log(chalk.blue('  🔗 Reference integrity validation...'));

    const result = validateReferences(document, documentIndex);
    if (result.valid) {
      console.log(chalk.green('  ✅ Reference validation passed'));
    } else {
      console.log(chalk.red('  ❌ Reference validation failed:'));
      result.errors.forEach((error, index) => {
        console.log(chalk.red(`     [${index + 1}] ${error.path}: ${error.message}`));
        if (options.verbose) {
          console.log(
            chalk.gray(`         Type: ${error.type}, Referenced: ${error.referencedId}`)
          );
        }
      });
      hasErrors = true;
    }
  }

  // 3. JSON-LD Validation
  if (!options.skipJsonLd) {
    console.log(chalk.blue('  🌐 JSON-LD validation...'));

    try {
      const documentLoader = createLocalDocumentLoader(
        'https://ukiyoue.example.org/contexts/',
        options.allowRemote
      );

      const result = await validateJsonLd(document, {
        allowRemoteContexts: options.allowRemote,
        documentLoader,
        validateExpansion: true,
      });

      // Check JSON-LD 1.1 context
      if (document['@context'] && typeof document['@context'] === 'object') {
        const contextErrors = validateJsonLd11Context(document['@context']);
        result.errors.push(...contextErrors);
      }

      if (result.valid) {
        console.log(chalk.green('  ✅ JSON-LD validation passed'));
        if (options.verbose && result.expandedDocument) {
          console.log(
            chalk.gray(`     Expanded: ${JSON.stringify(result.expandedDocument, null, 2)}`)
          );
        }
      } else {
        console.log(chalk.red('  ❌ JSON-LD validation failed:'));
        result.errors.forEach((error, index) => {
          console.log(chalk.red(`     [${index + 1}] ${error.path}: ${error.message}`));
          if (options.verbose && error.details) {
            console.log(chalk.gray(`         ${JSON.stringify(error.details)}`));
          }
        });
        hasErrors = true;
      }
    } catch (error) {
      console.error(chalk.red(`  ❌ JSON-LD validation error: ${error}`));
      hasErrors = true;
    }
  }

  // 4. SHACL Validation (optional, enabled with --full-validation)
  if (options.fullValidation && !options.skipShacl && projectRoot) {
    console.log(chalk.blue('  📊 SHACL validation...'));

    try {
      const result = await validateShacl(document, {
        documentIndexPath: projectRoot,
        verbose: options.verbose,
      });

      if (result.valid) {
        console.log(chalk.green('  ✅ SHACL validation passed'));
      } else {
        console.log(chalk.red('  ❌ SHACL validation failed:'));
        result.errors.forEach((error, index) => {
          console.log(chalk.red(`     [${index + 1}] ${error}`));
        });
        if (options.verbose) {
          console.log(
            chalk.gray(`     💡 SHACL validates graph-wide integrity and type constraints`)
          );
        }
        hasErrors = true;
      }
    } catch (error) {
      console.error(chalk.red(`  ❌ SHACL validation error: ${error}`));
      hasErrors = true;
    }
  }

  return !hasErrors;
}

// Main entry point
async function main() {
  const { paths, options } = parseArgs();

  if (paths.length === 0) {
    console.error(chalk.red('❌ Error: No file or directory specified'));
    console.log(chalk.yellow('\nUsage:'));
    console.log(chalk.cyan('  bun tools/src/validate.ts <path> [options]'));
    console.log(chalk.yellow('\nOptions:'));
    console.log(chalk.cyan('  --skip-schema        Skip JSON Schema validation'));
    console.log(chalk.cyan('  --skip-references    Skip reference integrity checks'));
    console.log(chalk.cyan('  --skip-jsonld        Skip JSON-LD validation'));
    console.log(
      chalk.cyan('  --skip-shacl         Skip SHACL validation (when --full-validation is used)')
    );
    console.log(
      chalk.cyan('  --full-validation    Enable all validations including SHACL (slow, CI/CD)')
    );
    console.log(chalk.cyan('  --allow-remote       Allow remote @context loading (security risk)'));
    console.log(chalk.cyan('  --schema <path>      Explicit schema file path'));
    console.log(
      chalk.cyan('  --verbose            Show detailed output (schema paths, error details)')
    );
    console.log(chalk.yellow('\nExamples:'));
    console.log(chalk.gray('  # Validate a single file'));
    console.log(chalk.cyan('  bun tools/src/validate.ts document.json'));
    console.log(chalk.gray('\n  # Validate a directory'));
    console.log(chalk.cyan('  bun tools/src/validate.ts layer1-business/'));
    console.log(chalk.gray('\n  # Skip JSON-LD validation (faster)'));
    console.log(chalk.cyan('  bun tools/src/validate.ts layer1-business/ --skip-jsonld'));
    console.log(chalk.gray('\n  # Full validation with SHACL (CI/CD recommended)'));
    console.log(chalk.cyan('  bun tools/src/validate.ts layer1-business/ --full-validation'));
    console.log(chalk.gray('\n  # Verbose mode with detailed errors'));
    console.log(chalk.cyan('  bun tools/src/validate.ts document.json --verbose'));
    process.exit(1);
  }

  console.log(chalk.bold.blue('🎨 Ukiyoue Framework Validator\n'));

  const targetPath = resolve(paths[0]!);
  if (!existsSync(targetPath)) {
    console.error(chalk.red(`❌ Error: Path not found: ${targetPath}`));
    process.exit(1);
  }

  const files = collectJsonFiles(targetPath);
  if (files.length === 0) {
    console.error(chalk.red(`❌ Error: No JSON files found in: ${targetPath}`));
    process.exit(1);
  }

  console.log(chalk.blue(`📁 Found ${files.length} JSON file(s)\n`));

  // Determine project root for SHACL validation
  const projectRoot = lstatSync(targetPath).isDirectory() ? targetPath : dirname(targetPath);

  // Build document index for reference validation
  let documentIndex: Record<string, { filePath: string; type: string }> | undefined;
  if (!options.skipReferences) {
    console.log(chalk.blue('🔨 Building document index...'));
    documentIndex = await buildDocumentIndex(files);
    console.log(chalk.green(`✅ Indexed ${Object.keys(documentIndex).length} document(s)\n`));
  }

  // Show SHACL validation status
  if (options.fullValidation && !options.skipShacl) {
    console.log(
      chalk.yellow(
        `⚠️  Full validation mode: SHACL validation enabled (slower, graph-wide integrity)`
      )
    );
    console.log(chalk.gray(`   Project root: ${projectRoot}\n`));
  }

  // Validate each file
  const results = await Promise.all(
    files.map((file) => validateDocument(file, options, documentIndex, projectRoot))
  );

  const successCount = results.filter((r) => r).length;
  const failCount = results.length - successCount;

  console.log(chalk.bold.blue(`\n${'='.repeat(60)}`));
  if (failCount === 0) {
    console.log(chalk.green.bold(`✅ All ${successCount} file(s) validated successfully`));
    process.exit(0);
  } else {
    console.log(chalk.red.bold(`❌ ${failCount} file(s) failed validation`));
    console.log(chalk.green(`✅ ${successCount} file(s) passed validation`));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(chalk.red.bold('\n❌ Fatal error:'));
  console.error(chalk.red(error));
  process.exit(1);
});
