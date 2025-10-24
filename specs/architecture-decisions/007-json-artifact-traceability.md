# ADR-007: JSON成果物のトレーサビリティ実現方式

## Status

**承認済み** (Accepted)

## Context

### Background

ADR-005により、Layer 4の実行可能コード（Source Code/Test Code等）のトレーサビリティは**外部トレーサビリティマトリクス**（JSON-LD形式）で管理することを決定した。

しかし、**Layer 1-3, 5, 6の成果物**はすべて**JSON形式**（ADR-001）で表現されるため、異なるアプローチが考えられる：

- Project Charter, Roadmap, Business Goal, User Story（Layer 1）
- Functional/Non-Functional Requirements, Test Strategy（Layer 2）
- 各種Architecture, ADR, Data Model, UI/UX Spec, API Spec等（Layer 3）
- Deployment/Operations/Incident/Troubleshooting Guides（Layer 5）
- SIT/UAT Plans/Specs/Results（Layer 6）

これらの成果物間には以下のようなトレーサビリティ関係が存在する：

- **上流→下流**: Business Goal → Functional Requirements → Architecture → Implementation
- **検証関係**: Requirements → Test Specification → Test Results
- **成果物間参照**: Business Goal → User Story, User Story → Use Case
- **文書間参照**: Architecture → ADR, Data Model → Physical Data Model
- **外部参照**: RFC、標準仕様、外部ツールドキュメント

### Requirements

この決定は、specs/requirements.md で定義された以下のフレームワーク要件に関連する：

| 要件 ID          | 要件名             | 関連性                                   |
| ---------------- | ------------------ | ---------------------------------------- |
| **FR-AUTO-002**  | 自動バリデーション | トレーサビリティの整合性を検証可能       |
| **FR-CONV-002**  | 動的な情報再構成   | トレース関係に基づく情報再構成           |
| **FR-REUSE-001** | コンポーネント化   | トレース情報の再利用可能性               |
| **FR-CONV-001**  | セマンティック検索 | トレース関係に基づくセマンティッククエリ |

### Decision Criteria

| 基準               | 説明                                     | 重要度      |
| ------------------ | ---------------------------------------- | ----------- |
| **同期の容易さ**   | トレース情報の更新が容易か               | 🔴 Critical |
| **全体可視性**     | プロジェクト全体のトレースを俯瞰できるか | 🔴 Critical |
| **成果物の独立性** | 成果物本体とトレース情報を分離できるか   | 🟡 High     |
| **JSON-LD活用**    | セマンティック検索・推論が可能か         | 🟡 High     |
| **変更の局所性**   | 1つの成果物変更が他に波及しないか        | 🟡 High     |
| **AI処理の容易さ** | LLMが理解・生成しやすいか                | 🟡 High     |

## Options

### Option 1: 各JSON内に埋め込み（Embedded Traceability）

#### Description

各成果物のJSON内に `traceability` プロパティを追加し、トレース情報を直接埋め込む。**単方向定義**（下流→上流）を想定。

```json
// Functional Requirement (下流)
{
  "@context": "https://ukiyoue.dev/contexts/functional-requirement.jsonld",
  "@type": "FunctionalRequirement",
  "@id": "FR-AUTH-001",
  "title": "Multi-factor authentication support",
  "description": "...",
  "traceability": {
    "derivedFrom": ["BIZ-REQ-001"]  // 上流への参照（単方向）
  }
}

// Architecture (さらに下流)
{
  "@id": "ARCH-SEC-001",
  "traceability": {
    "satisfies": ["FR-AUTH-001"]  // 上流への参照（単方向）
  }
}

// Business Requirement (上流)
{
  "@id": "BIZ-REQ-001",
  "traceability": {
    // 下流への参照なし（単方向定義のため）
    // 逆方向クエリ（どのFRに詳細化されたか）は全ファイル検索が必要
  }
}
```

#### Pros

- ✅ **自己完結した情報**: 成果物単体で完全な情報を持つ
- ✅ **同期が容易**: トレース情報と本体が同一ファイル内（同期漏れリスクなし）
- ✅ **AI処理が容易**: 1つのJSONで完結するためLLMが理解しやすい
- ✅ **変更の局所性**: 1つの成果物のみ更新すればよい
- ✅ **Git履歴が明確**: どの成果物のトレースが変更されたか追跡可能

