# Tools

このディレクトリには、新しいプロジェクトドキュメントを扱うための**ツール群**が含まれます。

## 📋 概要

**目的**: ドキュメントの整形、妥当性検証、定量評価、定性評価などを自動化するツールを提供

## 📁 構成

```
tools/
├── README.md              # このファイル
├── cli/                   # コマンドラインツール
│   ├── ukiyoue-cli.js     # メインCLI
│   └── commands/          # サブコマンド
├── validators/            # バリデーター
│   ├── schema-validator.js
│   ├── link-checker.js
│   └── consistency-checker.js
├── generators/            # ジェネレーター
│   ├── template-generator.js
│   └── doc-generator.js
├── analyzers/             # 分析ツール
│   ├── impact-analyzer.js
│   ├── quality-analyzer.js
│   └── semantic-search.js
└── formatters/            # フォーマッター
    └── json-to-markdown.js
```

## 🛠️ ツールカテゴリ

### 1. バリデーション (Validation)

ドキュメントの妥当性を検証します。

**提供する機能**:

- ✅ JSON Schema による構造検証
- ✅ リンク切れチェック
- ✅ 用語の一貫性チェック
- ✅ メタデータの必須項目チェック

**使用例**:

```bash
# スキーマ検証
ukiyoue validate --schema schemas/technical-spec.schema.json \
                 --document examples/my-spec.json

# リンク切れチェック
ukiyoue check-links --directory examples/

# 一貫性チェック
ukiyoue check-consistency --documents "examples/**/*.json"
```

### 2. 生成 (Generation)

ドキュメントやテンプレートを生成します。

**提供する機能**:

- ✅ テンプレートからのドキュメント生成
- ✅ スキーマからのドキュメント骨格生成
- ✅ マークダウンへの変換

**使用例**:

```bash
# テンプレートから生成
ukiyoue generate --template technical-spec \
                 --output my-spec.json

# JSONからMarkdownへ変換
ukiyoue convert --from json --to markdown \
                --input my-spec.json \
                --output my-spec.md
```

### 3. 分析 (Analysis)

ドキュメントを分析し、品質や影響範囲を評価します。

**提供する機能**:

- ✅ 品質スコアの算出
- ✅ 影響範囲の分析
- ✅ セマンティック検索
- ✅ 依存関係の可視化

**使用例**:

```bash
# 品質分析
ukiyoue analyze quality --document my-spec.json

# 影響範囲分析
ukiyoue analyze impact --document architecture.json

# セマンティック検索
ukiyoue search --query "認証の実装方法" \
               --directory examples/

# 依存関係グラフ生成
ukiyoue graph dependencies --output deps.svg
```

### 4. フォーマット (Formatting)

ドキュメントを整形します。

**提供する機能**:

- ✅ JSON の整形
- ✅ フォーマット統一
- ✅ メタデータの自動補完

**使用例**:

```bash
# フォーマット
ukiyoue format --document my-spec.json

# メタデータ補完
ukiyoue complete-metadata --document my-spec.json
```

## 📊 評価機能

### 定量評価 (Quantitative Evaluation)

数値で測定可能な指標を評価します。

**指標例**:

```yaml
metrics:
  - completeness: 必須項目の充足率 (0-100%)
  - link_health: リンクの有効率 (0-100%)
  - freshness: 最終更新からの経過日数
  - reuse_count: 再利用された回数
  - consistency_score: 用語の一貫性スコア
```

**出力例**:

```json
{
  "document": "my-spec.json",
  "score": 85,
  "metrics": {
    "completeness": 100,
    "link_health": 95,
    "freshness": 2,
    "reuse_count": 5,
    "consistency_score": 80
  }
}
```

### 定性評価 (Qualitative Evaluation)

品質の質的側面を評価します。

**評価項目例**:

```yaml
criteria:
  - clarity: 明確さ（理解しやすさ）
  - relevance: 関連性（目的との適合度）
  - usability: 使いやすさ（実用性）
  - maintainability: 保守性（更新のしやすさ）
```

**評価方法**:

- AI による自動評価
- チェックリストによる評価
- レビュアーによる評価

## 🚀 実装予定

### Phase 1: 基本ツール

- [ ] JSON Schema validator
- [ ] Link checker
- [ ] Basic CLI

### Phase 2: 生成・変換

- [ ] Template generator
- [ ] JSON to Markdown converter
- [ ] Metadata auto-completion

### Phase 3: 分析・評価

- [ ] Quality analyzer
- [ ] Impact analyzer
- [ ] Semantic search

### Phase 4: 高度な機能

- [ ] AI-powered evaluation
- [ ] Dependency graph visualization
- [ ] Real-time collaboration support

## 💻 技術スタック

```yaml
runtime: Node.js
language: JavaScript/TypeScript
dependencies:
  - ajv: JSON Schema validation
  - json-ld: JSON-LD processing
  - commander: CLI framework
  - chalk: Terminal styling
  - ora: Loading spinners
```

## 📚 使用方法

```bash
# インストール
npm install -g @ukiyoue/cli

# ヘルプ
ukiyoue --help

# バージョン確認
ukiyoue --version
```
