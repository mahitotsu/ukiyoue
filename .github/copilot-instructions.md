# GitHub Copilot Instructions for Ukiyoue Framework

> **フレームワークの使命**: AI時代のプロジェクトドキュメント管理を革新し、使うほど品質が向上する好循環を実現する

---

## 🎯 このInstructionsの目的

Copilotを最大限に活用し、Ukiyoueプロジェクトへの貢献を効率的・効果的に行うためのガイドです。

**Copilotの役割**:

- コード生成とリファクタリングの支援
- ドキュメント作成の効率化
- デバッグとテストの自動化
- プロジェクト固有のパターン適用

**あなたの役割**:

- アーキテクチャ判断と設計決定
- Copilot提案の検証と承認
- プロジェクトビジョンの理解と実現

---

## 📚 プロジェクト理解のステップ

### Step 1: コアコンセプトを理解する（5分）

**まず読むべきドキュメント**: [`docs/concept.md`](../docs/concept.md)

**理解すべきポイント**:

- ✅ Ukiyoueが解決する問題（静的ドキュメント管理の限界）
- ✅ 2つの好循環（ミクロ: セッション内改善、マクロ: フレームワーク進化）
- ✅ 3つの柱（対話可能性、自動生成可能性、再利用可能性）
- ✅ AI-First設計の意味（AIとの協働を前提）

**具体例**:

```text
従来: 開発者が仕様書を手動作成 → 更新忘れ → 陳腐化
Ukiyoue: AI生成 → 自動検証 → フィードバック → 改善 → 蓄積（好循環）
```

### Step 2: アーキテクチャを把握する（10分）

**次に読むべきドキュメント**: [`docs/architecture.md`](../docs/architecture.md)

**理解すべきポイント**:

- ✅ 4層構造（Interface / Core Engine / Schema / Pattern Library）
- ✅ データフロー（ユーザードキュメント ← 読み取り専用 ← Ukiyoue）
- ✅ MCP Serverが主要インターフェース、CLIは補助
- ✅ 技術スタック（TypeScript, Bun, JSON Schema, JSON-LD, SHACL）

**依存関係の理解**:

```text
MCP Server → Validation Engine → JSON Schema + SHACL + Custom Rules
           → Semantic Engine → JSON-LD処理 → RDF変換
           → Component Manager → Templates & Components
           → Feedback Generator → アクション提案生成
```

### Step 3: 実装詳細を確認する（必要時）

**技術的な実装が必要な場合**: [`docs/implementation-guide.md`](../docs/implementation-guide.md)

**カバーする内容**:

- エンジンの詳細実装（Validation, Semantic, Component, Feedback）
- ライブラリの使用方法（Ajv, jsonld.js, rdf-validate-shacl）
- コード例とベストプラクティス

### Step 4: ユーザー視点を理解する（オプション）

**プロダクトビジョンを知りたい場合**: [`docs/working-backwards.md`](../docs/working-backwards.md)

**カバーする内容**:

- ユーザーシナリオとカスタマージャーニー
- よくある質問と回答
- 長期ビジョンとロードマップ

---

## 🛠️ タスク別ガイド

Copilotを効果的に使うために、タスクを分割し、具体的な手順を示します。

### タスク1: 新機能の実装

**コンテキスト設定**:

1. 関連するファイルを開く（無関係なファイルは閉じる）
   - エンジンの実装: `tools/mcp-server/src/engines/`
   - テストファイル: `tools/mcp-server/tests/`
   - スキーマ定義: `schemas/`

**プロンプト例**:

```text
# 悪い例（曖昧）
「バリデーションエンジンを改善して」

# 良い例（具体的）
「Validation Engineに以下の機能を追加してください：
- JSON Schemaエラーメッセージを日本語化
- エラー箇所のJSON Pointerを含める
- アクション提案を自動生成
- 既存のValidation Engineパターンに従う
- テストケースも作成」
```

**検証ステップ**:

1. ✅ 生成されたコードが既存のパターンに従っているか
2. ✅ TypeScriptの型定義が厳格か（`strict: true`）
3. ✅ エラーハンドリングがResult型パターンか
4. ✅ テストカバレッジが80%以上か
5. ✅ JSDocコメントがあるか

### タスク2: ドキュメントの作成・更新

**コンテキスト設定**:

1. 同種の既存ドキュメントを開く
2. `docs/` ディレクトリの構造を確認

**プロンプト例**:

```text
# 悪い例（フォーマット不明）
「新しいADRを作成して」

# 良い例（フォーマット指定）
「以下の形式に従って ADR-019 を作成してください：
- タイトル: MCP Tool Response Format
- 既存の docs/adr/001-document-format.md と同じフォーマット
- Status: Accepted（絵文字・日付なし）
- セクション区切り `---` は使用禁止
- Comparison Matrix: Weight は 1-5 の範囲
- 参考: ADR-013, ADR-014」
```

**検証ステップ**:

