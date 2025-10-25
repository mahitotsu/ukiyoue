# GitHub Copilot Instructions for Ukiyoue Validator Tools

## Project Identity

**Project**: `@ukiyoue/validator` - Validation tools for Ukiyoue Framework
**Purpose**: Provide comprehensive validation for Ukiyoue JSON documents
**Role**: CLI tool and library for framework users and CI/CD pipelines

## Core Principles

### 1. Project Scope

This is a **standalone validation tool project**, not the main framework:

- **Target Users**: Ukiyoue framework users, CI/CD pipelines, developers
- **Purpose**: Validate JSON documents against Ukiyoue schemas and rules
- **Deliverables**: CLI tool (`validate.ts`) and reusable validator modules

### 2. Technology Stack

- **Runtime**: Bun (not Node.js) - as per ADR-004
- **Language**: TypeScript with strict mode
- **Key Dependencies**:
  - `ajv` v8+ (JSON Schema Draft-07 validation)
  - `ajv-formats` (format validation)
  - `jsonld` v8+ (JSON-LD 1.1 validation)
  - `chalk` (CLI output formatting)
- **Testing**: Bun's built-in test runner
- **Linting**: ESLint v9 (flat config) + TypeScript ESLint
- **Formatting**: Prettier

### 3. Validation Architecture

**Multi-layer validation system (ADR-008)**:

1. **Schema Validator** (`validators/schema-validator.ts`)
   - JSON Schema Draft-07 validation (ADR-002)
   - Schema auto-detection from document type
   - ajv with strict mode and format validation
   - Layer: Field structure validation (fast)

2. **Reference Validator** (`validators/reference-validator.ts`)
   - Traceability reference integrity (FR-AUTO-002)
   - Type-aware validation (artifact-input-rules.json)
   - Checks: `derivedFrom`, `satisfies`, `relatedDocuments`, `affectedArtifacts`, `relatedDecisions`, etc.
   - Circular reference detection
   - Cross-document reference resolution
   - Layer: Reference integrity validation (fast)

3. **JSON-LD Validator** (`validators/jsonld-validator.ts`)
   - JSON-LD 1.1 compliance (ADR-003)
   - Context expansion validation
   - Local document loader (security: no remote contexts by default)
   - @context structure validation
   - Layer: Semantic syntax validation (fast)

4. **SHACL Validator** (`validators/shacl-validator.ts`) [NEW]
   - SHACL (Shapes Constraint Language) validation (ADR-008)
   - Type constraints (sh:class) - validates input artifact types
   - Document indexing (recursive directory scan)
   - RDF graph construction (JSON-LD → RDF with recursive loading)
   - Supports `traceability.derivedFrom` nested structure
   - Layer: Graph-based semantic integrity validation (slow)
   - Usage: Optional, enabled with `--full-validation` flag
   - Purpose: AI-era foundation for advanced semantic reasoning

### 4. Code Quality Standards

**TypeScript**:

- Strict mode enabled in `tsconfig.json`
- No `any` types - use explicit types or `unknown`
- Use `noUncheckedIndexedAccess: true` - check array access
- Explicit return types for public functions
- Use ESM imports/exports (`.js` extensions in imports)

**Error Handling**:

- Validators return `{ valid: boolean; errors: string[] }`
- CLI exits with code 1 on validation failure, 0 on success
- User-friendly error messages with chalk formatting
- Verbose mode for detailed diagnostics

**Testing**:

- Unit tests for each validator module
- Integration tests for CLI tool
- Use fixtures in `test/fixtures/` for test data
- Aim for high coverage (>80%)
- Test both valid and invalid inputs

### 5. CLI Design Principles

**User Experience**:

- Clear, colorful output using chalk
- Progress indicators for multiple files
- Summary at the end
- Quiet mode by default, verbose on `--verbose`
- Exit codes: 0 (success), 1 (validation errors), 2 (CLI errors)

**Options Philosophy**:

- Enable all validations by default (Schema, Reference, JSON-LD)
- Use `--skip-*` flags to disable specific checks
- Use `--full-validation` to enable SHACL validation (Stage 4)
- Security-first: `--allow-remote` explicitly enables risky operations
- Support both single files and directories

**Validation Timing Recommendations**:

- **Save (Stages 1-2)**: Schema + Reference validation for fast feedback
- **Commit (Stages 1-3)**: Add JSON-LD validation
- **CI/CD (Stages 1-4)**: Use `--full-validation` for complete semantic integrity

**Output Format**:

```text
🎨 Ukiyoue Framework Validator

📁 Found 3 JSON file(s)

📄 Validating: project-charter.json
  🔍 JSON Schema validation...
  ✅ Schema validation passed
  🔗 Reference validation...
  ✅ Reference validation passed
  📊 JSON-LD validation...
  ✅ JSON-LD validation passed
  🎯 SHACL validation...
  ✅ SHACL validation passed

============================================================
✅ All 3 file(s) validated successfully
```

