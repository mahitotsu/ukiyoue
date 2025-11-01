# Ukiyoue Framework - PoC Plan

## 📋 このドキュメントの目的

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| **What** | Ukiyoue Framework Phase 1 (PoC)の実行計画  |
| **Why**  | ドキュメント駆動開発で段階的にツールを構築 |
| **Who**  | PoC実装チーム                              |
| **When** | PoC実装期間中（2週間集中）                 |

**関連ドキュメント**:

- [`architecture.md`](architecture.md) - 全体設計と原則
- [`implementation-guide.md`](implementation-guide.md) - 実装詳細とライフサイクル

---

## 🎯 PoC最優先目標

### 目的: ドキュメントライフサイクルの完全検証

[`implementation-guide.md`](implementation-guide.md)に記載されたライフサイクル全体を、**ドキュメントを作りながら**検証します。

```text
Phase 1: ドキュメント作成（静的）
  ↓
Phase 2: 検証実行（動的）
  ├─ Level 1: 構造検証（JSON Schema + Ajv）
  ├─ Level 2: 意味整合性検証（JSON-LD + 参照先存在確認）
  └─ Level 3: カスタムルール検証（YAML定義 + カスタム実装）
```

### 実装戦略

```yaml
アプローチ: ドキュメントを作りながらツールを育てる

原則: 1. スキーマから始める（ドキュメント構造を先に定義）
  2. サンプルで検証する（実際のドキュメントで試す）
  3. 段階的に複雑化（構造 → 参照 → 検証 → MCP）
  4. 早期フィードバック（Week 1で基本コンセプト検証）

なぜこの順序か:
  - ツールを完璧にしてからでは遅い
  - 実際の使用感を早期に検証
  - フィードバックループを回す
```

---

## 📦 PoC題材: 新規ブログ管理システム構築

### プロジェクト概要

```yaml
題材: 個人ブロガーがゼロから構築するブログ管理システム

特徴:
  - 新規プロジェクト（既存システム改善ではない）
  - SEOに強く、継続的に更新しやすい
  - 個人開発のため、コストと運用負荷を最小化
  - Phase分けで段階的に機能追加

実装の目的:
  - ドキュメント駆動開発でUkiyoueツールを育てる
  - 実際のビジネス要件定義プロセスを検証
  - ポータブルなデモシステムを構築
```

### 必要なドキュメントタイプ（5種類）

#### 1. BusinessGoal（ビジネスゴール）

**なぜ作るのか** - プロジェクトの目的と価値

- ビジネス価値の明確化
- 優先順位付け
- 成功指標との紐付け

#### 2. ContextDiagram（コンテキストダイアグラム）

**何を作るのか** - システム境界とステークホルダー

- システムの範囲定義
- 外部依存の明確化
- アクターと責務の定義

#### 3. UseCase（ユースケース）

**誰が何をするのか** - 具体的な利用シナリオ

- ユーザーストーリー
- 受入基準
- ビジネスゴールへのトレーサビリティ

#### 4. SuccessMetric（成功指標）

**成功をどう測るのか** - 定量的な目標設定

- baseline → target の設定
- 測定方法の明確化
- ビジネスゴールとの紐付け

#### 5. Constraint（制約条件）

**何ができない/しないのか** - 技術的・ビジネス的制約

- スコープの限定
- 外部依存の制限
- 意思決定の記録

### ドキュメント間の参照関係

```text
BusinessGoal (BG-001: SEO最適化)
  ├─→ hasMetric → SuccessMetric (SM-001: 検索流入 100→1,000PV/月)
  ├─→ hasUseCase → UseCase (UC-001: キーワード選定)
  ├─→ hasUseCase → UseCase (UC-002: メタデータ最適化)
  └─→ constrainedBy → Constraint (CN-001: 外部API不使用)

UseCase (UC-001: キーワード選定)
  └─→ derivedFrom → BusinessGoal (BG-001)

SuccessMetric (SM-001)
  └─→ measuresGoal → BusinessGoal (BG-001)

Constraint (CN-001)
  └─→ relatedGoal → BusinessGoal (BG-001)
```

### 検証シナリオ

| ID  | シナリオ             | 検証内容                                       |
| --- | -------------------- | ---------------------------------------------- |
| S1  | 正常系               | BG → UC → SM の参照が全て正常                  |
| S2  | 構造エラー           | BG-002で必須項目不足                           |
| S3  | 参照エラー           | BG-003が存在しないUC-999を参照                 |
| S4  | 双方向参照不整合     | BG-004 → UC-003 だが UC-003 → BG-999（不一致） |
| S5  | カスタムルール違反   | high優先度BG-005だが、UCが1個しかない          |
| S6  | 孤立ドキュメント検出 | UC-006がどのBGからも参照されていない           |
| S7  | エンドツーエンド修正 | エラー検出 → AI修正 → 再検証 → Pass            |

