# Ukiyoue Framework

AI-powered document management framework using JSON Schema, JSON-LD, and SHACL validation. Creates virtuous cycles where AI work quality improves with use.

## Project Overview

**Purpose**: Revolutionize project documentation for the AI era with automated validation and actionable feedback.

**Core Concept**: Two virtuous cycles

- Micro: AI work precision improves within each session via feedback loops
- Macro: Framework evolves through community usage and pattern accumulation

**Architecture**: 4-layer design (Interface → Core Engines → Schema → Pattern Library)

- MCP Server (primary) for AI agent integration
- CLI tools (secondary) for human/CI use
- Read-only access to user documents (never modify user files)

## Build and Run

```sh
# Install dependencies
bun install

# Run tests
bun test

# Type checking
bun run type-check

# Lint and format
bun run lint
bun run format

# Build MCP server
cd tools/mcp-server && bun build
```

## Repository Structure

```text
docs/                    # Architecture and design docs
  concept.md            # Core concepts and virtuous cycles
  architecture.md       # System architecture
  implementation-guide.md  # Implementation details
  poc-plan.md          # PoC execution plan
  adr/                 # Architecture Decision Records
schemas/               # JSON Schema definitions
semantics/             # JSON-LD contexts and SHACL shapes
tools/
  mcp-server/          # MCP Server implementation (primary interface)
  cli/                 # CLI tools (secondary interface)
templates/             # Document templates
examples/              # Sample documents
```

## Key Technical Decisions

**Tech Stack** (see docs/adr/ for rationale):

- Language: TypeScript 5.x with strict mode (ADR-008)
- Runtime: Bun 1.x (ADR-009)
- Document format: JSON with JSON-LD (ADR-001, ADR-003)
- Validation: JSON Schema (Ajv v8) + SHACL (ADR-004, ADR-006)
- MCP: @modelcontextprotocol/sdk (ADR-013)
- Test: Bun test (ADR-015)
- Lint/Format: Biome (ADR-016)

## Coding Standards

**TypeScript**:

- Use strict type checking (`strict: true`)
- Avoid `any`, prefer `unknown` when type is uncertain
- Explicit type annotations for public APIs

**Error Handling**:

- Use Result type pattern: `{ success: boolean; data?: T; error?: Error }`
- Avoid throwing exceptions except for unrecoverable errors

**Functional Style**:

- Prefer pure functions with no side effects
- Use immutable data structures
- Favor function composition

**Testing**:

- 80%+ code coverage required
- Follow AAA pattern (Arrange, Act, Assert)
- Use `describe`/`it` structure with clear test names

**Documentation**:

- JSDoc comments for all public APIs with examples
- Keep ADRs in docs/adr/ for significant technical decisions

## MCP Tools (Phase 1 PoC)

- `validate` - Validate documents with reference integrity checks
- `search_components` - Search reusable components semantically
- `get_component` - Retrieve component templates

## Important Constraints

**Read-Only Principle**: Never modify user documents. Only read and provide feedback.

**Data Separation**: Framework code vs user project data must be clearly separated.

**Scalability**: Must handle 10,000+ documents efficiently. Use O(log N) algorithms, caching, and parallel processing.

**Virtuous Cycles**: All changes should strengthen (or at minimum not harm) the two virtuous cycles.

## Document Format Conventions

**ADR Format** (must follow exactly):

- Status: `Accepted` only (no emojis, no dates)
- No `---` section dividers
- Comparison Matrix weights: 1-5 range only
- Normalized score: `(total/weight_sum) × 30`

**Same document types must have identical formatting** - always reference existing similar documents before creating new ones.

## Git Workflow

**Branch naming**:

- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

**Commit messages**: Use Conventional Commits format

```text
feat: add validation tool to MCP server
fix: handle undefined testCases in semantic engine
docs: update architecture diagram
test: add edge cases for validation engine
```

## Validation Commands

```sh
# Validate single file
bun run validate path/to/file.json

# Run all tests before committing
bun test && bun run type-check && bun run lint

# CI validation (run by GitHub Actions)
bun test --coverage
```

## Pre-commit Checklist

Before committing, ensure:

- No hardcoded credentials or API keys
- Input validation for all external data
- Path traversal prevention in file operations
- Dependency vulnerabilities checked (`bun audit`)

## Additional Context

For detailed context, refer to:

- `docs/concept.md` - Core concepts and virtuous cycles
- `docs/architecture.md` - System architecture and design
- `docs/implementation-guide.md` - Implementation details and library usage
- `docs/poc-plan.md` - PoC execution plan and milestones
- `docs/adr/` - Architecture Decision Records for technical rationale