1. ✅ 既存ドキュメントと体裁が一致しているか
2. ✅ プロジェクト固有の用語を正しく使用しているか
3. ✅ リンクが正しく設定されているか
4. ✅ コード例がシンタックスエラーなしで実行可能か

### タスク3: テストの作成

**コンテキスト設定**:

1. テスト対象のソースファイルを開く
2. 既存のテストファイルを参照用に開く

**プロンプト例**:

```text
# 良い例（テストパターン指定）
「Validation Engine の新機能に対するユニットテストを作成してください：
- フレームワーク: Bun test
- カバレッジ: 正常系、異常系、エッジケース
- 既存の tests/validation-engine.test.ts のパターンに従う
- モック: 外部依存はモック化
- アサーション: 具体的なエラーメッセージも検証」
```

**検証ステップ**:

1. ✅ すべてのテストがパスするか（`bun test`）
2. ✅ カバレッジが80%以上か
3. ✅ エッジケースをカバーしているか
4. ✅ テスト名が分かりやすいか（`describe` / `it` 構造）

### タスク4: リファクタリング

**コンテキスト設定**:

1. リファクタリング対象のファイルを開く
2. 依存しているファイルも開く（影響範囲の確認）

**プロンプト例**:

```text
# 良い例（目的と制約を明示）
「Semantic Engine のリファクタリングを実施してください：
目的: コードの可読性向上、パフォーマンス改善
制約:
- 既存のAPIインターフェースは変更しない
- テストは必ず全てパス
- 関数型スタイルを維持（純粋関数優先）
- 型安全性を強化
実施内容:
- 長い関数を小さな関数に分割
- 重複コードを共通化
- 型定義を厳格化」
```

**検証ステップ**:

1. ✅ すべてのテストがパスするか
2. ✅ APIの互換性が保たれているか
3. ✅ パフォーマンスが劣化していないか（ベンチマーク）
4. ✅ 型エラーが発生していないか（`bun run type-check`）

### タスク5: デバッグ

**コンテキスト設定**:

1. エラーが発生しているファイルを開く
2. 関連するテストファイルを開く
3. エラーメッセージをコピー

**プロンプト例**:

```text
# 良い例（エラー詳細と期待動作を明示）
「以下のエラーをデバッグしてください：
エラー: TypeError: Cannot read property 'testCases' of undefined
発生箇所: semantic-engine.ts:145
期待動作: testCases プロパティが undefined でも処理を継続
現状: undefined チェックが不足
コンテキスト:
- JSON-LD 展開後の RDF グラフを処理中
- testCases が省略可能なプロパティ
- エラーハンドリングは Result 型パターンで」
```

**検証ステップ**:

1. ✅ エラーが解消されたか
2. ✅ 根本原因を理解したか（Copilotに説明を求める）
3. ✅ 同様のエラーを防ぐ対策を講じたか
4. ✅ テストケースを追加したか（再発防止）

---

## ⚙️ プロジェクト固有のルールと原則

### アーキテクチャ原則（常に遵守）

**読み取り専用原則**:

- ✅ Ukiyoueはユーザーのドキュメントを**読み取るのみ**
- ❌ ドキュメントの変更・保存は一切しない
- 💡 理由: データの所有権はユーザーにある
- 💡 代わり: AIエージェントが直接編集・保存

**4層構造の維持**:

```text
Interface Layer → MCP Server (primary), CLI Tools (secondary)
Core Engine Layer → Validation, Semantic, Component, Feedback
Schema Layer → JSON Schema, JSON-LD, SHACL, Custom Rules
Pattern Library → Templates, Components (user-managed)
```

**データの分離**:

- 🔵 **Framework**: スキーマ定義、検証ロジック、ツール（Ukiyoue提供）
- 🟡 **User's Project**: ドキュメント、設定、キャッシュ、メトリクス（ユーザー管理）
- ⚠️ 両者を明確に分離すること

**好循環の維持**:

- **ミクロの好循環**: セッション内でAIの作業精度が向上する設計
- **マクロの好循環**: フレームワーク自体が進化する設計
- 💡 すべての変更は、この2つの好循環を強化または少なくとも損なわないこと

**3つの柱の実現**:

- 💬 **対話可能性**: AIが動的に情報を抽出・再構成できる
- 🤖 **自動生成可能性**: AIが自動生成・検証できる
- ♻️ **再利用可能性**: コンポーネント化された知識を再利用できる

**スケーラビリティ最優先**:

- 10,000+ ドキュメントでも効率的に機能すること
- 並列処理、キャッシュ、インデックス最適化を活用
- 計算量: O(log N) を目指す（O(N²) は避ける）

### 技術スタック（変更時は ADR 作成必須）

**ドキュメント層**:

- 形式: JSON（ADR-001）
- 構造定義: JSON Schema Draft 2020-12（ADR-002）
- セマンティック: JSON-LD 1.1（ADR-003）
- 参照戦略: 相対パス + Base IRI（ADR-018）

**検証層**:

