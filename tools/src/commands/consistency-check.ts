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
  acceptanceCriteria?: string[];
  metrics?: {
    targetValue?: string;
    unit?: string;
  };
  testCases?: string[];
  estimatedEffort?: {
    value?: number;
    unit?: string;
  };
  title?: string;
  description?: string;
}

interface Issue {
  level: 'warning' | 'info' | 'error';
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

    // Existing checks
    checkUnusedStakeholders(index, issues);
    checkUseCaseRequirementCoverage(index, issues);
    checkRequirementUseCaseCoverage(index, issues);
    checkCircularDependencies(index, issues);

    // New content checks
    checkCompleteness(index, issues);
    checkNamingConventions(index, issues);
    checkMetricsValidity(index, issues);

    // Report results
    if (issues.length === 0) {
      console.log(chalk.green('✓ No consistency issues found'));
      process.exit(0);
    } else {
      const errors = issues.filter((i) => i.level === 'error');
      const warnings = issues.filter((i) => i.level === 'warning');
      const infos = issues.filter((i) => i.level === 'info');

      if (errors.length > 0) {
        console.log(chalk.red(`✗ Found ${errors.length} errors\n`));
        printIssues(errors);
      }

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

      if (errors.length > 0) {
        console.log(chalk.red('\nErrors found. Please fix before committing.'));
        process.exit(1);
      } else {
        console.log(chalk.gray('\nThese are warnings only. Commit is allowed.'));
        process.exit(0); // Exit with 0 to allow commit
      }
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
            acceptanceCriteria: item.acceptanceCriteria,
            metrics: item.metrics,
            testCases: item.testCases,
            estimatedEffort: item.estimatedEffort,
            title: item.title,
            description: item.description,
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
 * Check completeness of documents
 */
function checkCompleteness(index: DocumentIndex, issues: Issue[]): void {
  // Check if all actors have at least one use case (already done by checkUnusedStakeholders)
  // But we can add more checks here

  // Check if all use cases have relatedRequirements
  for (const [ucId, uc] of index.useCases) {
    if (!uc.relatedRequirements || uc.relatedRequirements.length === 0) {
      issues.push({
        level: 'warning',
        category: 'Completeness',
        message: `Use case "${ucId}" has no related requirements`,
        location: uc.file,
      });
    }
  }

  // Check if all stakeholders have actors or are documented as non-system users
  for (const [, sh] of index.stakeholders) {
    if (!sh.actors || sh.actors.length === 0) {
      // This is already handled by checkUnusedStakeholders as info
      // Skip here to avoid duplication
    }
  }

  // Check if requirements have acceptance criteria
  for (const [reqId, req] of index.requirements) {
    if (!req.acceptanceCriteria || req.acceptanceCriteria.length === 0) {
      issues.push({
        level: 'info',
        category: 'Completeness',
        message: `Requirement "${reqId}" has no acceptance criteria`,
        location: req.file,
      });
    }
  }

  // Check if critical requirements have test cases
  for (const [reqId, req] of index.requirements) {
    if (req.priority === 'critical') {
      if (!req.testCases || req.testCases.length === 0) {
        issues.push({
          level: 'warning',
          category: 'Completeness',
          message: `Critical requirement "${reqId}" has no test cases`,
          location: req.file,
        });
      }
    }
  }
}

/**
 * Check naming conventions and terminology consistency
 */
function checkNamingConventions(index: DocumentIndex, issues: Issue[]): void {
  // Check for common terminology variations
  for (const [reqId, req] of index.requirements) {
    if (!req.title || !req.description) continue;

    const text = (req.title + ' ' + req.description).toLowerCase();

    // Check for common variations
    const variations = [
      { canonical: '予約登録', variants: ['予約作成', '新規予約', '予約追加'] },
      { canonical: '予約変更', variants: ['予約更新', '予約修正', '予約編集'] },
      { canonical: '予約キャンセル', variants: ['予約削除', '予約取消'] },
    ];

    for (const { canonical, variants } of variations) {
      for (const variant of variants) {
        if (text.includes(variant.toLowerCase())) {
          issues.push({
            level: 'info',
            category: 'Naming Convention',
            message: `Requirement "${reqId}" uses "${variant}" instead of preferred term "${canonical}"`,
            location: req.file,
          });
        }
      }
    }
  }

  // Check for very short titles or descriptions
  for (const [reqId, req] of index.requirements) {
    if (req.title && req.title.length < 5) {
      issues.push({
        level: 'warning',
        category: 'Naming Convention',
        message: `Requirement "${reqId}" has a very short title (${req.title.length} chars)`,
        location: req.file,
      });
    }

    if (req.description && req.description.length < 20) {
      issues.push({
        level: 'warning',
        category: 'Naming Convention',
        message: `Requirement "${reqId}" has a very short description (${req.description.length} chars)`,
        location: req.file,
      });
    }
  }

  // Check for vague terms in acceptance criteria
  const vagueTerms = ['なるべく', 'できるだけ', '適切に', '必要に応じて', 'ほぼ', 'おおよそ'];
  for (const [reqId, req] of index.requirements) {
    if (!req.acceptanceCriteria) continue;

    for (const criterion of req.acceptanceCriteria) {
      for (const term of vagueTerms) {
        if (criterion.includes(term)) {
          issues.push({
            level: 'warning',
            category: 'Naming Convention',
            message: `Requirement "${reqId}" has vague term "${term}" in acceptance criteria`,
            location: req.file,
          });
        }
      }
    }
  }
}

/**
 * Check metrics validity and consistency
 */
function checkMetricsValidity(index: DocumentIndex, issues: Issue[]): void {
  // Check if acceptance criteria with numbers have corresponding metrics
  for (const [reqId, req] of index.requirements) {
    if (!req.acceptanceCriteria) continue;

    const hasNumericCriteria = req.acceptanceCriteria.some((c) => /\d+/.test(c));

    if (hasNumericCriteria) {
      if (!req.metrics || !req.metrics.targetValue) {
        issues.push({
          level: 'warning',
          category: 'Metrics Validity',
          message: `Requirement "${reqId}" has numeric criteria but no metrics field`,
          location: req.file,
        });
      }
    }
  }

  // Check for inconsistent units
  for (const [reqId, req] of index.requirements) {
    if (!req.metrics || !req.acceptanceCriteria) continue;

    const criteriaText = req.acceptanceCriteria.join(' ');
    const metricsUnit = req.metrics.unit || '';

    // Check if units match
    if (metricsUnit === '秒' && criteriaText.includes('ミリ秒')) {
      issues.push({
        level: 'warning',
        category: 'Metrics Validity',
        message: `Requirement "${reqId}" has unit mismatch (metrics: 秒, criteria: ミリ秒)`,
        location: req.file,
      });
    }

    if (
      metricsUnit === 'ミリ秒' &&
      criteriaText.includes('秒') &&
      !criteriaText.includes('ミリ秒')
    ) {
      issues.push({
        level: 'warning',
        category: 'Metrics Validity',
        message: `Requirement "${reqId}" has unit mismatch (metrics: ミリ秒, criteria: 秒)`,
        location: req.file,
      });
    }
  }

  // Check for unrealistic effort estimates
  for (const [reqId, req] of index.requirements) {
    if (!req.estimatedEffort) continue;

    const effort = req.estimatedEffort.value;
    const criteriaCount = req.acceptanceCriteria?.length || 0;

    if (effort && effort > 40 && criteriaCount < 3) {
      issues.push({
        level: 'info',
        category: 'Metrics Validity',
        message: `Requirement "${reqId}" has high effort (${effort}h) but few acceptance criteria (${criteriaCount})`,
        location: req.file,
      });
    }

    if (effort && effort > 0 && effort < 1) {
      issues.push({
        level: 'info',
        category: 'Metrics Validity',
        message: `Requirement "${reqId}" has very low effort estimate (${effort}h)`,
        location: req.file,
      });
    }
  }

  // Check priority vs metrics consistency
  for (const [reqId, req] of index.requirements) {
    if (!req.priority || !req.metrics || !req.metrics.targetValue) continue;

    const targetValue = req.metrics.targetValue.toLowerCase();
    const hasStrictTarget =
      /[0-9]+\s*(秒|ms|ミリ秒)以内/.test(targetValue) || /[0-9]+%以上/.test(targetValue);

    if (req.priority === 'low' && hasStrictTarget) {
      issues.push({
        level: 'info',
        category: 'Metrics Validity',
        message: `Requirement "${reqId}" has low priority but strict performance target`,
        location: req.file,
      });
    }
  }
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
      const levelIcon = issue.level === 'error' ? '✗' : issue.level === 'warning' ? '⚠' : 'ℹ';
      console.log(
        `  ${levelIcon} ${issue.message}${issue.location ? chalk.gray(` (${issue.location})`) : ''}`
      );
    }
    console.log();
  }
}