### 6. File Structure

```text
tools/
├── src/
│   ├── validate.ts              # CLI entry point
│   ├── validators/
│   │   ├── schema-validator.ts  # JSON Schema validation
│   │   ├── reference-validator.ts # Reference integrity + Type checking
│   │   ├── jsonld-validator.ts  # JSON-LD validation
│   │   └── shacl-validator.ts   # SHACL graph validation
│   └── types/
│       └── jsonld.d.ts          # Type definitions
├── test/
│   ├── validate.test.ts         # CLI integration tests
│   ├── validators/
│   │   ├── schema-validator.test.ts
│   │   ├── reference-validator.test.ts
│   │   ├── reference-validator-types.test.ts # Type checking tests
│   │   ├── jsonld-validator.test.ts
│   │   └── shacl-validator.test.ts
│   └── fixtures/
│       ├── valid.json
│       └── invalid.json
├── coverage/                    # Coverage reports (gitignored)
├── package.json
├── tsconfig.json
├── eslint.config.mjs
└── README.md
```

### 7. Schema Resolution Strategy

Auto-detect schema from document:

1. Check `type` field in document (e.g., "project-charter")
2. Map to schema path: `schemas/layer{N}/{type}.json`
3. Fallback to `--schema` CLI option
4. Load common definitions from `schemas/_common.json`

**Example**:

```typescript
// Document with "type": "project-charter"
// → Auto-resolve to schemas/layer1/project-charter.json
```

### 8. Dependency on Parent Framework

**Schema Location**: Assumes schemas exist at `../schemas/` relative to tools directory
**Semantic Context**: Assumes contexts exist at `../semantics/context/`
**SHACL Shapes**: Assumes shapes exist at `../schemas/shacl/`
**Resolution**: Use relative paths, not absolute URLs
**Validation**: Tools validate against parent framework's schemas

**Special Artifacts**:

- **Risk Register**: `derivedFrom` not allowed (maxCount 0), uses individual `risk.affectedArtifacts`
- **ADR**: `derivedFrom` not allowed (maxCount 0), uses `relatedDecisions`
- **Artifact References**: Must reference whole artifact ID (e.g., `roadmap-tos-001`), not nested object IDs (e.g., `phase-tos-001`)

## Implementation Guidelines

### When Creating New Validators

```typescript
// Validator function signature
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export async function validateSomething(
  data: unknown,
  options?: SomeOptions
): Promise<ValidationResult> {
  const errors: string[] = [];

  // Validation logic

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

### When Adding CLI Options

1. Update `CliOptions` interface
2. Add parsing logic in `parseArgs()`
3. Pass option to validator functions
4. Document in `--help` output
5. Add tests for new option
6. Update README.md

### When Writing Tests

```typescript
import { describe, test, expect } from 'bun:test';