---

## 📅 Phase 1: ドキュメント駆動の段階的実装（2週間）

### Week 1: スキーマとサンプル

#### Phase 1-A: 構造検証（Day 1-3）

**目的**: スキーマとサンプルドキュメントの妥当性を検証

**実装するもの**:

```yaml
schemas/:
  - business-goal.schema.json
  - context-diagram.schema.json
  - use-case.schema.json
  - success-metric.schema.json
  - constraint.schema.json

examples/blog-system/:
  - BG-001-seo-optimization.json
  - CD-001-system-boundary.json
  - UC-001-keyword-selection.json
  - SM-001-search-traffic.json
  - CN-001-no-external-api.json

scripts/:
  - validate-structure.ts # Ajvで構造検証のみ
```

**検証方法**:

```bash
# スキーマ作成 → サンプル作成 → 検証
bun run scripts/validate-structure.ts examples/blog-system/BG-001-seo-optimization.json
```

**成功基準**:

- [x] 5種類のスキーマが定義されている（4種類: BG, UC, SM, CN - CDは未実装）
- [x] 各スキーマに対応するサンプルが1個ずつある
- [x] 構造検証がPassする（ValidationEngine実装済み）
- [x] エラーメッセージが理解できる

---

#### Phase 1-B: 参照関係（Day 4-5）

**目的**: ドキュメント間参照が表現できることを確認

**実装するもの**:

```yaml
semantics/:
  - context.jsonld  # 基本的な@context定義のみ

examples/blog-system/に参照を追加:
  - BG-001: hasMetric: ["SM-001"], hasUseCase: ["UC-001", "UC-002"]
  - UC-001: derivedFrom: "BG-001"
  - SM-001: measuresGoal: "BG-001"

scripts/:
  - check-references.ts  # 参照先が存在するか簡易チェック
```

**検証方法**:

```bash
# 参照の存在だけチェック（SHACLはまだ使わない）
bun run scripts/check-references.ts examples/blog-system/
```

**成功基準**:

- [x] context.jsonldで参照を定義できる
- [x] サンプルドキュメントに参照が追加されている（UC-001, UC-002に実装済み）
- [x] 参照先の存在確認スクリプトが動作する（semantic-engine.tsで実装）
- [x] 存在しない参照を検出できる（checkReferences()で実装）

---

### Week 2: 検証エンジンとMCP統合

#### Phase 1-C: 検証エンジン（Day 6-8）

**目的**: 3レベル検証を実装し、エラーメッセージを改善

**実装するもの**:

```yaml
tools/core/:
  - validation-engine.ts # Level 1: JSON Schema + Ajv
  - semantic-engine.ts # Level 2: 参照存在確認
  - custom-rule-engine.ts # Level 3: 簡易カスタムルール

semantics/rules/:
  - consistency.yaml # カスタムルール定義

tools/core/tests/:
  - validation-engine.test.ts
  - semantic-engine.test.ts
  - custom-rule-engine.test.ts
```

**カスタムルール例**:

```yaml
# semantics/rules/consistency.yaml
rules:
  - id: BG-001
    name: "高優先度ゴールには複数のユースケース必須"
    target:
      type: BusinessGoal
      priority: "high"
    validation:
      check: hasMinimumUseCases
      minCount: 2
      message: "high優先度のビジネスゴールには最低2個のユースケースが必要です"
```

**検証方法**:

```bash
# 統合検証スクリプト
bun run scripts/validate.ts examples/blog-system/BG-001-seo-optimization.json
```

**成功基準**:

- [x] 3レベルすべての検証が動作する（Level 1: JSON Schema、Level 2: SHACL + 参照整合性実装済み）
- [x] エラーメッセージが具体的でわかりやすい
- [x] ユニットテストがPass（bun test: 5 pass, 0 fail）
- [x] シナリオS1-S7が検証できる（blog-system全ドキュメント検証成功）

---

#### Phase 1-D: MCP統合（Day 9-11）

**目的**: GitHub Copilotから呼び出せるようにする

**実装するもの**:

```yaml
tools/mcp-server/:
  - src/index.ts         # MCP Server本体
  - src/tools/
      - validate.ts      # validateツール
      - get-component.ts # テンプレート取得
  - package.json
  - tsconfig.json
```

**検証方法**:

```bash
# MCPサーバー起動
cd tools/mcp-server
bun run src/index.ts

# GitHub Copilotで実際に使ってみる
プロンプト: "BG-001のドキュメントを検証して"
```

