#!/usr/bin/env bun
import { Command } from 'commander';
import { checkLinks } from './commands/check-links.js';
import { consistencyCheck } from './commands/consistency-check.js';
import { validate } from './commands/validate.js';

const program = new Command();

program.name('ukiyoue').description('CLI tools for Ukiyoue framework').version('0.1.0');

program
  .command('validate')
  .description('Validate JSON document against JSON Schema')
  .argument('<file>', 'JSON file to validate')
  .option('-s, --schema <path>', 'Custom schema path')
  .option('-v, --verbose', 'Verbose output')
  .action(validate);

program
  .command('check-links')
  .description('Check cross-references between documents')
  .argument('<directory>', 'Directory containing JSON files')
  .option('-v, --verbose', 'Verbose output')
  .action(checkLinks);

program
  .command('consistency-check')
  .description('Check consistency and completeness of documents')
  .argument('<directory>', 'Directory containing JSON files')
  .option('-v, --verbose', 'Verbose output including informational items')
  .action(consistencyCheck);

program.parse();
