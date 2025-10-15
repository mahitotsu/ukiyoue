# Architecture Decision Records (ADR)

このディレクトリには、Ukiyoue フレームワークの重要な技術的意思決定の記録（ADR）が含まれています。

## ADR Index

| ID                                         | Title                                                      | Status      | Date       |
| ------------------------------------------ | ---------------------------------------------------------- | ----------- | ---------- |
| [001](001-data-format-and-schema.md)       | データフォーマット・スキーマ定義・セマンティック定義の選定 | ✅ Accepted | 2025-10-15 |
| [002](002-json-schema-draft-version.md)    | JSON Schema Draft 版選定                                   | ✅ Accepted | 2025-10-15 |
| [003](003-json-ld-version.md)              | JSON-LD バージョン選定                                     | ✅ Accepted | 2025-10-15 |
| [004](004-tool-implementation-language.md) | ツール実装言語とランタイムの選定                           | ✅ Accepted | 2025-10-15 |

## Decision Flow

```
ADR-001: Data Format
  ├─ JSON (編集・保存)
  ├─ JSON Schema (構造定義)
  ├─ JSON-LD (セマンティクス)
  └─ Markdown (表示のみ)
       ↓
ADR-002: JSON Schema Draft Version
  └─ Draft-07 (安定性・ツールサポート)
       ↓
ADR-003: JSON-LD Version
  └─ JSON-LD 1.1 (最新W3C勧告)
       ↓
ADR-004: Tool Implementation
  ├─ TypeScript + Bun
  ├─ ajv (JSON Schema Draft-07対応)
  └─ jsonld.js (JSON-LD 1.1対応)
```

## ADR Template

新しい ADR を作成する際は、以下の構造を使用してください：

```markdown
# ADR-XXX: [Title]

## Status

[Proposed | Accepted | Deprecated | Superseded]

## Context

[背景・問題の説明]

## Decision

[決定内容]

## Consequences

### Positive

[利点]

### Negative

[欠点]

### Mitigation

[欠点への対策]

## Alternatives Considered

[検討した代替案]

## Related Decisions

[関連する ADR]

---

**Date**: YYYY-MM-DD  
**Status**: [Status]  
**Deciders**: [Who made this decision]
```

## Key Decisions Summary

### ADR-001: データフォーマット選定 ⭐ 最重要

**決定内容**:

- ✅ **編集・保存**: JSON + JSON Schema + JSON-LD
- ✅ **表示**: Markdown（JSON から自動生成、読み取り専用）
- ❌ **却下**: Markdown による編集（構造化弱い、検証困難）

**理由**:

- 厳密な構造化と完全な検証
- 曖昧さ・揺らぎの完全排除
- AI/LLM に最適
- ツール支援が充実

**満たす要件**: FR-AUTO-001（構造化）、FR-AUTO-002（バリデーション）、FR-CONV-002（動的再構成）、FR-REUSE-001（コンポーネント化）、FR-CONV-001（セマンティック検索）

**影響**: すべての実装に影響する最も重要な決定

---

### ADR-002: JSON Schema Draft 版選定

**決定内容**:

- ✅ **採用**: Draft-07
- 📝 **戦略**: Draft-07 を基本とし、必要に応じて 2019-09 の機能も使用

**理由**:

- 最大のツールサポート（ajv、VSCode 等）
- 安定性と実績
- 豊富な情報・ドキュメント
- 必要十分な機能

**満たす要件**: FR-AUTO-001（構造化定義）、FR-AUTO-002（自動バリデーション）、FR-CONV-002（動的再構成）

**影響**: スキーマ定義の書き方、バリデータ性能、エディタ支援の品質

---

### ADR-003: JSON-LD バージョン選定

**決定内容**:

- ✅ **採用**: JSON-LD 1.1

**理由**:

- W3C 最新勧告（2020 年）
- 強力な新機能（nested context、@protected、@import、@json）
- 後方互換性あり
- 主要ツール対応完了

**満たす要件**: FR-CONV-001（セマンティック検索）、FR-REUSE-002（セマンティック検索と推奨）、FR-CONV-002（動的再構成）

**影響**: セマンティック定義の表現力、AI エージェントによる意味理解の精度

---

### ADR-004: ツール実装言語選定

**決定内容**:

- ✅ **採用**: TypeScript + Bun
- 📝 **代替**: Python（高度な AI 機能が必要な場合）

**理由**:

- JSON Schema Draft-07: ajv（最速・完全対応）
- JSON-LD 1.1: jsonld.js（W3C 公式実装）
- 起動速度: ~20ms（最速）
- TypeScript: 型安全性
- Bun: オールインワンツール

**満たす要件**: FR-AUTO-002（自動バリデーション）、FR-AUTO-003（テンプレート生成）、FR-AUTO-004（バージョン管理統合）、FR-CONV-001（セマンティック検索）

**前提**: ADR-002（Draft-07）と ADR-003（JSON-LD 1.1）の決定に基づき、これらを最適にサポートするツールを選定

**影響**: 開発効率、バリデーション性能、エコシステムの豊富さ

---

## Decision Principles

Ukiyoue フレームワークの技術選定における原則：

1. **厳密性優先**: 曖昧さを排除し、検証可能性を最大化
2. **標準準拠**: 業界標準（IETF、W3C）の技術を優先
3. **AI 最適化**: LLM が理解・生成しやすい形式
4. **ツール支援**: エディタ・ツールのサポートが充実
5. **実績重視**: 成熟した技術を採用
6. **将来性**: モダンで進化している技術

---

## ADR Status Definitions

| Status         | 説明                      |
| -------------- | ------------------------- |
| **Proposed**   | 提案中、レビュー待ち      |
| **Accepted**   | 承認済み、実装に使用      |
| **Deprecated** | 非推奨、新規使用禁止      |
| **Superseded** | 別の ADR に置き換えられた |
