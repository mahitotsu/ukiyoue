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
├── specs/                # フレームワーク仕様書（詳細は specs/README.md）
├── schemas/              # JSON Schema定義（未実装）
├── semantics/            # JSON-LD定義（未実装）
├── tools/                # CLIツール群（未実装）
├── examples/             # サンプルと実証実験（未実装）
└── README.md             # このファイル
```

### 現在の状態（Phase 0: 仕様設計）

- ✅ コンセプト、要件定義、技術選定（ADR）完了
- 📋 次: ドキュメント一覧と入出力関係の定義

詳細は [`specs/README.md`](specs/README.md) を参照してください。

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

---

## 🛠️ 技術スタック

- **データフォーマット**: JSON
- **構造定義**: JSON Schema Draft-07
- **意味定義**: JSON-LD 1.1
- **実装言語**: TypeScript + Bun

技術選定の詳細は [`specs/design-decisions/`](specs/design-decisions/) のADRを参照してください。

---

## 📚 ドキュメント

- **仕様書**: [`specs/`](specs/) - フレームワークの設計思想、要件、アーキテクチャ
- **使い方**: 未実装（Phase 1以降で整備予定）
- **開発ガイド**: 未実装（Phase 1以降で整備予定）

---

## 🚀 はじめ方

### 仕様を読む

```bash
git clone https://github.com/mahitotsu/ukiyoue.git
cd ukiyoue/specs
```

1. [`concept.md`](specs/concept.md) - なぜこのフレームワークが必要か
2. [`requirements.md`](specs/requirements.md) - 何を実現するのか
3. [`architecture.md`](specs/architecture.md) - どう実現するのか
4. [`design-decisions/`](specs/design-decisions/) - 技術選定の背景

### 実装に参加する

Phase 0（仕様設計）を完了し、Phase 1（実装）の準備中です。
コントリビューション方法は今後整備します。

---

## 📈 開発ロードマップ

````

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
````

### 基本的な使い方（予定）

````bash
# 新しいプロジェクトでukiyoueを初期化
ukiyoue init my-project

# ドキュメントの妥当性検証
ukiyoue validate docs/

# ドキュメントの生成
ukiyoue generate --template=api-spec --output=docs/api.md

---

## 🛠️ 開発環境

### 前提条件

- [Bun](https://bun.sh/) v1.0.0 以上

### セットアップ

```bash
# リポジトリのクローン
git clone https://github.com/mahitotsu/ukiyoue.git
cd ukiyoue

# 依存関係のインストール
bun install
````

### コードフォーマット

このプロジェクトでは [Prettier](https://prettier.io/) を使用してコードフォーマットを統一しています。

#### 自動フォーマット（推奨）

**Git commit時に自動実行**されます：

```bash
git add .
git commit -m "your message"
# ↑ コミット前に自動でフォーマットが実行されます
# フォーマット失敗時はコミットが中止されます
```

[Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/lint-staged/lint-staged) により、変更されたファイルのみが自動フォーマットされます。

#### 手動フォーマット

```bash
# すべてのファイルをフォーマット
bun run format

# フォーマットをチェック（CIで使用）
bun run format:check

# JSONファイルのみフォーマット
bun run format:json

# Markdownファイルのみフォーマット
bun run format:docs
```

**VS Code** を使用している場合、保存時に自動フォーマットが有効になります。

### 推奨拡張機能

`.vscode/extensions.json` に推奨拡張機能が定義されています：

- **Prettier** - コードフォーマッター
- **Markdown Lint** - Markdown 品質チェック
- **YAML** - YAML サポート
- **JSON Language Service** - JSON スキーマサポート

---

## 🤝 コントリビューション

このプロジェクトへの貢献を歓迎します！

- Issue: バグ報告や機能要望
- Pull Request: コードやドキュメントの改善
- Discussion: アイデアや質問

**貢献前に**:

1. コードフォーマット: `bun run format` を実行してください
2. フォーマットチェック: `bun run format:check` が通ることを確認してください

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
