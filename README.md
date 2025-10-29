# Ukiyoue Framework

> AI時代のドキュメンテーション・フレームワーク
>
> 使うほど賢くなる、AIと人間が協働する新しい知識基盤

## 📚 ドキュメント

- 📰 **[プレスリリース & FAQ](./docs/working-backwards.md)** - プレスリリース形式でのビジョンと価値提案（推奨）
- 🎯 **[コンセプト & 背景](./docs/concept.md)** - フレームワークのコンセプトと技術的背景
- 🏗️ **[アーキテクチャ](./docs/architecture.md)** - システムアーキテクチャと技術設計
- 🔧 **[実装ガイド](./docs/implementation-guide.md)** - 各エンジンの詳細実装とライブラリ使用方法
- 📋 **[要件定義](./docs/requirements.md)** - 詳細要件（開発中）

### どこから読むべきか

> 💡 **初めての方へ**: まずは [プレスリリース & FAQ](./docs/working-backwards.md) をお読みください。カスタマー視点でUkiyoueの価値を理解できます。

### Architecture Decision Records (ADR)

技術的判断の根拠と背景は、以下のADRに記録されています：

**基本方針（001-009）**:

- [ADR-001: Document Format](./docs/adr/001-document-format.md) - JSON形式を採用
- [ADR-002: Structure Validation](./docs/adr/002-structure-validation.md) - JSON Schema (Draft 2020-12)を採用
- [ADR-003: Semantic Definition](./docs/adr/003-semantic-definition.md) - JSON-LD 1.1を採用
- [ADR-004: Schema Validation Engine](./docs/adr/004-schema-validation-engine.md) - Ajv v8を採用
- [ADR-005: Element Identification](./docs/adr/005-element-identification.md) - JSON Pointer (RFC 6901)を採用
- [ADR-006: Semantic Integrity Validation](./docs/adr/006-semantic-integrity-validation.md) - JSON-LD + SHACLを採用
- [ADR-007: Domain Specific Validation](./docs/adr/007-domain-specific-validation.md) - YAML/JSON定義を採用
- [ADR-008: Implementation Language](./docs/adr/008-implementation-language.md) - TypeScript 5.xを採用
- [ADR-009: Runtime Environment](./docs/adr/009-runtime-environment.md) - Bun 1.xを採用

**ライブラリスタック（011-014）**:

- [ADR-011: JSON-LD Library](./docs/adr/011-json-ld-library.md) - jsonld.jsを採用
- [ADR-012: SHACL Library](./docs/adr/012-shacl-library.md) - rdf-validate-shaclを採用
- [ADR-013: MCP Implementation](./docs/adr/013-mcp-implementation.md) - @modelcontextprotocol/sdkを採用
- [ADR-014: CLI Implementation](./docs/adr/014-cli-implementation.md) - Commander.js + chalk + oraを採用

**開発ツール（015-017）**:

- [ADR-015: Test Framework](./docs/adr/015-test-framework.md) - Bun testを採用
- [ADR-016: Lint and Formatter](./docs/adr/016-lint-formatter.md) - Biomeを採用
- [ADR-017: CI/CD Platform](./docs/adr/017-ci-cd-platform.md) - GitHub Actionsを採用

**アーキテクチャ設計（018-）**:

- [ADR-018: Document Reference Method](./docs/adr/018-document-reference-method.md) - 相対パス + Base IRIを採用
