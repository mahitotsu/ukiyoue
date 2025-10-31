# ブログ管理システム - ビジネス要件定義

新規ブログ管理システムの構築プロジェクト例です。

## 🎯 プロジェクト概要

個人ブロガーがSEOに強く、継続的に更新しやすいブログシステムを構築するためのビジネス要件定義サンプルです。

## 📦 セットアップ

```bash
# Ukiyoue MCPサーバーをインストール
bun install @ukiyoue/mcp-server

# または開発版（このリポジトリから）
bun install
```

`@ukiyoue/mcp-server`をインストールすると、`@ukiyoue/core`が依存関係として自動的にインストールされます。

MCPサーバーは`node_modules/.bin/ukiyoue-mcp`として利用できます。

## 📂 ドキュメント構成

- `documents/` - ドキュメントファイル
  - `BG-001-seo-optimization.json` - ビジネスゴール: SEO最適化
  - `UC-001-keyword-selection.json` - ユースケース: キーワード選定
  - `UC-002-metadata-optimization.json` - ユースケース: メタデータ最適化
  - `SM-001-search-traffic.json` - 成功指標: 検索流入数
  - `CN-001-no-external-api.json` - 制約: 外部API不使用
- `scripts/` - テスト・開発用スクリプト
- `.mcp/` - MCP設定

## 🔧 GitHub Copilotでの設定

このプロジェクトは、Ukiyoue FrameworkのPhase 1 PoCとして、
GitHub Copilotとの連携による実践検証を目的としています。

### 設定方法

VS Codeの設定ファイルに以下を追加:

```json
{
  "github.copilot.chat.codeGeneration.instructions": [
    {
      "text": "Use Ukiyoue Framework MCP tools for document validation"
    }
  ]
}
```

MCPサーバーは`node_modules/.bin/ukiyoue-mcp`として利用できます。

## 🚀 使用方法

### Phase 1-E: 実践検証

GitHub Copilotを使って、ドキュメント駆動開発を体験：

#### 1. 既存ドキュメントの検証

```text
documents/BG-001-seo-optimization.jsonを検証してください
```

#### 2. 新規ドキュメントの作成

```text
新しいビジネスゴール「コンテンツ品質向上」(BG-002)を作成してください。
関連するユースケースと成功指標も追加してください。
```

#### 3. エラー修正のフィードバックループ

```text
BG-002の検証エラーを確認して、修正案を提示してください
```

### PoC検証項目

- [ ] ドキュメント作成フローが自然か
- [ ] エラーメッセージが理解できるか
- [ ] 修正提案が適切か
- [ ] セッション内で完結できるか
- [ ] フィードバックループが機能するか

### 開発者向けテスト

MCPサーバーの動作確認:

```bash
bun run scripts/test-mcp.ts
```
