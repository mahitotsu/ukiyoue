# Ukiyoue (浮世絵)

**AI 時代のプロジェクトドキュメント フレームワーク**

> AI 活用が当たり前となった時代における、プロジェクトドキュメントの新しい形を実現するフレームワーク

---

## 🎯 プロジェクト概要

### 問題意識

現在、IT システムのデリバリーにおいて AI によるコーディングは当たり前になってきました。しかし、**プロジェクトドキュメント**はまだ AI 活用を前提とした設計になっていません。

### 本プロジェクトの目的

AI 活用時代のプロジェクトドキュメントに必要な**フレームワーク**（ツール、定義、実証）を開発し、その有効性を実証すること。

### 成果物

このプロジェクトは以下を提供します：

1. **スキーマ定義** - ドキュメント構造の形式的定義
2. **セマンティック定義** - ドキュメントの意味・コンテキストの定義
3. **ツール群** - ドキュメントの生成・検証・評価ツール
4. **実証実験** - フレームワークを活用した実例

---

## 🏗️ プロジェクト構造

```
ukiyoue/
├── schemas/              # JSON Schemaによる構造定義
│   ├── README.md         # スキーマの概要と使い方
│   ├── document-base.schema.json     # 基底スキーマ
│   ├── types/            # ドキュメントタイプ別スキーマ
│   │   ├── technical-spec.schema.json
│   │   ├── design-doc.schema.json
│   │   └── api-doc.schema.json
│   └── components/       # 再利用可能なスキーマコンポーネント
│       ├── metadata.schema.json
│       └── author.schema.json
│
├── semantics/            # JSON-LDによるセマンティック定義
│   ├── README.md         # セマンティック定義の概要
│   ├── context.jsonld    # 基本コンテキスト定義
│   ├── vocabularies/     # 語彙定義
│   │   ├── document.jsonld
│   │   └── project.jsonld
│   └── ontologies/       # オントロジー定義
│       └── relationships.jsonld
│
├── tools/                # ツール群
│   ├── README.md         # ツールの概要
│   ├── cli/              # CLIツール
│   ├── validators/       # バリデーター
│   ├── generators/       # ジェネレーター
│   ├── analyzers/        # 分析ツール
│   └── formatters/       # フォーマッター
│
├── examples/             # 実証実験とサンプル
│   ├── README.md         # 実証実験の概要
│   ├── sample-project/   # サンプルプロジェクト
│   ├── templates/        # ドキュメントテンプレート
│   └── case-studies/     # ケーススタディ
│
├── specs/                # フレームワーク自体の仕様書
│   ├── README.md         # 仕様書の概要
│   ├── concept.md        # コンセプトと背景
│   ├── requirements.md   # 要件定義
│   ├── architecture.md   # アーキテクチャ設計
│   ├── design-decisions/ # 設計判断の記録(ADR)
│   │   ├── 001-json-as-base-format.md
│   │   ├── 002-json-schema-for-structure.md
│   │   └── 003-json-ld-for-semantics.md
│   └── specifications/   # 詳細仕様
│       ├── schema-spec.md
│       ├── semantic-spec.md
│       └── tool-spec.md
│
└── README.md             # このファイル
```

### ディレクトリの役割

| ディレクトリ | 役割                   | 技術               |
| ------------ | ---------------------- | ------------------ |
| `schemas/`   | ドキュメント構造の定義 | JSON Schema        |
| `semantics/` | 意味・関係性の定義     | JSON-LD            |
| `tools/`     | 自動化ツールの提供     | Node.js/TypeScript |
| `examples/`  | 実証実験と使用例       | JSON + ツール適用  |
| `specs/`     | フレームワークの仕様   | Markdown           |

---

## 🎭 フレームワークの 3 つの柱

このフレームワークが実現するドキュメントの要件：

### 1. 💬 対話可能 (Conversational)

AI や AI を介して人間が必要な情報を対話的に取り出せる。ドキュメントは静的なものではなく動的に再構成可能。

**フレームワークが提供**:

- セマンティック検索を可能にする構造定義
- コンテキストに応じた情報抽出のための関係性定義
- 複数視点からの再構成を支援するツール

### 2. 🤖 自動生成可能 (Auto-generatable)

AI によって編集可能。形式的にも内容的にも妥当性が検証可能で、差分把握や履歴管理も可能。

**フレームワークが提供**:

- 構造化された形式の定義（スキーマ）
- 妥当性検証ツール（バリデーター）
- 自動生成ツール（ジェネレーター）

### 3. ♻️ 再利用可能 (Reusable)

車輪の再発明を防ぎ、継続的な改善により品質を高める。意味や意図を維持したまま適切に再利用可能。

**フレームワークが提供**:

- コンポーネント化のためのスキーマ定義
- 再利用可能性の評価ツール
- 発見可能性を高めるセマンティック定義

---

## � 技術スタック

### コア技術

```yaml
data_format: JSON
  理由:
    - 人間とAIの両方が扱いやすい
    - 広くサポートされている
    - 既存ツールが豊富

structure_definition: JSON Schema
  理由:
    - 構造の形式的定義が可能
    - 自動バリデーションが容易
    - エディタサポート（補完・検証）
    - 標準化されている（IETF標準）

semantic_definition: JSON-LD
  理由:
    - 意味・関係性を表現可能
    - セマンティック検索が可能
    - W3C標準
    - 既存JSONとの互換性
```

### 実装技術（予定）

