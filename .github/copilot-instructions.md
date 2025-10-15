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
- **Key Libraries**: ajv v8+, jsonld.js v5+, commander, chalk, ora

### 3. Critical Design Decisions (ADRs)
- **ADR-001**: JSON for editing, NOT Markdown (Markdown is display-only)
- **ADR-002**: JSON Schema Draft-07 for maximum tool support
- **ADR-003**: JSON-LD 1.1 for semantic capabilities
- **ADR-004**: TypeScript + Bun for implementation

### 4. Documentation Policy
- **No Manual Metadata**: Remove YAML headers, version footers, "Last updated" dates
- **Use Git**: Rely on `git log`, `git blame`, `git tag` for all metadata
- **Clear Hierarchy**: concept.md (WHY/WHAT) → architecture.md (HOW) → ADRs (WHY this tech)
- **No Redundancy**: Keep concepts in one place, reference from others

### 5. Workspace Structure
Multi-root workspace with 3 projects:
- **🎨 Ukiyoue Framework** (Root): specs/, schemas/, semantics/
- **🔧 Tools** (CLI & Validator): TypeScript+Bun implementation
- **📘 Examples** & Templates: Sample documents

### 6. Code Quality Standards
- **TypeScript**: Strict mode, explicit types, no `any`
- **JSON Schema**: Draft-07 syntax, use `$ref` for reusability
- **JSON-LD**: Version 1.1 features (nested context, @protected, @import)
- **Validation**: ajv with `allErrors: true, strict: true`

### 7. Requirements Traceability
- Always link decisions to requirements (FR-CONV-xxx, FR-AUTO-xxx, FR-REUSE-xxx)
- Document which requirements are satisfied and how
- Include expected effects with metrics

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
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://ukiyoue.dev/schemas/...",
  "title": "...",
  "type": "object",
  "required": [...],
  "properties": {...}
}
```

### When Creating JSON-LD Files
```json
{
  "@context": {
    "@version": 1.1,
    "@vocab": "https://ukiyoue.dev/vocab#",
    "@protected": true
  }
}
```

### When Implementing Tools (TypeScript + Bun)
```typescript
// Use ajv for validation
import Ajv from 'ajv';
const ajv = new Ajv({ allErrors: true, strict: true });

// Use jsonld.js for semantic operations
import * as jsonld from 'jsonld';
await jsonld.expand(doc);
```

## Anti-Patterns to Avoid

### ❌ DO NOT
- Use Markdown for editing (display only!)
- Use Node.js (use Bun)
- Use Python unless for AI/NLP plugins
- Add YAML front matter to documentation
- Add manual version/date footers
- Duplicate content across specs documents
- Use `any` type in TypeScript
- Assume file contents without reading
- Use JSON Schema 2019-09 or 2020-12 (use Draft-07)
- Use JSON-LD 1.0 (use 1.1)

### ✅ DO
- Edit JSON files, generate Markdown from them
- Use Bun for all JavaScript/TypeScript execution
- Rely on Git for all metadata
- Keep concept.md lightweight (WHY/WHAT only)
- Keep architecture.md detailed (HOW with ADR links)
- Use strict TypeScript types
- Read context before editing
- Use Draft-07 JSON Schema
- Use JSON-LD 1.1

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
