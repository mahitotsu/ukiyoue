# GitHub Copilot Instructions for Ukiyoue Framework

Ukiyoue: AI時代のドキュメンテーション・フレームワーク

## 重要ドキュメント

このプロジェクトに貢献する前に、以下のドキュメントを必ず参照してください：

### 必読ドキュメント

1. **[`docs/concept.md`](../docs/concept.md)** - フレームワークの核心コンセプト
   - Ukiyoueが解決する問題と背景
   - 2つのレベルの好循環（ミクロ・マクロ）
   - 3つの柱（対話可能性、自動生成可能性、再利用可能性）
   - スケーラビリティとAI時代のドキュメントの本質
   - 実装アプローチと品質保証の仕組み

2. **[`docs/architecture.md`](../docs/architecture.md)** - システムアーキテクチャと技術設計
   - システム構成図とデータフロー
   - 4層構造（Interface, Core Engine, Schema, Pattern Library）
   - 技術スタック（TypeScript, Bun, JSON Schema, JSON-LD, SHACL）
   - MCPツール定義とCLIコマンド
   - ユーザープロジェクト構造
   - テスト戦略とCI/CD

3. **[`docs/working-backwards.md`](../docs/working-backwards.md)** - プロダクトビジョンとFAQ
   - Amazon's Working Backwards手法によるPR/FAQ
   - ユーザーシナリオと期待される効果
   - よくある質問と回答
   - プロダクトの価値提案

### コンテキスト理解のポイント

コード変更や新機能追加の際は、以下を常に意識してください：

- **好循環の維持**: ミクロの好循環（セッション内の品質向上）とマクロの好循環（フレームワークの進化）を損なわない
- **3つの柱の実現**:
  - 💬 **対話可能性 (Conversational)**: AIが動的に情報を抽出・再構成できる
  - 🤖 **自動生成可能性 (Auto-generatable)**: AIが自動生成・検証できる
  - ♻️ **再利用可能性 (Reusable)**: コンポーネント化された知識を再利用できる
- **MCP優先**: MCP Serverが主要インターフェース、CLIは補助的
- **スケーラビリティ**: 大規模プロジェクト（10,000+ドキュメント）でも効率的に機能する設計
- **AI-First**: AIエージェントとの協働を前提とした設計
- **品質保証の自動化**: JSON Schema + セマンティックルール + アクション提案による自動検証

---

## 技術的原則

### アーキテクチャ原則

1. **読み取り専用原則**: Ukiyoueはユーザーのドキュメントを**読み取るのみ**。変更・保存は一切しない
   - データの所有権はユーザーにある
   - フレームワークは検証結果とフィードバックのみを提供
   - AIエージェントがドキュメントを直接編集・保存

2. **4層構造の維持**:
   - **Interface Layer**: MCP Server (primary), CLI Tools (secondary)
   - **Core Engine Layer**: Validation, Semantic, Component Manager, Feedback Generator
   - **Schema Layer**: JSON Schema, JSON-LD Context, SHACL Shapes, Custom Rules
   - **Pattern Library**: Templates, Components (user-managed)

3. **データの分離**:
   - **Framework**: スキーマ定義、検証ロジック、ツール（青色）
   - **User's Project**: ドキュメント、設定、キャッシュ、メトリクス（黄色）
   - 両者を明確に分離すること

### 技術スタック

- **ドキュメント形式**: JSON
- **構造検証**: JSON Schema (Draft 2020-12)
- **セマンティック定義**: JSON-LD 1.1
- **セマンティック検証**: SHACL
- **実装言語**: TypeScript 5.x
- **ランタイム**: Bun 1.x
- **主要ライブラリ**: Ajv, jsonld.js, rdf-validate-shacl, @modelcontextprotocol/sdk
- **テスト**: Bun native test framework
- **Lint/Format**: Biome
- **CI/CD**: GitHub Actions

### コーディング規約

1. **TypeScript**: 厳格な型定義、`strict: true`
2. **関数型スタイル**: 純粋関数を優先、副作用を最小化
3. **エラーハンドリング**: Result型パターン（`{ success: boolean; data?: T; error?: Error }`）
4. **テスト**: すべての公開APIに対してユニットテストを記述
5. **ドキュメント**: 公開APIにJSDocコメントを記述

### ADR (Architecture Decision Records)

重要な技術的決定は必ず ADR として記録してください：

- **ファイル名**: 決定事項ベース（例: `001-document-format.md`）
- **内容**: Context, Decision, Consequences を含む
- **場所**: `docs/adr/`
- **参照**: architecture.md に記載されたADRリストを確認

---

## 開発ワークフロー

### ブランチ戦略

- `main`: 常にデプロイ可能な状態
- `feature/*`: 新機能開発
- `fix/*`: バグ修正
- `docs/*`: ドキュメント更新

### コミットメッセージ

Conventional Commits を使用：

```text
feat: MCP Server に validate ツールを実装
fix: JSON Schema バリデーションのエラーハンドリング修正
docs: architecture.md にデータフロー図を追加
test: Validation Engine のユニットテスト追加
refactor: Semantic Engine のインターフェース改善
```

### Pull Request

- タイトル: Conventional Commits形式
- 説明: 変更の背景、影響範囲、テスト結果
- レビュー: 少なくとも1名の承認が必要
- CI: すべてのチェックがパスすること

---

## よくある質問

### Q: ユーザーのドキュメントを自動修正すべきでは？

**A**: いいえ。Ukiyoueは**読み取り専用**です。

- 理由: データの所有権はユーザーにある
- 代わりに: フィードバックとアクション提案を提供し、AIまたは人間が修正を判断・実行

### Q: MCPとCLIの使い分けは？

**A**: MCP Serverが主、CLIが補助です。

- **MCP Server**: AIエージェントとの統合（メイン用途）
- **CLI Tools**: 人間による手動操作、CI/CD統合（補助用途）

### Q: パフォーマンス要件は？

**A**: 大規模プロジェクト（10,000+ドキュメント）でも効率的に動作すること。

- 並列処理を活用
- セマンティック検索は O(log N)
- 検証結果はキャッシュ活用

### Q: ADRのメタデータ（作成者、日付、変更履歴）はどうする？

**A**: **Gitで管理します。ADR内に重複記録しません。**

- **作成者・日付**: `git log` と `git blame` で確認
- **変更履歴**: `git log` と `git diff` で確認
- **レビュアー・承認**: Pull Requestで管理
- **ADRの役割**: 決定のコンテキスト、選択肢の比較、判断理由に集中

これはプロジェクトの重要な方針です。すべてのドキュメントで同様の原則を適用します。