#### Cons

- ❌ **全体可視性の欠如**: プロジェクト全体のトレース構造を俯瞰できない
- ❌ **逆方向クエリの困難さ**:
  - 単方向定義の場合、逆方向クエリ（例: BIZ-REQ → どのFRに詳細化されたか）には全JSONファイルの検索が必要
  - パフォーマンス最適化のため双方向定義すると、重複・不整合リスクが発生
  - 例: Requirements に `refinedTo: [FR-001]` と FR に `derivedFrom: [BIZ-REQ-001]` の両方を管理
- ❌ **成果物本体の肥大化**: トレース情報で本体が複雑化
- ❌ **変更影響分析の困難さ**: 特定のトレース関係を分析するには全JSONファイルを読み込む必要

#### Evaluation

| 基準               | 評価 | 説明                                       |
| ------------------ | ---- | ------------------------------------------ |
| **同期の容易さ**   | ✅   | 同一ファイル内で完結                       |
| **全体可視性**     | ❌   | 分散しており俯瞰困難                       |
| **成果物の独立性** | ❌   | トレース情報が本体に混在                   |
| **逆方向クエリ**   | ❌   | 全ファイル検索が必要（パフォーマンス問題） |
| **JSON-LD活用**    | ⚠️   | 可能だが全ファイル読み込みが必要           |
| **変更の局所性**   | ✅   | 1つのファイルのみ変更                      |
| **AI処理の容易さ** | ✅   | 自己完結した情報で処理しやすい             |

### Option 2: 外部トレーサビリティマトリクス（External Matrix）

#### Description

別ファイル（`traceability.json`）でプロジェクト全体のトレーサビリティを一元管理。成果物本体にはトレース情報を含めない。

```json
{
  "@context": "https://ukiyoue.dev/contexts/traceability.jsonld",
  "@type": "TraceabilityMatrix",
  "project": "example-project",
  "version": "1.0.0",
  "traces": [
    {
      "@type": "Trace",
      "from": "FR-AUTH-001",
      "to": "ARCH-SEC-001",
      "relationship": "satisfiedBy",
      "rationale": "MFA architecture satisfies authentication requirement"
    },
    {
      "@type": "Trace",
      "from": "FR-AUTH-001",
      "to": "TEST-SEC-003",
      "relationship": "testedBy"
    }
  ]
}
```

#### Pros

- ✅ **全体可視性**: プロジェクト全体のトレース構造を一覧可能
- ✅ **成果物の独立性**: 本体はクリーンでトレース情報に汚染されない
- ✅ **単方向定義**: 各関係を1回だけ定義（重複なし）
- ✅ **不整合の防止**: 1箇所で管理するため矛盾が生じにくい
- ✅ **変更影響分析が容易**: トレース全体から影響範囲を導出可能
- ✅ **JSON-LD推論が容易**: SPARQL等で複雑なトレースクエリが可能

#### Cons

- ❌ **同期が必要**: 成果物の@id変更時にマトリクス更新が必要
- ❌ **ツール依存**: 同期ツールの開発が必要（ファイル名・@id変更検出）
- ❌ **変更の波及**: 1つのトレース追加でもマトリクス全体が変更される
- ❌ **AI処理の複雑化**: 複数ファイルを参照する必要がある
- ⚠️ **マトリクスの肥大化**: プロジェクト規模に比例して巨大化

#### Evaluation

| 基準               | 評価 | 説明                                      |
| ------------------ | ---- | ----------------------------------------- |
| **同期の容易さ**   | ⚠️   | @id変更時に同期必要（ツールで自動化可能） |
| **全体可視性**     | ✅   | 一元管理で俯瞰容易                        |
| **成果物の独立性** | ✅   | 本体はクリーン                            |
| **JSON-LD活用**    | ✅   | SPARQL等のセマンティッククエリが最適      |
| **変更の局所性**   | ❌   | マトリクス全体に影響                      |
| **AI処理の容易さ** | ⚠️   | 複数ファイル参照が必要                    |

### Option 3: ハイブリッド（主トレースは埋め込み、全体はマトリクス）

#### Description

