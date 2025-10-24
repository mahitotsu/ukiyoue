# Schemas - JSON Schema Definitions

このディレクトリは、Ukiyoue フレームワークの JSON Schema 定義を格納します。

## 📋 概要

JSON Schema Draft-07 を使用して、成果物の構造（structure）と制約（constraints）を定義します。
これにより、完全な自動バリデーション、型チェック、IDE での補完が可能になります。

## 🎯 目的

- **FR-AUTO-001**: 完全な自動バリデーション
- **FR-AUTO-002**: 構造化とメタデータの自動生成
- **FR-REUSE-001**: スキーマの再利用性

## 📁 ディレクトリ構造

```text
schemas/
├── README.md                 # このファイル
├── _common.json             # 共通定義（baseArtifact, traceability, dateRange, status）
├── layer1/                  # Layer 1: ビジネス層（5スキーマ）
│   ├── project-charter.json # PM-CHARTER
│   ├── roadmap.json         # PM-ROADMAP
│   ├── risk-register.json   # PM-RISK
│   ├── business-goal.json   # BIZ-GOAL
│   └── user-story.json      # BIZ-STORY
├── layer2/                  # Layer 2: 要件定義（6スキーマ）
│   ├── use-case.json                    # REQ-UC
│   ├── functional-requirements.json     # REQ-FUNC
│   ├── non-functional-requirements.json # REQ-NONFUNC
│   ├── data-dictionary.json             # REQ-DICT
│   ├── conceptual-data-model.json       # REQ-CONCEPT
│   └── test-strategy.json               # REQ-TESTSTRATEGY
├── layer3/                  # Layer 3: 設計・アーキテクチャ（13スキーマ）
│   ├── architecture-decision-record.json           # ARCH-ADR
│   ├── runtime-architecture.json                   # ARCH-RUNTIME
│   ├── data-model.json                             # ARCH-DATA
│   ├── ui-ux-specification.json                    # ARCH-UI
│   ├── api-specification.json                      # ARCH-API
│   ├── security-architecture.json                  # ARCH-SECURITY
│   ├── reliability-architecture.json               # ARCH-RELIABILITY
│   ├── infrastructure-architecture.json            # ARCH-INFRA
│   ├── observability-architecture.json             # ARCH-OBSERVABILITY
│   ├── devops-architecture.json                    # ARCH-DEVOPS
│   ├── development-environment-architecture.json   # ARCH-DEVENV
│   ├── test-plan.json                              # ARCH-TESTPLAN
│   └── test-specification.json                     # ARCH-TESTSPEC
├── layer5/                  # Layer 5: 運用（4スキーマ）
│   ├── deployment-guide.json         # OPS-DEPLOY
│   ├── operations-manual.json        # OPS-MANUAL
│   ├── incident-response-guide.json  # OPS-INCIDENT
│   └── troubleshooting-guide.json    # OPS-TROUBLESHOOT
└── layer6/                  # Layer 6: 検証（6スキーマ）
    ├── sit-plan.json          # VERIFY-SIT-PLAN
    ├── sit-specification.json # VERIFY-SIT-SPEC
    ├── sit-result.json        # VERIFY-SIT-RESULT
    ├── uat-plan.json          # VERIFY-UAT-PLAN
    ├── uat-specification.json # VERIFY-UAT-SPEC
    └── uat-result.json        # VERIFY-UAT-RESULT
```

**注意**: Layer 4（実装・テスト）は実行可能コードのため、JSON 化対象外（ADR-005 参照）

## 🔧 技術仕様

### JSON Schema バージョン

- **JSON Schema Draft-07** (IETF standard)
- ADR-002 に基づく選定

### 設計原則

1. **共通定義の再利用** (`_common.json`)
   - `baseArtifact`: 全成果物共通の基本構造
   - `traceability`: トレーサビリティ関係（ADR-007）
   - `dateRange`: 期間定義
   - `status`: ステータス enum

2. **メタデータポリシー**
   - ❌ **除外**: `version`, `createdAt`, `updatedAt`, `authors` (Git 管理)
   - ❌ **除外**: `approval` (ワークフロー管理システムが管理)
   - ✅ **含む**: `@context`, `@type`, `id`, `traceability` (ビジネスロジック)
   - ⚠️ **オプション**: `status` (プロジェクト依存)

3. **仕様準拠**
   - すべてのスキーマは `specs/artifact-definitions.md` に準拠
   - 識別子、主な内容、必須フィールドが仕様と一致

## 📖 使用方法

### JSON ドキュメントの作成