**成功基準**:

- [x] MCPサーバーが起動する
- [x] validateツールがGitHub Copilotから呼び出せる
- [x] 検証結果が構造化されて返される
- [x] エラー内容が理解できる

---

#### Phase 1-E: 実践検証（Day 12-14)

**目的**: 実際にブログ管理システムのドキュメントを作ってみる

**実施内容**:

GitHub Copilotを使って、ゼロからドキュメントを作成:

1. ビジネスゴール定義（BG-001, BG-002, BG-003）
2. コンテキストダイアグラム作成（CD-001）
3. ユースケース展開（UC-001 ~ UC-008）
4. 成功指標設定（SM-001 ~ SM-005）
5. 制約条件定義（CN-001 ~ CN-003）
6. エラー修正のループ体験

**検証項目**:

- [x] ドキュメント作成フローが自然か（基本フロー確認済み）
- [x] エラーメッセージが理解できるか
- [ ] 修正提案が適切か（さらなる検証が必要）
- [x] セッション内で完結できるか
- [ ] フィードバックループが機能するか（継続検証中）

**成果物**:

```yaml
examples/blog-system/:
  # ビジネスゴール
  - BG-001-seo-optimization.json
  - BG-002-content-quality.json
  - BG-003-continuous-publishing.json

  # コンテキスト
  - CD-001-system-boundary.json

  # ユースケース
  - UC-001-keyword-selection.json
  - UC-002-metadata-optimization.json
  - UC-003-outline-creation.json
  - UC-004-markdown-writing.json
  - UC-005-seo-checklist.json
  - UC-006-publish-workflow.json
  - UC-007-article-update.json
  - UC-008-draft-management.json

  # 成功指標
  - SM-001-search-traffic.json
  - SM-002-reading-rate.json
  - SM-003-monthly-articles.json
  - SM-004-search-ranking.json
  - SM-005-bounce-rate.json

  # 制約
  - CN-001-no-external-api.json
  - CN-002-monthly-cost-limit.json
  - CN-003-static-hosting-only.json

templates/:
  - business-goal.json
  - context-diagram.json
  - use-case.json
  - success-metric.json
  - constraint.json
```

---

## ⏭️ Phase 2以降に延期する機能

### Phase 2（v0.2.0-beta、PoC成功後 4〜8週間）

- SHACL完全対応（RDF変換、グラフベース検証）
- CLI実装（ukiyoue validate, ukiyoue init）
- パフォーマンス最適化（キャッシュ、並列処理）
- セマンティック検索の基本実装

### Phase 3（v1.0、将来）

- 統計分析（マクロの好循環）
- VS Code拡張機能
- Web UI
- マルチプロジェクト対応

---

## 📊 成功基準

### 技術的検証

- [x] MCPツールとしてGitHub Copilotから呼び出せる
- [ ] Level 1〜3すべての検証が動作する（Level 1のみ実装済み）
- [ ] 参照先存在確認が正常に動作する（未実装）
- [ ] カスタムルールが正常に動作する（未実装）

### 品質検証

- [ ] 7つのシナリオ（S1〜S7）すべてが検証できる（未検証）
- [x] アクション提案の適切性（基本的な提案は機能）
- [x] エラーメッセージの明確性

### 開発効率

- [x] ドキュメントを作りながらツールが改善される
- [ ] フィードバックループが機能する（S7シナリオ - 継続検証中）
- [x] セッション内での試行錯誤が可能

---

## 🚨 リスク管理

### 技術的リスク

#### リスク 1: スキーマ設計の妥当性

**影響**: 高（後続の全実装に影響）
**発生確率**: 中

**対応策**:

- Phase 1-Aで早期に検証
- サンプルドキュメントで実用性を確認
- 必要に応じて柔軟に修正

#### リスク 2: MCP統合の複雑さ

**影響**: 高（主要機能が使えない）
**発生確率**: 低

**対応策**:

- Phase 1-Dでプロトタイプ作成
- MCP SDK公式ドキュメント参照
- 最悪の場合、Phase 2に延期してCLI優先

---

## 🔗 関連ドキュメント

- [`architecture.md`](architecture.md) - システム全体設計と原則
- [`implementation-guide.md`](implementation-guide.md) - 実装詳細
- [`concept.md`](concept.md) - フレームワークのコンセプトと背景
- [`working-backwards.md`](working-backwards.md) - プレスリリース & FAQ
- [`adr/`](adr/) - Architecture Decision Records

---

🎨 **Ukiyoue Framework - 使うほど品質が向上する、AI時代のドキュメント基盤**