- **成果物内**: 下流→上流の単方向トレースのみ定義
- **外部マトリクス**: 成果物から自動生成される読み取り専用ビュー（逆方向トレースも含む）

```json
// Functional Requirement (編集可能)
{
  "@id": "FR-AUTH-001",
  "derivedFrom": ["BIZ-REQ-001"]  // 単方向: 下流→上流のみ
}

// Architecture (編集可能)
{
  "@id": "ARCH-SEC-001",
  "satisfies": ["FR-AUTH-001"]  // 単方向: 下流→上流のみ
}

// Traceability Matrix (自動生成、読み取り専用)
{
  "@type": "TraceabilityMatrix",
  "@generated": true,
  "traces": [
    // 各成果物から抽出（単方向）
    {"from": "FR-AUTH-001", "to": "BIZ-REQ-001", "relationship": "derivedFrom"},
    {"from": "ARCH-SEC-001", "to": "FR-AUTH-001", "relationship": "satisfies"},
    // 自動生成で逆方向も提供
    {"from": "BIZ-REQ-001", "to": "FR-AUTH-001", "relationship": "refinedTo"},
    {"from": "FR-AUTH-001", "to": "ARCH-SEC-001", "relationship": "satisfiedBy"}
  ]
}
```

#### Pros

- ✅ **Option 1の利点**: 自己完結、同期容易、変更局所性
- ✅ **Option 2の利点**: 全体可視性（自動生成マトリクス）
- ✅ **ベストプラクティス**: Markdownと同じ「JSON編集→マトリクス自動生成」パターン
- ✅ **単方向定義**: 重複なし、不整合リスク最小化

#### Cons

- ⚠️ **自動生成ツールが必要**: マトリクス生成ツールの開発が必須
- ⚠️ **逆方向クエリには生成マトリクス必要**: 成果物単体では逆方向情報が不完全

#### Evaluation

| 基準               | 評価 | 説明                                 |
| ------------------ | ---- | ------------------------------------ |
| **同期の容易さ**   | ✅   | 同一ファイル内で完結                 |
| **全体可視性**     | ✅   | 自動生成マトリクスで俯瞰可能         |
| **成果物の独立性** | ⚠️   | トレース情報が混在（ただし最小限）   |
| **JSON-LD活用**    | ✅   | 自動生成マトリクスでSPARQLクエリ可能 |
| **変更の局所性**   | ✅   | 1つのファイルのみ変更                |
| **AI処理の容易さ** | ✅   | 自己完結した情報で処理しやすい       |

## Options Comparison

### 総合比較表

| 評価軸               | Option 1: 埋め込み    | Option 2: 外部マトリクス | Option 3: ハイブリッド |
| -------------------- | --------------------- | ------------------------ | ---------------------- |
| **同期の容易さ**     | ✅ 自動               | ⚠️ ツール必要            | ✅ 自動                |
| **全体可視性**       | ❌ 分散               | ✅ 一元管理              | ✅ 自動生成            |
| **成果物の独立性**   | ❌ 混在               | ✅ 分離                  | ⚠️ 最小限混在          |
| **逆方向クエリ**     | ❌ 全ファイル検索必要 | ✅ マトリクスで即座      | ✅ 自動生成で即座      |
| **JSON-LD活用**      | ⚠️ 複雑               | ✅ 最適                  | ✅ 最適                |
| **変更の局所性**     | ✅ 局所的             | ❌ 全体に影響            | ✅ 局所的              |
| **AI処理の容易さ**   | ✅ 容易               | ⚠️ 複雑                  | ✅ 容易                |
| **ツール開発コスト** | ✅ 不要               | ⚠️ 同期ツール必要        | ⚠️ 生成ツール必要      |

### ADR-005（Layer 4）との比較

| 対象                        | 決定内容                       | 理由                                 |
| --------------------------- | ------------------------------ | ------------------------------------ |
| **Layer 4: 実行可能コード** | 外部マトリクス（Option 2相当） | コード変更を引き起こさない           |
| **Layer 1-3,5,6: JSON**     | ？                             | コード変更問題がないため別の判断基準 |

Layer 4では「コード変更トリガー回避」が決定的理由だったが、JSON成果物では該当しない。

## Decision

