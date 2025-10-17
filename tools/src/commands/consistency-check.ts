import chalk from 'chalk';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

interface ConsistencyCheckOptions {
  verbose?: boolean;
}

interface DocumentIndex {
  stakeholders: Map<string, StakeholderInfo>;
  actors: Map<string, ActorInfo>;
  useCases: Map<string, UseCaseInfo>;
  requirements: Map<string, RequirementInfo>;
}

interface StakeholderInfo {
  id: string;
  file: string;
  actors: string[]; // Actor IDs this stakeholder may play
}

interface ActorInfo {
  id: string;
  file: string;
  usedInUseCases: string[];
  relatedStakeholders: string[];
}

interface UseCaseInfo {
  id: string;
  file: string;
  actor: string;
  relatedRequirements: string[];
  preconditions: string[]; // UC IDs referenced via $REF
}

interface RequirementInfo {
  id: string;
  file: string;
  priority?: string;
  relatedUseCases: string[]; // UCs that reference this requirement
}

interface Issue {
  level: 'warning' | 'info';
  category: string;
  message: string;
  location?: string;
}

/**
 * Check consistency and completeness of documents
 */
export async function consistencyCheck(
  directory: string,
  options: ConsistencyCheckOptions
): Promise<void> {
  try {
    const dirPath = resolve(directory);
    console.log(chalk.blue(`Checking consistency in: ${dirPath}\n`));

    // Build index
    const index = await buildIndex(dirPath);

    if (options.verbose) {
      console.log(chalk.gray(`Found ${index.stakeholders.size} stakeholders`));
      console.log(chalk.gray(`Found ${index.actors.size} actors`));
      console.log(chalk.gray(`Found ${index.useCases.size} use cases`));
      console.log(chalk.gray(`Found ${index.requirements.size} requirements\n`));
    }

    // Run checks
    const issues: Issue[] = [];

    checkUnusedStakeholders(index, issues);
    checkUseCaseRequirementCoverage(index, issues);
    checkRequirementUseCaseCoverage(index, issues);
    checkCircularDependencies(index, issues);

    // Report results
    if (issues.length === 0) {
      console.log(chalk.green('✓ No consistency issues found'));
      process.exit(0);
    } else {
      const warnings = issues.filter((i) => i.level === 'warning');
      const infos = issues.filter((i) => i.level === 'info');

      if (warnings.length > 0) {
        console.log(chalk.yellow(`⚠ Found ${warnings.length} warnings\n`));
        printIssues(warnings);
      }

      if (infos.length > 0) {
        console.log(chalk.blue(`ℹ Found ${infos.length} informational items\n`));
        if (options.verbose) {
          printIssues(infos);
        }
      }

      console.log(chalk.gray('\nThese are warnings only. Commit is allowed.'));
      process.exit(0); // Exit with 0 to allow commit
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
}

/**
 * Build index of all documents
 */
async function buildIndex(dirPath: string): Promise<DocumentIndex> {
  const index: DocumentIndex = {
    stakeholders: new Map(),
    actors: new Map(),
    useCases: new Map(),
    requirements: new Map(),
  };

  const files = getAllJsonFiles(dirPath);

  for (const file of files) {
    try {
      const content = JSON.parse(readFileSync(file, 'utf-8'));

      // Index stakeholders
      if (Array.isArray(content) && content[0]?.id?.startsWith('SH-')) {
        for (const item of content) {
          index.stakeholders.set(item.id, {
            id: item.id,
            file,
            actors: item.actors || [],
          });
        }
      }

      // Index actors
      if (Array.isArray(content) && content[0]?.id?.startsWith('ACT-')) {
        for (const item of content) {
          index.actors.set(item.id, {
            id: item.id,
            file,
            usedInUseCases: [],
            relatedStakeholders: item.relatedStakeholders || [],
          });
        }
      }

      // Index use cases
      if (Array.isArray(content) && content[0]?.id?.startsWith('UC-')) {
        for (const item of content) {
          const preconditions = extractPreconditionRefs(item.preconditions || []);
          index.useCases.set(item.id, {
            id: item.id,
            file,
            actor: item.actor,
            relatedRequirements: item.relatedRequirements || [],
            preconditions,
          });
        }
      }

      // Index requirements
      if (Array.isArray(content) && content[0]?.id?.match(/^(FR|NFR)-/)) {
        for (const item of content) {
          index.requirements.set(item.id, {
            id: item.id,
            file,
            priority: item.priority,
            relatedUseCases: [],
          });
        }
      }
    } catch (error) {
      continue;
    }
  }

  // Build reverse mappings
  buildReverseMappings(index);

  return index;
}

/**
 * Extract UC IDs from preconditions array
 */
function extractPreconditionRefs(preconditions: unknown[]): string[] {
  const refs: string[] = [];
  for (const pre of preconditions) {
    if (typeof pre === 'object' && pre !== null && '$REF' in pre) {
      const refId = (pre as { $REF: string }).$REF;
      if (refId.startsWith('UC-')) {
        refs.push(refId);
      }
    }
  }
  return refs;
}

/**
 * Build reverse mappings (who uses whom)
 */
function buildReverseMappings(index: DocumentIndex): void {
  // Map actors to use cases
  for (const uc of index.useCases.values()) {
    const actor = index.actors.get(uc.actor);
    if (actor) {
      actor.usedInUseCases.push(uc.id);
    }
  }

  // Map requirements to use cases
  for (const uc of index.useCases.values()) {
    for (const reqId of uc.relatedRequirements) {
      const req = index.requirements.get(reqId);
      if (req) {
        req.relatedUseCases.push(uc.id);
      }
    }
  }
}

/**
 * Check for unused actors
 */
function checkUnusedStakeholders(index: DocumentIndex, issues: Issue[]): void {
  // Check actors
  for (const actor of index.actors.values()) {
    if (actor.usedInUseCases.length === 0) {
      issues.push({
        level: 'warning',
        category: 'Unused Actor',
        message: `Actor "${actor.id}" is not used in any use case`,
        location: actor.file,
      });
    }
  }

  // Check stakeholders without actors (they should not interact with system)
  for (const sh of index.stakeholders.values()) {
    if (sh.actors.length === 0) {
      issues.push({
        level: 'info',
        category: 'Stakeholder Without Actor Role',
        message: `Stakeholder "${sh.id}" has no actor roles (does not directly interact with the system)`,
        location: sh.file,
      });
    }
  }
}

/**
 * Check if all use cases have related requirements
 */
function checkUseCaseRequirementCoverage(index: DocumentIndex, issues: Issue[]): void {
  for (const uc of index.useCases.values()) {
    if (uc.relatedRequirements.length === 0) {
      issues.push({
        level: 'warning',
        category: 'Missing Requirements',
        message: `Use case "${uc.id}" has no related requirements (relatedRequirements is empty)`,
        location: uc.file,
      });
    }
  }
}

/**
 * Check if all requirements are referenced by use cases
 */
function checkRequirementUseCaseCoverage(index: DocumentIndex, issues: Issue[]): void {
  for (const req of index.requirements.values()) {
    // Skip non-functional requirements (cross-cutting concerns)
    if (req.id.startsWith('NFR-')) {
      continue;
    }

    // Check if this requirement or its parent is referenced
    const isCovered = req.relatedUseCases.length > 0 || isChildRequirementCovered(req.id, index);

    if (!isCovered) {
      issues.push({
        level: 'warning',
        category: 'Orphaned Requirement',
        message: `Requirement "${req.id}" is not referenced by any use case (neither directly nor via parent)`,
        location: req.file,
      });
    }
  }
}

/**
 * Check if a child requirement is covered via its parent
 * E.g., FR-001-01 is covered if FR-001 is referenced
 */
function isChildRequirementCovered(reqId: string, index: DocumentIndex): boolean {
  // Extract parent ID (e.g., FR-001-01 -> FR-001)
  const parentMatch = reqId.match(/^(FR|NFR)-([A-Z0-9]+)-\d{2}$/);
  if (!parentMatch) {
    return false; // Not a child requirement
  }

  const parentId = `${parentMatch[1]}-${parentMatch[2]}`;
  const parent = index.requirements.get(parentId);

  return parent ? parent.relatedUseCases.length > 0 : false;
}

/**
 * Check for circular dependencies in use case preconditions
 */
function checkCircularDependencies(index: DocumentIndex, issues: Issue[]): void {
  for (const uc of index.useCases.values()) {
    const visited = new Set<string>();
    const path: string[] = [];

    if (hasCircularDependency(uc.id, index, visited, path)) {
      issues.push({
        level: 'warning',
        category: 'Circular Dependency',
        message: `Use case "${uc.id}" has circular precondition dependency: ${path.join(' → ')}`,
        location: uc.file,
      });
    }
  }
}

/**
 * Detect circular dependency using DFS
 */
function hasCircularDependency(
  ucId: string,
  index: DocumentIndex,
  visited: Set<string>,
  path: string[]
): boolean {
  if (path.includes(ucId)) {
    path.push(ucId);
    return true;
  }

  if (visited.has(ucId)) {
    return false;
  }

  visited.add(ucId);
  path.push(ucId);

  const uc = index.useCases.get(ucId);
  if (uc) {
    for (const preId of uc.preconditions) {
      if (hasCircularDependency(preId, index, visited, [...path])) {
        return true;
      }
    }
  }

  path.pop();
  return false;
}

/**
 * Get all JSON files recursively
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
 * Print issues in human-readable format
 */
function printIssues(issues: Issue[]): void {
  // Group by category
  const byCategory = new Map<string, Issue[]>();
  for (const issue of issues) {
    const list = byCategory.get(issue.category) || [];
    list.push(issue);
    byCategory.set(issue.category, list);
  }

  for (const [category, list] of byCategory) {
    console.log(chalk.bold(category));
    for (const issue of list) {
      const levelIcon = issue.level === 'warning' ? '⚠' : 'ℹ';
      console.log(
        `  ${levelIcon} ${issue.message}${issue.location ? chalk.gray(` (${issue.location})`) : ''}`
      );
    }
    console.log();
  }
}
