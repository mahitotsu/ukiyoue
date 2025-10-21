# GitHub Copilot Instructions for Ukiyoue Framework

## Core Principles

### 1. Framework Context Awareness

- This is the **Ukiyoue framework development project**, not user documentation
- Purpose: AI-era documentation framework with 3 pillars (Conversational, Auto-generatable, Reusable)
- All work should advance framework development, not document the framework itself

### 2. Technology Stack Adherence

- **Data Format**: JSON (editing/storage), Markdown (display only, read-only, auto-generated)
- **Schema**: JSON Schema Draft-07 (IETF standard)
- **Semantics**: JSON-LD 1.1 (W3C Recommendation 2020)
- **Runtime**: Bun (not Node.js)
- **Language**: TypeScript
- **Key Libraries**: ajv v8+, ajv-formats, chalk, jsonld.js v5+ (planned)

**Current Status**: Phase 1 (Implementation) - 🚧 In Progress

- ✅ Phase 0 Complete: Concept, requirements, architecture, ADRs (001-004)
- ✅ JSON Schema: 30 files (29 artifacts + \_common.json)
- ✅ JSON-LD: 6 files (4 contexts + 1 vocabulary + README)
- ✅ Tools: Minimal validator (validate-minimal.ts) with 7 unit tests
- ✅ Tooling: Prettier, markdownlint-cli2, lint-staged, Husky, TypeScript strict mode
- 📋 Next: Example documents and full validator implementation

### 3. Critical Design Decisions (ADRs)

- **ADR-001**: JSON for editing, NOT Markdown (Markdown is display-only)
- **ADR-002**: JSON Schema Draft-07 for maximum tool support
- **ADR-003**: JSON-LD 1.1 for semantic capabilities
- **ADR-004**: TypeScript + Bun for implementation

### 4. Documentation Policy

- **No Manual Metadata**: Remove YAML headers, version footers, "Last updated" dates
- **Use Git**: Rely on `git log`, `git blame`, `git tag` for all metadata
- **Clear Hierarchy**: concept.md (WHY/WHAT) → architecture.md (HOW/技術選定) → ADRs (WHY this tech)
- **No Redundancy**: Keep concepts in one place, reference from others
- **Document Delegation**: concept.md → architecture.md → ADRs (technology-neutral → technical decisions → rationale)

**README Hierarchy & Role Separation**:

Each README.md serves a specific scope without duplication:

- **Root README.md**: Project-wide overview for external visitors
  - Target: First-time visitors, external stakeholders
  - Content: Project concept, goals, high-level structure, getting started
  - Principle: Keep brief, link to subdirectory READMEs for details
  - Mark unimplemented features as "未実装"
- **Subdirectory README.md** (e.g., specs/, schemas/, tools/):
  - Target: Users navigating that specific directory
  - Content: Directory structure, file descriptions, usage/reading order
  - Scope: Only content within that directory
  - Principle: Never duplicate project overview from root
  - Cross-reference: Link to related directories, not duplicate their content

**Golden Rules**:

1. Each README owns one scope (project-wide OR directory-specific)
2. Link down (root → subdirs) and sideways (subdir ↔ subdir), never duplicate
3. If information appears in 2+ READMEs, refactor to one canonical location
4. Subdirectory READMEs assume reader knows project basics from root README

### 5. Workspace Structure

Current state (Phase 1):