```json
{
  "@context": "https://ukiyoue.example.org/vocabularies/ukiyoue.jsonld",
  "@type": "ProjectCharter",
  "id": "charter-2025-q4",
  "title": "新プロダクト開発プロジェクト",
  "background": {
    "businessNeed": "市場ニーズに対応するため",
    "currentSituation": "既存システムの限界"
  },
  "scope": {
    "included": ["機能A開発", "機能B開発"],
    "excluded": ["既存システム移行"]
  },
  "stakeholders": [
    {
      "role": "スポンサー",
      "name": "経営企画部",
      "responsibility": "予算承認"
    }
  ],
  "traceability": {
    "derivedFrom": ["business-case-001"]
  }
}
```

### バリデーション（ajv 使用）

```typescript
import Ajv from "ajv";
import projectCharterSchema from "./schemas/layer1/project-charter.json";

const ajv = new Ajv({ allErrors: true, strict: true });
const validate = ajv.compile(projectCharterSchema);

const document = {
  /* ... JSONドキュメント ... */
};

if (validate(document)) {
  console.log("✅ Valid");
} else {
  console.error("❌ Validation errors:", validate.errors);
}
```

## 🔍 スキーマ定義の詳細

### \_common.json - 共通定義

すべてのスキーマで再利用される基本定義：

- **baseArtifact**:
  - `@context`: JSON-LD context（必須）
  - `@type`: 成果物タイプ（必須）
  - `id`: 一意識別子（必須、パターン: `^[a-z0-9-]+$`）
  - `traceability`: トレーサビリティ情報（オプション）

- **traceability**:
  - `derivedFrom`: 派生元（downstream → upstream）
  - `satisfies`: 満たす要件（implementation → requirement）
  - `implements`: 実装する設計（implementation → design）
  - `testedBy`: テストケース（artifact → test）
  - `relatedTo`: 関連成果物（汎用）
  - `dependsOn`: 技術的依存関係

- **dateRange**:
  - `start`: 開始日（必須）
  - `end`: 終了日（オプション）

- **status**:
  - enum: `["draft", "in-review", "approved", "deprecated"]`

### Layer 1: プロジェクト管理

#### project-charter.json (PM-CHARTER)

プロジェクト憲章スキーマ。

**必須フィールド**: `title`, `background`, `scope`, `stakeholders`

**主な構造**:

- `background`: プロジェクトの背景（ビジネスニーズ、現状）
- `scope`: スコープ（含む/含まない）
- `stakeholders`: ステークホルダー情報
- `milestones`: マイルストーン（オプション）
- `constraints`: 制約条件（オプション）
- `risks`: リスク（オプション）

#### roadmap.json (PM-ROADMAP)

ロードマップスキーマ。

**必須フィールド**: `title`, `phases`

**主な構造**:

- `phases`: フェーズ定義（目的、タイムライン、成果物、依存関係）

### Layer 2: 要件定義

#### use-case.json (REQ-UC)

**ID パターン**: `UC-[A-Z]+-[0-9]{3}` (Use Case)

アクターとシステムの相互作用を詳細に記述するユースケース。メインフロー、代替フロー、例外フローを定義。

#### functional-requirements.json (REQ-FUNC)

**ID パターン**: `FR-[A-Z]+-[0-9]{3}` (Functional Requirements)

システムの機能要件を定義。ユースケースから導出される機能仕様。

#### non-functional-requirements.json (REQ-NONFUNC)

**ID パターン**: `NFR-[A-Z]+-[0-9]{3}` (Non-Functional Requirements)

システムの非機能要件を定義。品質特性と制約条件。

#### data-dictionary.json (REQ-DICT)

**ID パターン**: `TERM-[A-Z]+-[0-9]{3}` (Term)

プロジェクト固有の用語定義。データ型、フォーマット、制約、バリデーションルール。

#### conceptual-data-model.json (REQ-CONCEPT)

**ID パターン**: `ENT-[A-Z]+-[0-9]{3}` (Entity), `REL-[A-Z]+-[0-9]{3}` (Relationship)

ビジネス概念間の関係性を定義。エンティティ、関係性、ビジネスルール、状態遷移。

#### test-strategy.json (REQ-TESTSTRATEGY)

テスト戦略とリリース基準を定義。

### Layer 3: 設計・アーキテクチャ

13 種類のアーキテクチャスキーマ：