**Option 3: ハイブリッド（主トレースは埋め込み、全体マトリクスは自動生成）**を採用する。

### Rationale

#### 主要な決定理由

1. **ADR-001のパターン踏襲**
   - Markdown自動生成と同じ「JSON編集→派生物自動生成」パターン
   - 編集はJSON、俯瞰はマトリクス（読み取り専用）という分離

2. **同期問題の最小化**
   - トレース情報が成果物本体と同一ファイル内にあるため同期漏れなし
   - 外部マトリクスは自動生成のため手動同期不要

3. **変更の局所性**
   - 1つの成果物のトレース変更は、その成果物JSONのみ更新
   - Git履歴でどの成果物のトレースが変更されたか明確

4. **全体可視性の確保**
   - 自動生成マトリクスでプロジェクト全体のトレース構造を俯瞰可能
   - JSON-LD SPARQLクエリでトレース分析が可能

5. **AI処理の容易さ**
   - LLMは各成果物を自己完結した情報として処理可能
   - 必要に応じてマトリクスも参照可能（柔軟性）

#### Option 1（完全埋め込み）を採用しなかった理由

- 全体可視性の欠如が致命的
- トレース構造の分析・可視化にすべてのJSONファイルを読み込む必要がある
- プロジェクト規模が大きくなると管理困難

#### Option 2（完全外部）を採用しなかった理由

- 変更の局所性が失われる（1つのトレース追加でマトリクス全体が変更）
- 成果物とトレース情報の距離が遠い（AIが理解しにくい）
- Layer 4（実行可能コード）とは異なり、「成果物変更トリガー回避」の必要性がない

### トレース方向の定義規則

#### 単方向定義の原則

双方向重複を避けるため、**下流成果物が上流を参照する**方向で統一する：

```json
// ❌ 上流が下流を指す（避ける）
{
  "@id": "BIZ-REQ-001",
  "refinedTo": ["FR-AUTH-001"]  // 避ける：下流が増えるたび更新
}

// ✅ 下流が上流を指す（推奨）
{
  "@id": "FR-AUTH-001",
  "derivedFrom": ["BIZ-REQ-001"]  // 推奨：安定した上流を参照
}
```

**理由**:

- 上流（Requirements等）は比較的安定
- 下流（Architecture, Implementation等）は頻繁に変更される
- 変更が頻繁な側が参照を持つことで、安定した側への影響を最小化

#### トレース関係の種類

| 関係名        | 方向               | 説明               | 例                           |
| ------------- | ------------------ | ------------------ | ---------------------------- |
| `derivedFrom` | 下流 → 上流        | 要件の詳細化・分解 | FR → BIZ-REQ                 |
| `satisfies`   | 実装 → 要件        | 要件の実現         | ARCH → FR, IMPL → FR         |
| `testedBy`    | 要件/実装 → テスト | テストによる検証   | FR → TEST-SPEC               |
| `implements`  | 実装 → 設計        | 設計の実装         | IMPL → ARCH, IMPL → API-SPEC |
| `relatedTo`   | 任意 → 任意        | 一般的な関連       | ARCH → ADR                   |
| `dependsOn`   | 任意 → 任意        | 技術的依存関係     | ARCH-A → ARCH-B              |

### JSON Schemaでのトレース定義

各成果物のJSON Schemaに以下のパターンを含める：

```json
{
  "properties": {
    "traceability": {
      "type": "object",
      "properties": {
        "derivedFrom": {
          "type": "array",
          "items": { "type": "string", "pattern": "^[A-Z]+-[A-Z0-9]+-[0-9]+$" }
        },
        "satisfies": {
          "type": "array",
          "items": { "type": "string", "pattern": "^[A-Z]+-[A-Z0-9]+-[0-9]+$" }
        },
        "testedBy": {
          "type": "array",
          "items": { "type": "string", "pattern": "^TEST-[A-Z0-9]+-[0-9]+$" }
        }
      }
    }
  }
}
```

### 自動生成マトリクスの仕様

