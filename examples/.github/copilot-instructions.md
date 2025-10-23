# GitHub Copilot Instructions for Table Order System Example

## Project Context

This is the **Table Order System example project** within the Ukiyoue framework repository. This example demonstrates how to use the Ukiyoue framework to document a real-world system.

### Parent Framework Instructions

Always follow the parent framework instructions at `/home/akring/ukiyoue/.github/copilot-instructions.md`. This file provides **additional context specific to this example project**.

## Project-Specific Principles

### 1. This is an Example, Not Production Code

- **Purpose**: Demonstrate Ukiyoue framework usage patterns
- **Quality**: Clean, well-documented, educational code
- **Scope**: Intentionally limited to maintain focus (no payment, no delivery, no CRM)

### 2. Step-by-Step Development

- **Do NOT**: Create all files at once
- **Do**: Progress layer by layer (Layer 1 → Layer 2 → Layer 3 → Layer 4)
- **Do**: Wait for user confirmation before moving to the next artifact
- **Do**: Create one artifact at a time and validate it

### 3. Technology Decisions via ADRs

- **Do NOT**: Assume technology choices upfront
- **Do**: Document technology decisions as ADRs when they arise
- **Examples**: Database selection, real-time communication approach, deployment strategy

### 4. Traceability First

Every artifact must include traceability information:

- **Layer 1 (Business)**: Link to business goals
- **Layer 2 (Requirements)**: Link to user stories and business goals
- **Layer 3 (Architecture)**: Link to requirements
- **Layer 4 (Implementation)**: Reference via external traceability matrix (per ADR-007)

### 5. Validate Against Schemas

All JSON files must:

- Conform to JSON Schema in `/home/akring/ukiyoue/schemas/`
- Use `$schema` field to reference the appropriate schema
- Be validated with `bun run validate` before committing

## System Scope Reminders

### ✅ In Scope

- Menu display (browsing by category)
- Order placement (cart → submit)
- Kitchen notification (order to kitchen display)
- Order status tracking

### ❌ Out of Scope

- Payment processing
- Inventory management
- Customer management (CRM)
- Delivery/takeout
- Allergen information management

## File Naming Conventions

### JSON Files

- **User Stories**: `us-XXX-short-description.json`
- **Business Goals**: `bg-XXX-short-description.json`
- **Functional Requirements**: `fr-XXX-short-description.json`
- **Non-functional Requirements**: `nfr-XXX-short-description.json`
- **Architecture**: `[artifact-type]-[description].json`
- **ADRs**: `adr-XXX-short-title.md`

### ID Format

Use consistent ID format across all artifacts:

- User Stories: `US-TOS-001` (Table Order System)
- Business Goals: `BG-TOS-001`
- Functional Requirements: `FR-TOS-001`
- Non-functional Requirements: `NFR-TOS-001`
- Architecture: `ARCH-TOS-[TYPE]-001`

## Development Workflow

### When Creating a New Artifact

1. **Identify dependencies**: What upstream artifacts does this depend on?
2. **Check schema**: What JSON Schema applies?
3. **Create JSON**: Write the artifact in JSON format
4. **Add traceability**: Include `tracesTo`/`derivedFrom` fields
5. **Validate**: Run `bun run validate <file>`
6. **Review with user**: Wait for confirmation before proceeding

### When Creating ADRs

ADRs for this project follow the same format as framework ADRs but focus on **project-specific decisions**:

- Why this database?
- Why this communication protocol?
- Why this deployment approach?

### When Implementing Code (Layer 4)

Per ADR-005:

- Use **native language** (TypeScript, not JSON)
- Follow **Bun + TypeScript** conventions
- Add traceability via **external matrix** (not in code comments)
- Keep code clean and educational (this is an example)

## Anti-Patterns to Avoid

### ❌ DO NOT

- Create all artifacts at once without user confirmation
- Make technology decisions without documenting ADRs
- Add features outside the defined scope
- Skip traceability information
- Use manual metadata (dates, versions) instead of Git
- Create production-grade code (this is an example)

### ✅ DO

- Progress step by step, one artifact at a time
- Document every technology decision as an ADR
- Stay within the defined scope
- Include traceability in every artifact
- Rely on Git for metadata
- Write clean, educational example code

## Reasoning Chain for This Project

When creating any artifact:

1. **Scope check**: Is this within the defined scope?
2. **Dependencies**: What upstream artifacts exist?
3. **Schema**: What JSON Schema applies?
4. **Traceability**: What are the parent/child relationships?
5. **Validation**: Does it pass schema validation?
6. **ADR check**: Are there relevant project ADRs?
7. **User confirmation**: Wait for approval before proceeding

## Integration with Framework Tools

### Validation

```bash
# From project root
bun run validate examples/table-order-system/layer1-business/user-stories/us-001-browse-menu.json
```

### Traceability Matrix Generation (Future)

```bash
# Auto-generate traceability matrix (ADR-007)
bun run generate-traceability examples/table-order-system/
```

## Quick Reference

- **Framework Instructions**: `/home/akring/ukiyoue/.github/copilot-instructions.md`
- **Schemas**: `/home/akring/ukiyoue/schemas/`
- **Framework ADRs**: `/home/akring/ukiyoue/specs/architecture-decisions/`
- **Project ADRs**: `/home/akring/ukiyoue/examples/table-order-system/adrs/`
- **Validator**: `/home/akring/ukiyoue/tools/src/validate.ts`

## Development Status Tracking

Track progress in this README section (update as we go):

- ✅ Project structure created
- ✅ README.md created
- ✅ Project-specific instructions created
- 📋 Layer 1: Business context (next)
- 📋 Layer 2: Requirements
- 📋 Layer 3: Architecture
- 📋 Layer 4: Implementation
- 📋 Traceability matrix generation