```yaml
runtime: Node.js
language: JavaScript/TypeScript

key_libraries:
  validation:
    - ajv: JSON Schema validation
    - ajv-formats: 追加のフォーマット検証

  semantic:
    - jsonld: JSON-LD processing
    - n3: RDF/Turtle processing

  cli:
    - commander: CLI framework
    - inquirer: インタラクティブプロンプト
    - chalk: ターミナル装飾
    - ora: ローディング表示

  analysis:
    - natural: 自然言語処理
    - sentiment: 感情分析

  generation:
    - handlebars: テンプレートエンジン
    - marked: Markdown処理
```

### 技術選定の分析

詳細な技術選定の是非・優位性・他の選択肢の分析は以下を参照：

- [`specs/design-decisions/001-json-as-base-format.md`](specs/design-decisions/001-json-as-base-format.md)
- [`specs/design-decisions/002-json-schema-for-structure.md`](specs/design-decisions/002-json-schema-for-structure.md)
- [`specs/design-decisions/003-json-ld-for-semantics.md`](specs/design-decisions/003-json-ld-for-semantics.md)

---

## �📚 ドキュメント構成

### フレームワーク仕様書

| ドキュメント                                                                 | 目的                       | 対象   |
| ---------------------------------------------------------------------------- | -------------------------- | ------ |
| [`docs/specification/overview.md`](docs/specification/overview.md)           | フレームワーク全体像       | 全員   |
| [`docs/specification/requirements.md`](docs/specification/requirements.md)   | 要件定義（3 つの柱の詳細） | 開発者 |
| [`docs/specification/architecture.md`](docs/specification/architecture.md)   | アーキテクチャ設計         | 開発者 |
| [`docs/specification/schema-design.md`](docs/specification/schema-design.md) | スキーマ設計方針           | 開発者 |

### 使い方ガイド

| ドキュメント                                                               | 目的             | 対象     |
| -------------------------------------------------------------------------- | ---------------- | -------- |
| [`docs/user-guide/getting-started.md`](docs/user-guide/getting-started.md) | クイックスタート | ユーザー |
| [`docs/user-guide/schema-usage.md`](docs/user-guide/schema-usage.md)       | スキーマの使い方 | ユーザー |
| [`docs/user-guide/tools-usage.md`](docs/user-guide/tools-usage.md)         | ツールの使い方   | ユーザー |

### 開発者向け

| ドキュメント                                                                   | 目的             | 対象   |
| ------------------------------------------------------------------------------ | ---------------- | ------ |
| [`docs/development/contributing.md`](docs/development/contributing.md)         | 貢献ガイド       | 開発者 |
| [`docs/development/tool-development.md`](docs/development/tool-development.md) | ツール開発ガイド | 開発者 |

---

## � クイックスタート

### インストール（予定）

```bash
# npm経由でインストール
npm install -g ukiyoue

# または、直接クローン
git clone https://github.com/mahitotsu/ukiyoue.git
cd ukiyoue
npm install
```

### 基本的な使い方（予定）

```bash
# 新しいプロジェクトでukiyoueを初期化
ukiyoue init my-project

# ドキュメントの妥当性検証
ukiyoue validate docs/

# ドキュメントの生成
ukiyoue generate --template=api-spec --output=docs/api.md

# ドキュメントの評価
ukiyoue evaluate docs/ --report=quality-report.json
```

---

## 📈 開発ロードマップ

### Phase 0: 基盤設計 (現在)

- [x] プロジェクトコンセプトの定義
- [x] 3 つの要件の明確化
- [ ] スキーマ定義の設計
- [ ] セマンティック定義の設計

### Phase 1: スキーマ実装

- [ ] ドキュメント構造スキーマ
- [ ] メタデータスキーマ
- [ ] 検証ルール定義

### Phase 2: ツール開発

- [ ] バリデーターの実装
- [ ] ジェネレーターの実装
- [ ] フォーマッターの実装
- [ ] CLI の実装

### Phase 3: 実証実験

- [ ] サンプルプロジェクトでの検証
- [ ] 評価ツールの開発
- [ ] ケーススタディの作成

### Phase 4: 公開

- [ ] ドキュメント整備
- [ ] テストカバレッジ向上
- [ ] パッケージ公開（npm）

---

## 🤝 コントリビューション

このプロジェクトへの貢献を歓迎します！

- Issue: バグ報告や機能要望
- Pull Request: コードやドキュメントの改善
- Discussion: アイデアや質問

詳細は [`docs/development/contributing.md`](docs/development/contributing.md) を参照してください。

---

## 📄 ライセンス

MIT License (予定)

---

## 🎨 プロジェクト名の由来

**Ukiyoue (浮世絵)**: 江戸時代の日本で発展した版画芸術

**共通点**:

- 🖨️ **複製可能性**: 版画技術による大量複製 → ドキュメントの再利用
- 🎭 **多様な視点**: 同じ題材を異なる角度で表現 → 動的な再構成
- 📖 **体系的分類**: ジャンルや流派による整理 → 構造化とメタデータ
- ♻️ **継承と発展**: 師弟関係による技法の継承と進化 → 継続的改善

伝統的な知識継承の知恵と AI 時代の新しい可能性を結びつける象徴として名付けました。

---

## 📞 連絡先

- GitHub: [@mahitotsu](https://github.com/mahitotsu)
- Repository: [ukiyoue](https://github.com/mahitotsu/ukiyoue)
