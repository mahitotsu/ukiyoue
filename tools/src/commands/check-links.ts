import chalk from 'chalk';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

interface CheckLinksOptions {
  verbose?: boolean;
}

interface DocumentIndex {
  stakeholders: Set<string>;
  useCases: Set<string>;
  requirements: Set<string>;
  files: Map<string, string>; // ID -> file path
}

interface Reference {
  file: string;
  path: string;
  targetId: string;
  targetType: 'stakeholder' | 'useCase' | 'requirement';
}

/**
 * Check cross-references between documents
 */
export async function checkLinks(directory: string, options: CheckLinksOptions): Promise<void> {
  try {
    const dirPath = resolve(directory);
    console.log(chalk.blue(`Checking links in: ${dirPath}\n`));

    // Index all IDs
    const index = await buildIndex(dirPath);

    if (options.verbose) {
      console.log(chalk.gray(`Found ${index.stakeholders.size} stakeholders`));
      console.log(chalk.gray(`Found ${index.useCases.size} use cases`));
      console.log(chalk.gray(`Found ${index.requirements.size} requirements\n`));
    }

    // Collect all references
    const references = await collectReferences(dirPath);

    if (options.verbose) {
      console.log(chalk.gray(`Found ${references.length} references\n`));
    }

    // Validate references
    const brokenLinks: Reference[] = [];
    for (const ref of references) {
      let exists = false;
      switch (ref.targetType) {
        case 'stakeholder':
          exists = index.stakeholders.has(ref.targetId);
          break;
        case 'useCase':
          exists = index.useCases.has(ref.targetId);
          break;
        case 'requirement':
          exists = index.requirements.has(ref.targetId);
          break;
      }

      if (!exists) {
        brokenLinks.push(ref);
      }
    }

    // Report results
    if (brokenLinks.length === 0) {
      console.log(chalk.green('✓ All links are valid'));
      process.exit(0);
    } else {
      console.log(chalk.red(`✗ Found ${brokenLinks.length} broken links\n`));
      printBrokenLinks(brokenLinks);
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
}

/**
 * Build index of all IDs in the directory
 */
async function buildIndex(dirPath: string): Promise<DocumentIndex> {
  const index: DocumentIndex = {
    stakeholders: new Set(),
    useCases: new Set(),
    requirements: new Set(),
    files: new Map(),
  };

  const files = getAllJsonFiles(dirPath);

  for (const file of files) {
    try {
      const content = JSON.parse(readFileSync(file, 'utf-8'));

      // Index stakeholders
      if (Array.isArray(content) && content[0]?.id?.startsWith('SH-')) {
        for (const item of content) {
          if (item.id) {
            index.stakeholders.add(item.id);
            index.files.set(item.id, file);
          }
        }
      }

      // Index use cases
      if (Array.isArray(content) && content[0]?.id?.startsWith('UC-')) {
        for (const item of content) {
          if (item.id) {
            index.useCases.add(item.id);
            index.files.set(item.id, file);
          }
        }
      }

      // Index requirements
      if (Array.isArray(content) && content[0]?.id?.match(/^(FR|NFR)-/)) {
        for (const item of content) {
          if (item.id) {
            index.requirements.add(item.id);
            index.files.set(item.id, file);
          }
        }
      }

      // Index single items
      if (typeof content === 'object' && content !== null && 'id' in content) {
        const id = content.id as string;
        if (id.startsWith('SH-')) {
          index.stakeholders.add(id);
          index.files.set(id, file);
        } else if (id.startsWith('UC-')) {
          index.useCases.add(id);
          index.files.set(id, file);
        } else if (id.match(/^(FR|NFR)-/)) {
          index.requirements.add(id);
          index.files.set(id, file);
        }
      }
    } catch (error) {
      // Skip invalid JSON files
      continue;
    }
  }

  return index;
}

/**
 * Collect all references from documents
 */
async function collectReferences(dirPath: string): Promise<Reference[]> {
  const references: Reference[] = [];
  const files = getAllJsonFiles(dirPath);

  for (const file of files) {
    try {
      const content = JSON.parse(readFileSync(file, 'utf-8'));
      extractReferences(content, file, '', references);
    } catch (error) {
      // Skip invalid JSON files
      continue;
    }
  }

  return references;
}

/**
 * Extract references from JSON object recursively
 */
function extractReferences(
  obj: unknown,
  file: string,
  path: string,
  references: Reference[]
): void {
  if (typeof obj !== 'object' || obj === null) {
    return;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      extractReferences(item, file, `${path}[${index}]`, references);
    });
    return;
  }

  // Check for relationship fields
  const relationshipFields = [
    'stakeholderIds',
    'relatedStakeholders',
    'stakeholders', // Also check "stakeholders" field
    'useCaseIds',
    'relatedUseCases',
    'requirementIds',
    'implements',
    'dependsOn',
    'dependencies', // Also check "dependencies" field
    'relatedTo',
    'relatedRequirements', // Also check "relatedRequirements"
    'conflicts',
  ];
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;

    if (relationshipFields.includes(key) && Array.isArray(value)) {
      for (const id of value) {
        if (typeof id === 'string') {
          references.push({
            file,
            path: currentPath,
            targetId: id,
            targetType: getIdType(id),
          });
        }
      }
    } else if (typeof value === 'object') {
      extractReferences(value, file, currentPath, references);
    }
  }
}

/**
 * Determine ID type from ID string
 */
function getIdType(id: string): 'stakeholder' | 'useCase' | 'requirement' {
  if (id.startsWith('SH-')) return 'stakeholder';
  if (id.startsWith('UC-')) return 'useCase';
  return 'requirement'; // FR-, NFR-
}

/**
 * Get all JSON files in directory recursively
 */
function getAllJsonFiles(dirPath: string): string[] {
  const files: string[] = [];
  const items = readdirSync(dirPath);

  for (const item of items) {
    const fullPath = join(dirPath, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllJsonFiles(fullPath));
    } else if (item.endsWith('.json')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Print broken links in human-readable format
 */
function printBrokenLinks(brokenLinks: Reference[]): void {
  // Group by file
  const byFile = new Map<string, Reference[]>();
  for (const link of brokenLinks) {
    const refs = byFile.get(link.file) || [];
    refs.push(link);
    byFile.set(link.file, refs);
  }

  for (const [file, refs] of byFile) {
    console.log(chalk.yellow(file));
    for (const ref of refs) {
      console.log(chalk.red(`  ${ref.path}: ${ref.targetType} "${ref.targetId}" not found`));
    }
    console.log();
  }
}
