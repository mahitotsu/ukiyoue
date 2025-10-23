# Table Order System - Example Project

## Overview

This is a reference implementation of an in-store self-service ordering system (table order system) using the Ukiyoue framework. This example demonstrates the framework's three pillars: Conversational, Auto-generatable, and Reusable documentation.

## System Scope

### In Scope

- **Menu Display**: Browse menu items by category
- **Order Placement**: Add items to cart and submit orders
- **Kitchen Notification**: Send orders to kitchen display
- **Order Status Tracking**: Check order status in real-time

### Out of Scope

The following features are explicitly excluded from this example to maintain focus:

- ❌ Payment Processing (POS system integration)
- ❌ Inventory Management (restaurant management system)
- ❌ Customer Management (CRM)
- ❌ Delivery/Takeout (in-store dining only)
- ❌ Allergen Information Management (future consideration)

## Target Users

1. **Customers**: Use tablets at tables to browse menu and place orders
2. **Kitchen Staff**: View incoming orders on kitchen display
3. **System Administrators**: Monitor system health and performance

## Project Structure

```text
table-order-system/
├── layer1-business/          # Business context and user stories
│   ├── user-stories/         # User story definitions (JSON)
│   └── business-goals/       # Business objectives (JSON)
│
├── layer2-requirements/      # System requirements
│   ├── functional/           # Functional requirements (JSON)
│   └── nonfunctional/        # Non-functional requirements (JSON)
│
├── layer3-architecture/      # System architecture (ADR-006: 3-layer separation)
│   ├── reliability/          # Reliability architecture (SLO, dependencies)
│   ├── infrastructure/       # Infrastructure architecture (API, data model)
│   └── observability/        # Observability architecture (logging, metrics)
│
├── layer4-implementation/    # Implementation (ADR-005: native language)
│   └── services/             # Microservices (TypeScript + Bun)
│
├── adrs/                     # Architecture Decision Records
│   └── (decisions specific to this project)
│
└── traceability/             # Traceability matrix (ADR-007: hybrid approach)
    └── matrix-auto-generated.json
```

## Technology Stack (To Be Decided)

Technology choices will be documented as Architecture Decision Records (ADRs) as the project progresses. Key decisions to be made:

- Backend framework and language
- Database selection
- Real-time communication approach
- Deployment infrastructure

## Ukiyoue Framework Demonstration

This example showcases:

### 1. Conversational (Dialogue-driven)

- Natural traceability from business goals → requirements → architecture → implementation
- ADRs provide context for "why" questions
- JSON-LD enables semantic queries

### 2. Auto-generatable (Machine-readable)

- All artifacts in JSON format (per ADR-001)
- Markdown documentation auto-generated from JSON
- Traceability matrix auto-generated (per ADR-007)

### 3. Reusable (Component-based)

- Common patterns referenced via `$ref`
- JSON Schema validation ensures consistency
- JSON-LD provides semantic relationships

## Getting Started

This is a reference example. To explore:

1. **Read the documentation**: Start with `layer1-business/` to understand the business context
2. **Follow traceability**: Use the auto-generated matrix to navigate relationships
3. **Review decisions**: Check `adrs/` for architectural decisions and rationale

## Development Status

- ✅ Project structure created
- 🚧 Documentation in progress (Layer 1 → Layer 4)
- 📋 Implementation planned (Step by step)