- 構造検証: JSON Schema + Ajv v8（ADR-004）
- 要素識別: JSON Pointer RFC 6901（ADR-005）
- 意味検証: JSON-LD + SHACL（ADR-006）
- カスタムルール: YAML/JSON定義（ADR-007）

**実装層**:

- 言語: TypeScript 5.x（ADR-008）
- ランタイム: Bun 1.x（ADR-009）
- JSON-LD: jsonld.js（ADR-011）
- SHACL: rdf-validate-shacl（ADR-012）
- MCP: @modelcontextprotocol/sdk（ADR-013）
- CLI: Commander.js + chalk + ora（ADR-014）

**開発ツール**:

- テスト: Bun test（ADR-015）
- Lint/Format: Biome（ADR-016）
- CI/CD: GitHub Actions（ADR-017）

### コーディング規約（必須）

**TypeScript**:

- ✅ 厳格な型定義: `strict: true`
- ✅ 明示的な型注釈（型推論に頼りすぎない）
- ✅ `any` 型は原則禁止（やむを得ない場合は `unknown` を使用）
- 例:

  ```typescript
  // ❌ 悪い例
  function process(data: any) { ... }

  // ✅ 良い例
  function process(data: DocumentData): Result<ProcessedData> { ... }
  ```

**関数型スタイル**:

- ✅ 純粋関数を優先（副作用を最小化）
- ✅ イミュータブルなデータ構造
- ✅ 関数合成とパイプライン
- 例:

  ```typescript
  // ❌ 悪い例（副作用あり）
  let result: string;
  function setResult(value: string) {
    result = value;
  }

  // ✅ 良い例（純粋関数）
  function createResult(value: string): string {
    return value;
  }
  ```

**エラーハンドリング**:

- ✅ Result型パターン: `{ success: boolean; data?: T; error?: Error }`
- ❌ throw は避ける（予期しないエラーのみ）
- 例:

  ```typescript
  type Result<T> =
    | { success: true; data: T }
    | { success: false; error: Error };

  function validate(doc: Document): Result<ValidationReport> {
    try {
      const report = performValidation(doc);
      return { success: true, data: report };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }
  ```

**テスト**:

- ✅ すべての公開APIにユニットテスト
- ✅ カバレッジ80%以上
- ✅ `describe` / `it` 構造で明確に
- ✅ AAA パターン（Arrange / Act / Assert）
- 例:

  ```typescript
  describe("ValidationEngine", () => {
    it("should return success for valid document", () => {
      // Arrange
      const doc = createValidDocument();
      const engine = new ValidationEngine();

      // Act
      const result = engine.validate(doc);

      // Assert
      expect(result.success).toBe(true);
    });
  });
  ```

**ドキュメント**:

- ✅ 公開APIにJSDocコメント
- ✅ パラメータと戻り値の説明
- ✅ 使用例を含める
- 例:

  ````typescript
  /**
   * Validates a document against JSON Schema and SHACL rules.
   *
   * @param document - The document to validate
   * @param options - Validation options
   * @returns Validation result with errors and action suggestions
   *
   * @example
   * ```typescript
   * const result = await engine.validate(doc, { level: "semantic" });
   * if (!result.success) {
   *   console.error(result.error.message);
   * }
   * ```
   */
  async validate(document: Document, options: ValidationOptions): Promise<Result<ValidationReport>> {
    // ...
  }
  ````

### ドキュメント作成の厳格なルール

⚠️ **同じ種類のドキュメントは厳密に同じ体裁で作成すること。**

新規ドキュメントを作成する際は：

1. **必ず既存の同種ドキュメントを参照**してフォーマットを確認する
2. **完全に同一の構造を維持**する（セクション、見出しレベル、箇条書きスタイル、記号等）
3. **作成後、必ず既存ドキュメントと比較検証**する
4. フォーマットエラーがあれば即座に修正する

### ADR (Architecture Decision Records)

重要な技術的決定は必ず ADR として記録してください：

- **ファイル名**: 決定事項ベース（例: `001-document-format.md`）
- **内容**: Context, Decision, Consequences を含む
- **場所**: `docs/adr/`
- **参照**: architecture.md に記載されたADRリストを確認

**ADR固有の形式要件**：

- Status: `Accepted` のみ（絵文字 ❌、日付 ❌）
- セクション区切り: `---` **使用禁止**
- Context: 段落形式 + 箇条書き（要求事項/制約条件）、サブセクション ❌
- Decision: シンプルな決定文のみ、"根拠" サブセクション ❌
- Options: `### Option A:`, `### Option B:` 形式、✅/⚠️/❌ で評価
- Comparison Matrix:
  - 重み（Weight）は **1-5 の範囲**（5-20 等の大きい数値 ❌）
  - 正規化スコア = `(合計/重み合計) × 30`（/10 ❌）
- Consequences: Positive/Negative/Neutral サブセクション、絵文字 ❌
- Related: シンプルなリンクリスト

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
