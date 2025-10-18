# Ukiyoue Framework - Architecture

## フレームワークのアーキテクチャ設計

## 🎯 このドキュメントの目的

Ukiyoue フレームワークの全体アーキテクチャと技術選定を示します。

**対象読者**: フレームワーク開発者、貢献者
**使用場面**: 実装開始前、設計レビュー時

## 📋 技術選定

以下の技術基盤が ADR（Architecture Decision Record）で決定されています：

| 決定事項                      | 選定結果                     | ADR                                                             |
| ----------------------------- | ---------------------------- | --------------------------------------------------------------- |
| **データフォーマット**        | JSON + JSON Schema + JSON-LD | [ADR-001](design-decisions/001-data-format-and-schema.md)       |
| **JSON Schema バージョン**    | Draft-07                     | [ADR-002](design-decisions/002-json-schema-draft-version.md)    |
| **JSON-LD バージョン**        | 1.1                          | [ADR-003](design-decisions/003-json-ld-version.md)              |
| **ツール実装言語/ランタイム** | TypeScript + Bun             | [ADR-004](design-decisions/004-tool-implementation-language.md) |

**選定理由の要約**:

- **JSON + JSON Schema + JSON-LD**: 厳密な構造化、完全な検証可能性、AI/LLM 最適化、セマンティック対応
- **Draft-07**: 最大のツールサポート（ajv, VSCode）、6年以上の実績
- **JSON-LD 1.1**: W3C 最新勧告、強力な意味定義機能
- **TypeScript + Bun**: 最高の JSON エコシステム、高速実行

詳細は各 ADR を参照してください。

## 🏗️ アーキテクチャ概要

### 4 層構成

```text
Tools Layer (TypeScript + Bun)
  └─ Validator, Generator, Analyzer, CLI
       ↓
Semantics Layer (JSON-LD 1.1)
  └─ Context, Vocabularies
       ↓
Schema Layer (JSON Schema Draft-07)
  └─ Base Schema, Document Type Schemas
       ↓
Data Layer (JSON)
  └─ JSON Documents
```

### 各層の責務

| 層                  | 責務                         | 技術                 | 決定根拠         |
| ------------------- | ---------------------------- | -------------------- | ---------------- |
| **Tools Layer**     | バリデーション、生成、分析   | TypeScript + Bun     | ADR-004          |
| **Semantics Layer** | 意味・関係性の定義           | JSON-LD 1.1          | ADR-001, ADR-003 |
| **Schema Layer**    | 構造の形式的定義と検証ルール | JSON Schema Draft-07 | ADR-001, ADR-002 |
| **Data Layer**      | ドキュメントの実際の内容     | JSON                 | ADR-001          |

## 📍 現在の状態（Phase 0）

### 完了済み

- ✅ **仕様策定**: concept, requirements, ADRs
- ✅ **プロジェクト構成**: ワークスペース、package.json
- ✅ **開発環境**: Husky, lint-staged, markdownlint

### ディレクトリ構造

```text
ukiyoue/
├── specs/                    # ✅ 仕様ドキュメント（Phase 0）
│   ├── concept.md
│   ├── requirements.md
│   ├── architecture.md       # このドキュメント
│   └── design-decisions/
│       ├── 001-data-format-and-schema.md
│       ├── 002-json-schema-draft-version.md
│       ├── 003-json-ld-version.md
│       └── 004-tool-implementation-language.md
├── schemas/                  # ⏳ 未実装
├── semantics/                # ⏳ 未実装
├── tools/                    # ⏳ 未実装
├── examples/                 # ⏳ 未実装
└── package.json              # ✅ プロジェクト設定
```

## 🎯 次のステップ

Phase 1 以降の詳細は、実装開始時に別途設計します。

現時点での方針：

1. Schema Layer の設計から開始
2. Tools Layer（Validator）の実装
3. Example Documents による検証

## 📚 関連ドキュメント

- [concept.md](concept.md) - フレームワークのコンセプトと背景
- [requirements.md](requirements.md) - 機能要件・非機能要件
- [design-decisions/](design-decisions/) - 技術選定の根拠（ADR）
