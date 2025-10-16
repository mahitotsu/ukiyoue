# Ukiyoue Framework Tools - Usage Guide

CLI tools for Ukiyoue framework - validation, link checking, and document processing.

## Installation

```bash
cd tools
bun install
```

## Available Tools

### 1. Validation Tool

Validate JSON documents against JSON Schema definitions.

**Usage:**

```bash
# Auto-detect schema based on document type
bun run src/cli.ts validate <file.json>

# Use custom schema
bun run src/cli.ts validate <file.json> --schema path/to/schema.json

# Verbose output
bun run src/cli.ts validate <file.json> --verbose
```

**Examples:**

```bash
# Validate stakeholders
bun run src/cli.ts validate ../examples/reservation-system/stakeholders.json

# Validate business requirements
bun run src/cli.ts validate ../examples/reservation-system/business-requirements.json

# Verbose validation
bun run src/cli.ts validate ../examples/reservation-system/use-cases.json --verbose
```

**Schema Auto-Detection:**

The validation tool automatically detects the appropriate schema based on:

1. `type` or `@type` field in the document
   - `BusinessRequirements` → `types/business-requirements.schema.json`
   - `Stakeholder` → `components/stakeholder.schema.json`
   - `Requirement` → `components/requirement.schema.json`
   - `UseCase` → `components/use-case.schema.json`
2. Filename patterns
   - `stakeholders.json` → stakeholder schema
   - `use-cases.json` → use-case schema
   - `*requirements*.json` → requirement schema
3. Fallback to `document-base.schema.json`

**Array Validation:**

The tool automatically detects if the JSON file contains an array and validates each item individually.

### 2. Link Checking Tool

Check cross-references between documents to ensure all referenced IDs exist.

**Usage:**

```bash
# Check all links in a directory
bun run src/cli.ts check-links <directory>

# Verbose output
bun run src/cli.ts check-links <directory> --verbose
```

**Examples:**

```bash
# Check reservation system examples
bun run src/cli.ts check-links ../examples/reservation-system

# Verbose link checking
bun run src/cli.ts check-links ../examples/reservation-system --verbose
```

**What it checks:**

- Stakeholder ID references (`SH-*`)
- Use case ID references (`UC-*`)
- Requirement ID references (`FR-*`, `NFR-*`)

**Relationship fields checked:**

- `stakeholderIds`, `relatedStakeholders`
- `useCaseIds`, `relatedUseCases`
- `requirementIds`
- `implements`, `dependsOn`, `relatedTo`, `conflicts`

**Output:**

```
✓ All links are valid
```

or

```
✗ Found 3 broken links

/path/to/file.json
  stakeholderIds[0]: stakeholder "SH-INVALID" not found
  requirementIds[1]: requirement "FR-999" not found
```

## Development

### Project Structure

```
tools/
├── src/
│   ├── cli.ts                    # CLI entry point
│   └── commands/
│       ├── validate.ts           # Validation command
│       └── check-links.ts        # Link checking command
├── dist/                         # Build output
├── package.json
├── tsconfig.json
└── README.md
```

### Building

```bash
bun run build
```

### Running Tests

```bash
# Test validation
bun run src/cli.ts validate ../examples/reservation-system/stakeholders.json

# Test link checking
bun run src/cli.ts check-links ../examples/reservation-system
```

## Technology Stack

- **Runtime**: Bun (v1.0+)
- **Language**: TypeScript (strict mode)
- **Validation**: Ajv v8 (JSON Schema Draft-07)
- **CLI Framework**: Commander.js
- **Output Formatting**: Chalk

## Exit Codes

- `0`: Success
- `1`: Validation failed or broken links found

## Troubleshooting

### Validation Errors

**Problem**: "must be array" error for stakeholders/useCases/requirements

**Cause**: The main business requirements document uses `$IMPORT(file.json)` syntax for modular structure.

**Solution**: Validate each modular file separately:

```bash
# Instead of validating the main file
bun run src/cli.ts validate business-requirements.json

# Validate each module
bun run src/cli.ts validate stakeholders.json
bun run src/cli.ts validate use-cases.json
bun run src/cli.ts validate functional-requirements.json
```

### Schema Resolution Errors

**Problem**: "can't resolve reference" error

**Solution**: The tool automatically loads dependent schemas from the `schemas/` directory. Ensure:

1. Schema files are in the correct location (`schemas/components/`, `schemas/types/`)
2. `$id` fields in schemas match the expected URIs
3. `$ref` paths are correct

### Broken Links

**Problem**: False positives in link checking

**Solution**: Check that:

1. ID naming follows conventions (`SH-*`, `UC-*`, `FR-*`, `NFR-*`)
2. Referenced files are in the checked directory
3. JSON files are valid and parseable

## Future Enhancements

Planned tools (not yet implemented):

- Statistics tool (document metrics, requirement counts)
- Markdown generation (JSON → Markdown conversion)
- Template generation (scaffold new documents)
- Schema loading utilities
- Interactive mode
- $IMPORT resolution for validation