- **🎨 Ukiyoue Framework** (Root): specs/ (specification documents and ADRs)
- **� schemas/**: 30 JSON Schema files (29 artifacts + \_common.json)
- **🔗 semantics/**: 6 JSON-LD files (4 contexts + vocabulary + README)
- **🛠️ tools/**: Minimal validator with Bun tests (7 test cases)
- **📁 Empty**: examples/ (to be implemented)

Next steps:

- Define document taxonomy and I/O relationships
- Design detailed schema structure
- Begin Phase 1 implementation

### 6. Code Quality Standards

- **TypeScript**: Strict mode, explicit types, no `any`
- **JSON Schema**: Draft-07 syntax, use `$ref` for reusability
- **JSON-LD**: Version 1.1 features (nested context, @protected, @import)
- **Validation**: ajv with `allErrors: true, strict: true`
- **Markdown**: Use markdownlint-cli2 for linting, automatic fixes via lint-staged

### 7. Requirements Traceability

- Always link decisions to requirements (FR-CONV-xxx, FR-AUTO-xxx, FR-REUSE-xxx)
- Document which requirements are satisfied and how
- NO quantitative metrics without evidence (removed unsubstantiated numbers)

### 8. File Operations

- **Read First**: Always gather context before editing
- **Edit Tools**: Use `replace_string_in_file` with 3-5 lines context
- **No Assumptions**: Don't assume file contents, read them
- **Large Chunks**: Read meaningful sections, not small fragments

### 9. Terminal Usage

- **Python**: Always call `configure_python_environment` before Python commands
- **Bun Commands**: Use `bun` not `npm` or `node`
- **Absolute Paths**: Always use absolute paths in commands
- **Background Processes**: Set `isBackground: true` for servers/watchers

### 10. Tool Selection Strategy

- **Semantic Search**: For finding concepts/functionality across codebase
- **Grep Search**: For exact strings or regex patterns
- **File Search**: For filename patterns (glob)
- **Read File**: When you need actual content (prefer large ranges)

## Project-Specific Guidelines

### When Creating Schema Files

Use JSON Schema Draft-07 with the following required fields:

- \$schema field: Draft-07 spec URL
- \$id field: Schema identifier URL
- title field: Descriptive name
- type field: Usually "object"
- required field: Array of required property names
- properties field: Property definitions

### When Creating JSON-LD Files

Use JSON-LD 1.1 with the following context structure:

- @context.@version field: Set to 1.1
- @context.@vocab field: Vocabulary base URL
- @context.@protected field: Set to true
- Use nested context and @import for complex definitions

### When Implementing Tools (TypeScript + Bun)

```typescript
// Use ajv for validation
import Ajv from "ajv";
const ajv = new Ajv({ allErrors: true, strict: true });

// Use jsonld.js for semantic operations
import * as jsonld from "jsonld";
await jsonld.expand(doc);
```

## Anti-Patterns to Avoid

### ❌ DO NOT (Framework Development)

- Use Node.js or npm (use Bun per ADR-004)
- Use Python for core tools (reserve for AI/NLP plugins only)
- Add YAML front matter to specs/ documentation
- Add manual version/date footers to any files
- Duplicate content across multiple READMEs
- Add detailed subdirectory structure to root README.md
- Include unimplemented features without "未実装" marker
- Use `any` type in TypeScript code
- Assume file contents without reading them first
- Use JSON Schema 2019-09 or 2020-12 (use Draft-07 per ADR-002)
- Use JSON-LD 1.0 (use 1.1 per ADR-003)
- Disable markdownlint rules without fixing the actual Markdown issues
- Add quantitative metrics without evidence or measurement

### ✅ DO (Framework Development)

- For framework specs (specs/): Edit Markdown directly (conventional documentation)
- For framework code (tools/): Use TypeScript with strict types
- Use Bun for all JavaScript/TypeScript execution
- Rely on Git for all metadata (dates, versions, authors)
- Keep concept.md technology-neutral (WHY/WHAT only, delegate to architecture.md)
- Keep architecture.md focused on current decisions (HOW, with ADR links)
- Keep root README.md brief and link to detailed docs
- Keep subdirectory READMEs focused on their directory navigation only
- Use strict TypeScript types everywhere
- Read context before making edits
- Use Draft-07 JSON Schema with ajv
- Use JSON-LD 1.1 with jsonld.js
- Fix Markdown issues properly (headings, code block languages, bullet lists)
- Run `bun run lint:md` to check Markdown before committing

### 📘 Future Implementation (examples/)

When implementing the `examples/` directory:

- **Demonstrate the framework approach**: Edit JSON source files → Validate with schemas → Generate Markdown for display
- Example Markdown files should be auto-generated outputs (read-only demonstration)
- Showcase how users should use the Ukiyoue framework (per ADR-001)
- Provide templates in `examples/templates/` as starting points for framework users

## Reasoning Chain

When approaching any task:

1. **Understand**: What is the user asking for?
2. **Context**: What files/code are relevant? (Read them!)
3. **Dependencies**: What ADRs/requirements apply?
4. **Design**: How does this fit the framework architecture?
5. **Implement**: Use appropriate tools and technologies
6. **Validate**: Does this advance the framework? Does it follow ADRs?
7. **Document**: Update specs/ADRs if architecture changes

## Emergency Contacts

If you encounter:

- **Conflicting requirements**: Review ADRs and requirements.md
- **Unclear architecture**: Check architecture.md and ADRs
- **Technology choice**: Refer to ADR-004 (TypeScript+Bun)
- **Data format question**: Refer to ADR-001 (JSON, not Markdown)
- **Schema version question**: Refer to ADR-002 (Draft-07)
- **Semantic question**: Refer to ADR-003 (JSON-LD 1.1)

## Version Control

- **Commit Messages**: Use conventional commits (feat:, fix:, docs:, etc.)
- **Branching**: Work on main for now (small team)
- **History**: Git is the single source of truth for dates, authors, versions