- **ARCH-ADR**: 技術選定の決定記録（status, decision, context, rationale）
- **ARCH-RUNTIME**: 実行時システム構造（components, communication）
- **ARCH-DATA**: データモデル（論理設計、データストア種別ごとの設計、アクセスパターン、マルチストア対応）
- **ARCH-UI**: UI/UX 仕様（screens, wireframes, interactions）
- **ARCH-API**: API 仕様（endpoints, request/response）
- **ARCH-SECURITY**: セキュリティ（auth, encryption, vulnerabilities）
- **ARCH-RELIABILITY**: 信頼性（SLO/SLI/SLA, availability）
- **ARCH-INFRA**: インフラ（network, compute, storage）
- **ARCH-OBSERVABILITY**: 監視（metrics, logs, traces）
- **ARCH-DEVOPS**: DevOps（branch strategy, CI/CD, releases）
- **ARCH-DEVENV**: 開発環境（local dev tools）
- **ARCH-TESTPLAN**: テスト計画（strategy, schedule）
- **ARCH-TESTSPEC**: テスト仕様（test cases, procedures）

### Layer 5: 運用

4 種類の運用ドキュメントスキーマ：

- **OPS-DEPLOY**: デプロイ手順（環境構築、デプロイ、検証、ロールバック）
- **OPS-MANUAL**: 運用マニュアル（監視、日次運用、バックアップ）
- **OPS-INCIDENT**: インシデント対応（定義、エスカレーション、復旧）
- **OPS-TROUBLESHOOT**: トラブルシューティング（よくある問題、診断、FAQ）

### Layer 6: 検証

6 種類のテスト関連スキーマ：

- **VERIFY-SIT-PLAN**: SIT 計画（テスト戦略、スコープ）
- **VERIFY-SIT-SPEC**: SIT 仕様（テストケース、ID パターン: `SIT-[0-9]{3}`）
- **VERIFY-SIT-RESULT**: SIT 結果（実行サマリ、合否判定）
- **VERIFY-UAT-PLAN**: UAT 計画（ビジネス目標評価）
- **VERIFY-UAT-SPEC**: UAT 仕様（シナリオ、ID パターン: `UAT-[0-9]{3}`）
- **VERIFY-UAT-RESULT**: UAT 結果（受入判定、フィードバック）

## 🛠️ ツール対応

### ajv (推奨)

```bash
bun add ajv
```

```typescript
import Ajv from "ajv";

const ajv = new Ajv({ allErrors: true, strict: true });
const validate = ajv.compile(schema);

if (!validate(data)) {
  console.error(validate.errors);
}
```

### VS Code での補完

`.vscode/settings.json`:

```json
{
  "json.schemas": [
    {
      "fileMatch": ["**/project-charter.json"],
      "url": "./schemas/layer1/project-charter.json"
    }
  ]
}
```

## 📚 関連ドキュメント

- [ADR-001: データフォーマット・スキーマ定義・セマンティック定義の選定](../specs/design-decisions/001-data-format-and-schema.md)
- [ADR-002: JSON Schema Draft 版の選定](../specs/design-decisions/002-json-schema-draft-version.md)
- [ADR-005: 実行可能コードの JSON 化適用範囲](../specs/design-decisions/005-executable-code-representation.md)
- [ADR-007: JSON 成果物のトレーサビリティ実現方式](../specs/design-decisions/007-json-artifact-traceability.md)
- [artifact-definitions.md](../specs/artifact-definitions.md) - 42 種類の成果物タイプ詳細定義
- [JSON Schema Draft-07 Specification](https://json-schema.org/draft-07/json-schema-release-notes.html)

## 🔍 検証方法

### Prettier によるフォーマット検証

```bash
bun run format:json
```

### ajv-cli による検証

```bash
bunx ajv validate -s schemas/layer1/project-charter.json -d document.json
```

### スキーマ仕様準拠の確認

スキーマが `specs/artifact-definitions.md` に準拠していることを確認：

1. **識別子の一致**: `@type` 定数が仕様の識別子と一致
2. **主な内容の網羅**: 仕様の「主な内容」がすべてプロパティとして定義
3. **必須フィールド**: 仕様の要件に基づく適切な `required` 設定
4. **ID 規約**: テストケース、要件などの ID パターン検証

## ⚠️ 注意事項

### スキーマ変更時

- スキーマ変更は既存ドキュメントに影響する可能性
- バージョニング戦略を検討（例: `/v1/schemas/...`）
- 変更前に既存ドキュメントの影響範囲を確認

### $ref の使用

- `_common.json` への `$ref` は相対パス使用: `"../_common.json#/definitions/..."`
- JSON Schema Draft-07 では `$ref` と他のキーワードの併用に制限あり

### additionalProperties

- すべてのスキーマで `"additionalProperties": false` を設定
- 意図しないプロパティの混入を防止
- 拡張が必要な場合は明示的にスキーマを更新

## 🚀 今後の拡張

- [ ] スキーマバージョニング戦略の策定
- [ ] カスタムフォーマット定義（email, url, date-time）
- [ ] スキーマ間の整合性検証ツール
- [ ] OpenAPI 3.x との統合（API 仕様）
- [ ] JSON Schema 2020-12 への移行検討