```json
{
  "@context": "https://ukiyoue.dev/contexts/traceability.jsonld",
  "@type": "TraceabilityMatrix",
  "@generated": {
    "tool": "ukiyoue-traceability-generator",
    "version": "1.0.0",
    "timestamp": "2025-10-20T12:00:00Z"
  },
  "project": "example-project",
  "traces": [
    {
      "@type": "Trace",
      "source": { "@id": "FR-AUTH-001", "type": "FunctionalRequirement" },
      "target": { "@id": "BIZ-REQ-001", "type": "BusinessRequirement" },
      "relationship": "derivedFrom",
      "sourceFile": "requirements/functional/auth.json"
    }
  ],
  "statistics": {
    "totalTraces": 150,
    "byRelationship": {
      "derivedFrom": 45,
      "satisfies": 60,
      "testedBy": 45
    }
  }
}
```

## Consequences

### Positive

1. **編集の容易さ**
   - トレース情報と本体が同一ファイル（同期問題なし）
   - 1つの成果物のみ編集すればよい

2. **全体俯瞰の実現**
   - 自動生成マトリクスでトレース構造を可視化
   - JSON-LDクエリで変更影響分析が可能

3. **Git履歴の明確性**
   - どの成果物のトレースが変更されたか追跡可能
   - コードレビューが容易

4. **ADR-001との一貫性**
   - 「編集用JSON → 派生物自動生成」パターンの踏襲

5. **AI処理の柔軟性**
   - 成果物単体で完結した情報
   - 必要に応じてマトリクスも参照可能

### Negative

1. **逆方向トレースのクエリが必要**
   - 単方向定義のため、逆方向（例: BIZ-REQ → どのFRに詳細化されたか）は自動生成マトリクスをクエリする必要がある
   - 成果物単体では逆方向の情報が不完全

2. **自動生成ツールの開発が必要**
   - トレーサビリティマトリクス生成ツール（Bun + TypeScript）
   - 整合性チェックツール（参照先の存在確認、トレース方向の妥当性検証）

3. **成果物本体の肥大化**
   - トレース情報がJSON内に含まれる（ただし構造化されているため管理可能）

### Mitigation

#### 1. 整合性チェックツール

単方向トレースの妥当性を自動検出：

```bash
bun run validate:traceability
```

検出する問題：

- **存在しない@idを参照**している（デッドリンク）
- **トレース方向が定義規則に違反**（例: 上流が下流を参照している）
- **必須トレースの欠落**（例: すべてのFRはBIZ-REQを参照すべき）

#### 2. トレーサビリティマトリクス自動生成

```bash
bun run generate:traceability-matrix
```

生成物：

- `traceability.json` (JSON-LD形式、読み取り専用)
- `traceability.md` (Markdown形式、読み取り専用、人間用)
- `traceability-graph.svg` (可視化、読み取り専用)

#### 3. JSON Schemaによる検証

各成果物のトレース情報をJSON Schemaで検証：

- @id パターン検証
- 必須トレース関係のチェック（例: FRは必ずBIZ-REQを参照）

#### 4. Git Hooksでの自動化

```bash
# pre-commit: トレース整合性チェック
# post-commit: マトリクス自動再生成
```

## Related Decisions

- **ADR-001**: データフォーマット・スキーマ定義の選定
  - JSON編集→Markdown自動生成のパターンを踏襲
- **ADR-005**: 実行可能コードのJSON化適用範囲
  - Layer 4は外部マトリクス（コード変更回避）
  - Layer 1-3,5,6はハイブリッド（異なる判断基準）

## References

### トレーサビリティ標準

- **OSLC (Open Services for Lifecycle Collaboration)**: ライフサイクル全体のトレーサビリティ標準
  - <https://open-services.net/>
- **ReqIF (Requirements Interchange Format)**: 要件管理の標準フォーマット
  - <https://www.omg.org/reqif/>

### JSON-LDセマンティクス

- **JSON-LD 1.1 Framing**: トレース関係の柔軟な抽出
  - <https://www.w3.org/TR/json-ld11-framing/>
- **SPARQL 1.1**: セマンティッククエリ言語
  - <https://www.w3.org/TR/sparql11-query/>

### 類似ツール

- **Jama Connect**: 要件管理・トレーサビリティツール
  - 埋め込み型トレースとマトリクスビューのハイブリッド採用
- **Polarion**: ALMツール
  - トレース情報をアイテム内に保存、マトリクスは動的生成