describe('Feature', () => {
  test('should handle valid input', async () => {
    const result = await validate(validData);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject invalid input', async () => {
    const result = await validate(invalidData);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
```

### When Handling JSON-LD

```typescript
// Always use local document loader for security
const documentLoader = createLocalDocumentLoader(semanticsDir, allowRemote);

// Validate @context structure first
const contextResult = validateJsonLd11Context(data);
if (!contextResult.valid) {
  return contextResult;
}

// Then expand document
const expanded = await jsonld.expand(data, { documentLoader });
```

## Anti-Patterns to Avoid

### ❌ DO NOT

- Use Node.js or npm commands (use Bun per ADR-004)
- Allow remote @context loading by default (security risk)
- Use `any` type in TypeScript
- Throw exceptions in validator functions (return errors)
- Write synchronous validation code (use async/await)
- Hard-code schema paths (use auto-detection)
- Mix CLI logic with validation logic
- Skip error messages (always provide context)
- Use console.log directly (use chalk for CLI output)
- Commit coverage reports to git

### ✅ DO

- Use Bun for all commands (`bun test`, `bun run validate`)
- Return structured `ValidationResult` from validators
- Use async/await for all I/O operations
- Auto-detect schemas from document type
- Separate CLI concerns from validation logic
- Provide detailed, user-friendly error messages
- Use chalk for colored CLI output
- Keep validators pure and testable
- Test edge cases and error paths
- Run `bun run check` before committing

## Testing Strategy

**Unit Tests**: Test each validator module independently

- Schema validator: valid/invalid schemas, format checks
- Reference validator: circular refs, missing refs, valid refs, type checking
- JSON-LD validator: context expansion, JSON-LD 1.1 features
- SHACL validator: type constraints, document indexing, RDF graph construction

**Integration Tests**: Test CLI with real files

- Single file validation
- Directory validation
- Various CLI option combinations
- Error handling and exit codes

**Fixtures**: Use realistic Ukiyoue documents

- Copy example documents from parent framework
- Create minimal valid/invalid test cases
- Test edge cases (empty objects, missing fields, etc.)

**Coverage**: Aim for >80% coverage

- Run `bun test --coverage` to check
- Focus on critical paths and error handling
- Don't obsess over 100% (diminishing returns)

## Common Tasks

### Running Validation

```bash
# Validate single document
bun src/validate.ts ../examples/project-charter.json

# Validate directory
bun src/validate.ts ../examples/

# Full validation (includes SHACL)
bun src/validate.ts ../examples/ --full-validation

# Schema validation only
bun src/validate.ts document.json --skip-references --skip-jsonld

# Skip JSON-LD (faster in CI)
bun src/validate.ts ../examples/ --skip-jsonld

# Skip SHACL (default, explicit form)
bun src/validate.ts ../examples/ --skip-shacl
```

### Running Tests

````bash
# All tests
```bash
# All tests
bun test

# Watch mode
bun test --watch

# Coverage
bun test --coverage

# Specific test file
bun test validators/schema-validator.test.ts
````

### Code Quality Checks

```bash
# All checks (type, lint, format, test)
bun run check

# Individual checks
bun run typecheck
bun run lint
bun run format:check
bun test
```

### Development Workflow

```bash
# Install dependencies
bun install

# Make changes to src/

# Run tests
bun test

# Check code quality
bun run check

# Fix linting/formatting
bun run lint:fix
bun run format

# Commit changes (husky runs pre-commit hooks)
git commit
```

## Relationship to Parent Framework

**This project is a TOOL FOR the Ukiyoue Framework, not part of it**:

- **Location**: Lives in `tools/` subdirectory of parent repo
- **Dependencies**: Reads schemas from `../schemas/`, contexts from `../semantics/`
- **Purpose**: Provides validation for documents created with Ukiyoue
- **Users**: Framework users who create Ukiyoue documents

**When to update this project**:

- New artifact types added to framework (new schemas)
- New validation rules required (reference patterns, etc.)
- JSON-LD vocabulary changes (new semantic terms)
- Bug fixes in validation logic
- Performance improvements

**When NOT to update this project**:

- Changes to framework documentation (specs/, ADRs)
- Example document changes (unless breaking validators)
- Schema changes that don't affect validation logic

## Version Control

**Commits**: Use conventional commits

- `feat:` - New validator features
- `fix:` - Bug fixes in validation logic
- `test:` - Test additions/changes
- `refactor:` - Code refactoring
- `docs:` - README or code documentation
- `chore:` - Dependency updates, config changes

**Branches**: Work on `main` for now (small team)

**Releases**: Semantic versioning

- `0.x.x` - Pre-1.0 development (current)
- `1.0.0` - Stable API for framework users
- Breaking changes: Bump major version

## Emergency Contacts

**If you encounter**:

- Schema validation issues → Check ADR-002 (Draft-07), ajv documentation
- Reference validation issues → Check FR-AUTO-002 (link-checker requirements), artifact-input-rules.json
- JSON-LD issues → Check ADR-003 (JSON-LD 1.1), jsonld.js documentation
- SHACL validation issues → Check ADR-008 (multi-layer validation), artifact-constraints.ttl
- Bun runtime issues → Check ADR-004, Bun documentation
- TypeScript errors → Check tsconfig.json, use strict types
- Test failures → Run `bun test --verbose`, check fixtures

**Common Issues**:

1. **Schema not found**: Check schema path resolution, verify schema exists
2. **Remote context blocked**: Use `--allow-remote` or fix @context to local
3. **Circular references**: Expected in traceability, validator should detect
4. **Type errors**: Ensure all array access checks for undefined
5. **Import errors**: Use `.js` extension in imports (ESM requirement)

## Reasoning Chain

When approached with a task:

1. **Understand**: What validation feature/fix is needed?
2. **Locate**: Which validator module is affected?
3. **Read**: Check existing code and tests
4. **Design**: How should this validation work?
5. **Implement**: Write code with proper types and error handling
6. **Test**: Add unit tests, verify with `bun test`
7. **Validate**: Run `bun run check` to ensure quality
8. **Document**: Update README if user-facing changes

## Success Metrics

**Good validator characteristics**:

- ✅ Returns clear, actionable error messages
- ✅ Validates against correct JSON Schema version (Draft-07)
- ✅ Handles edge cases gracefully
- ✅ Fast enough for CI/CD pipelines
- ✅ Secure by default (no remote loads without flag)
- ✅ Well-tested (unit + integration tests)
- ✅ Type-safe TypeScript throughout

**Bad validator characteristics**:

- ❌ Throws unhandled exceptions
- ❌ Uses `any` types
- ❌ Allows remote context loads by default
- ❌ Provides vague error messages
- ❌ Synchronous I/O blocking
- ❌ Hard-coded paths or assumptions
- ❌ Missing tests for error cases
