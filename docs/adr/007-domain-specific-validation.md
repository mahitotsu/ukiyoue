# ADR-007: Domain-Specific Validation

## Status

Accepted

## Context

ADR-002でJSON Schemaによる構造検証、ADR-006でSHACLによるセマンティック検証を採用しました。しかし、これらだけでは表現できない**ドメイン固有の検証ルール**が存在します。

**具体例**:

- **プロジェクト固有ルール**: 「すべてのAPI仕様は、エラーレスポンス（400, 401, 500）を定義する必要がある」
- **組織標準**: 「機能要件には、少なくとも1つのテストケースが紐付いている必要がある」
- **コンテキスト依存ルール**: 「優先度が"high"の要件は、レビュー承認が必要」

これらは汎用的なJSON SchemaやSHACLでは表現しづらく、また頻繁に変更される可能性があるため、柔軟な定義方法が必要です。

**要求事項**:

- ✅ プロジェクト固有のルールを宣言的に定義可能
- ✅ YAML/JSON形式（人間可読・編集容易）
- ✅ JSON Schema、SHACLと共存
- ✅ ドキュメント間の関係性チェック
- ✅ 条件付きルール（if-then）
- ✅ カスタムエラーメッセージ
- ✅ アクション提案の埋め込み
- ✅ バージョン管理可能

**制約条件**:

- TypeScript/Bun環境で動作（ADR-008, ADR-009）
- JSON Schema、SHACLと統合（ADR-002, ADR-006）
- Git管理でバージョニング

## Decision

**YAML/JSON形式のカスタムルール定義** を採用します。独自のDSL（Domain Specific Language）を設計し、宣言的にドメイン固有ルールを定義します。

## Options Considered

### Option A: YAML/JSON Custom Rules (提案)

**概要**: YAML/JSON形式で宣言的にルールを定義

**Pros**:

- ✅ 人間可読・編集容易（YAML）
- ✅ Git管理でバージョニング可能
- ✅ プロジェクト固有にカスタマイズ容易
- ✅ JSON SchemaでYAML自体を検証可能（メタ検証）
- ✅ 条件付きルール（if-then）を表現可能
- ✅ カスタムエラーメッセージ埋め込み
- ✅ アクション提案を直接定義
- ✅ TypeScriptと統合容易
- ✅ 学習コスト低い（YAML構文のみ）

**Cons**:

- ⚠️ 独自DSLの設計・実装が必要
- ⚠️ 複雑なロジックの表現に限界

**実装例**:

```yaml
# semantics/rules/consistency.yaml
rules:
  - id: REQ-001
    name: "要件にはテストケースが必要"
    description: "すべての機能要件は、少なくとも1つのテストケースを持つ必要がある"
    severity: error
    target:
      type: requirement
      subtype: functional
    condition:
      property: status
      operator: notEquals
      value: draft
    validation:
      check: hasLinkedTestCase
      minCount: 1
      message: "この要件に対応するテストケースが見つかりません"
      action: "テストケースを作成し、リンクを設定してください"
      reference: "/templates/test-case.json"

  - id: API-001
    name: "APIエンドポイントにはエラーレスポンスが必要"
    severity: warning
    target:
      type: api-spec
    validation:
      check: hasErrorResponses
      requiredCodes: [400, 401, 500]
      message: "推奨されるエラーレスポンス（400, 401, 500）が不足しています"
      action: "標準的なエラーレスポンスを追加してください"
```

### Option B: JavaScript/TypeScript Functions

**概要**: 検証ロジックをTypeScript関数で直接実装

**Pros**:

- ✅ プログラミング言語の表現力（複雑なロジック可能）
- ✅ IDEの補完・型チェック

**Cons**:

- ❌ 非プログラマーが編集困難
- ❌ Git差分が読みづらい
- ❌ 宣言的でない（手続き的コード）
- ❌ ルールの変更にコンパイルが必要
- ❌ セキュリティリスク（任意コード実行）

### Option C: SPARQL Rules (SHACL-SPARQL)

**概要**: SHACLのSPARQLクエリ機能でカスタムルールを定義

**Pros**:

- ✅ RDFグラフの強力なクエリ機能
- ✅ SHACLと統合

**Cons**:

- ❌ SPARQL学習コストが高い
- ❌ 人間可読性が低い
- ❌ プロジェクトマネージャー等が編集不可
- ❌ アクション提案の埋め込みが困難
- ❌ JSON形式のドキュメントには過剰

### Option D: JSON Schema $defs

**概要**: JSON Schemaの$defs機能でカスタムルール定義

**Pros**:

- ✅ 追加ツール不要

**Cons**:

- ❌ 構造検証専用（セマンティック検証不可）
- ❌ ドキュメント間関係のチェック不可
- ❌ 条件付きルールの表現が複雑
- ❌ アクション提案を埋め込めない
- ❌ Ukiyoueの要求に不十分

### Option E: Schematron

**概要**: XMLバリデーション用のルールベース言語

**Pros**:

- ✅ 宣言的なルール定義
- ✅ ISO標準

**Cons**:

- ❌ XML専用（JSONに適用困難）
- ❌ JavaScript/TypeScriptライブラリが限定的
- ❌ Ukiyoueの技術スタックに不適合
- ❌ 学習コスト高い

### Option F: No Custom Rules

**概要**: カスタムルールを提供しない

**Pros**:

- ✅ 実装不要

**Cons**:

- ❌ プロジェクト固有ルールを表現できない
- ❌ 組織標準の適用不可
- ❌ Ukiyoueの価値提案が半減
- ❌ 採用すべきでない

## Comparison Matrix

| 評価基準                       | 重み | YAML/JSON | JS/TS Functions | SPARQL Rules | JSON Schema | Schematron | No Custom |
| ------------------------------ | ---- | --------- | --------------- | ------------ | ----------- | ---------- | --------- |
| **人間可読性**                 | 5    | 5         | 3               | 2            | 3           | 2          | 5         |
| **非プログラマー編集容易性**   | 5    | 5         | 1               | 1            | 2           | 1          | 5         |
| **Git差分可読性**              | 4    | 5         | 3               | 3            | 4           | 3          | 5         |
| **条件付きルール表現**         | 4    | 5         | 5               | 5            | 3           | 5          | 0         |
| **アクション提案埋め込み**     | 5    | 5         | 4               | 2            | 1           | 1          | 0         |
| **ドキュメント間関係チェック** | 4    | 5         | 5               | 5            | 1           | 2          | 0         |
| **学習コスト（低いほど良い）** | 3    | 5         | 4               | 1            | 4           | 2          | 5         |
| **実装コスト**                 | 2    | 3         | 4               | 3            | 5           | 1          | 5         |
| **柔軟性・拡張性**             | 3    | 4         | 5               | 4            | 2           | 3          | 0         |
| **セキュリティ**               | 3    | 5         | 2               | 4            | 5           | 4          | 5         |
| **合計**                       | 38   | **182**   | 136             | 117          | 109         | 95         | 120       |
| **正規化スコア（/30）**        | -    | **28.7**  | 21              | 18           | 17          | 15         | 19        |

**重み付け理由**:

- **人間可読性（5）**: ルールをチーム全体で理解・編集する必要がある
- **非プログラマー編集容易性（5）**: プロダクトマネージャー、QA等も編集可能であるべき
- **Git差分可読性（4）**: レビュー時の変更内容理解が重要
- **条件付きルール表現（4）**: 複雑なビジネスロジックを表現する必要がある
- **アクション提案埋め込み（5）**: ミクロの好循環の核心（AI作業精度向上）
- **ドキュメント間関係チェック（4）**: トレーサビリティの自動確認
- **学習コスト（3）**: 重要だが、ドキュメントで軽減可能
- **実装コスト（2）**: 1度だけのコスト、長期的価値の方が重要
- **柔軟性・拡張性（3）**: 将来的な要求への対応
- **セキュリティ（3）**: 任意コード実行のリスク回避

## Consequences

### Positive

- ✅ **宣言的**: ルールの意図が明確、保守容易
- ✅ **アクセシブル**: 非プログラマーも編集可能
- ✅ **Git管理**: 変更履歴、レビュー、ロールバック可能
- ✅ **アクション提案**: AIへのフィードバック精度向上
- ✅ **柔軟**: プロジェクト固有に簡単にカスタマイズ
- ✅ **統合**: JSON Schema、SHACLと共存

### Negative

- ⚠️ **独自DSL**: 設計・実装・ドキュメント化が必要
- ⚠️ **表現力の限界**: 極めて複雑なロジックは表現困難

### Mitigation

- **独自DSL**:
  - シンプルで直感的な構文設計
  - 豊富なサンプル提供
  - JSON Schemaでルール定義自体を検証（メタ検証）
- **表現力の限界**:
  - 80%のユースケースをカバーする設計
  - 複雑なケースは TypeScript 関数へのフォールバック機構

## Implementation Notes

### 提供範囲の明確化

#### フレームワーク提供（Ukiyoue側）

**1. カスタムルールエンジン本体**:

```text
@ukiyoue/framework/
├── src/engines/custom-rule-engine.ts  # ルールエンジン実装
├── schemas/custom-rule.schema.json    # ルール定義のスキーマ
└── validators/                        # 組み込み検証関数
    ├── builtin-validators.ts          # 基本的な検証関数
    └── index.ts
```

**提供する組み込み検証関数**:

- `hasLinkedTestCase`: テストケースへのリンク確認
- `hasErrorResponses`: APIエラーレスポンス確認
- `descriptionLength`: 説明文の長さチェック
- `hasSecurityScheme`: セキュリティスキーム確認
- `hasAcceptanceCriteria`: 受入基準の存在確認
- その他、汎用的な検証関数

**2. ルール定義テンプレート**:

```text
@ukiyoue/framework/templates/rules/
├── api-standards.yaml         # API標準ルール例
├── documentation-quality.yaml # ドキュメント品質ルール例
└── README.md                  # ルール作成ガイド
```

#### ユーザー提供（プロジェクト側）

**1. プロジェクト固有のルール定義**:

```text
my-project/
└── .ukiyoue/
    └── rules/                      # ユーザーが作成
        ├── company-standards.yaml  # 組織標準
        └── project-specific.yaml   # プロジェクト固有
```

**例**: `.ukiyoue/rules/company-standards.yaml`

```yaml
rules:
  - id: API-001
    name: "APIエンドポイントにはエラーレスポンスが必要"
    severity: warning
    target:
      type: api-spec
    validation:
      check: hasErrorResponses # フレームワーク提供の組み込み関数
      requiredCodes: [400, 401, 500]
      message: "エラーレスポンスが不足しています"
```

**2. カスタム検証関数（オプション）**:

プロジェクト固有のロジックが必要な場合のみ作成：

```text
my-project/
└── .ukiyoue/
    └── validators/
        └── custom-validators.ts  # ユーザーが作成（オプション）
```

**例**: `.ukiyoue/validators/custom-validators.ts`

```typescript
// プロジェクト固有の検証ロジック
export const apiVersioningCheck = async (doc, params) => {
  // 独自のバージョニング規則をチェック
  return { valid: true };
};
```

#### 使い分けの指針

| 要求                               | 使用するもの               | 作成者         |
| ---------------------------------- | -------------------------- | -------------- |
| **一般的なルール**                 | 組み込み検証関数           | フレームワーク |
| （例: エラーレスポンス必須）       | `hasErrorResponses`        |                |
| **組織・プロジェクト固有のルール** | YAMLルール定義             | ユーザー       |
| （例: 自社のAPI標準）              | `.ukiyoue/rules/*.yaml`    |                |
| **複雑な独自ロジック**             | カスタム検証関数           | ユーザー       |
| （例: 独自のバージョニング規則）   | `.ukiyoue/validators/*.ts` |                |

#### 典型的なセットアップフロー

##### Step 1: 初期化（フレームワーク提供のテンプレートを利用）

```bash
# Ukiyoueプロジェクト初期化
ukiyoue init my-project

# 生成されるファイル:
# .ukiyoue/
# ├── config.json
# └── rules/
#     └── example.yaml  # フレームワーク提供のサンプル
```

##### Step 2: 組織標準のルール定義（ユーザーが作成）

```yaml
# .ukiyoue/rules/company-standards.yaml
rules:
  - id: API-001
    name: "標準エラーレスポンス"
    validation:
      check: hasErrorResponses # 組み込み関数を使用
      requiredCodes: [400, 401, 500]
```

##### Step 3: 必要に応じてカスタム検証関数を追加（オプション）

```typescript
// .ukiyoue/validators/custom-validators.ts
export const myCustomCheck = async (doc, params) => {
  // プロジェクト固有のロジック
  return { valid: true };
};
```

```yaml
# .ukiyoue/rules/project-specific.yaml
rules:
  - id: PROJ-001
    validation:
      check: myCustomCheck # カスタム関数を使用
```

##### Step 4: 検証実行（フレームワークが自動的に統合）

```bash
ukiyoue validate ./docs
# → .ukiyoue/rules/*.yaml を自動ロード
# → .ukiyoue/validators/*.ts を自動ロード（存在すれば）
# → 統合検証を実行
```

### ルール定義スキーマ

```yaml
# schemas/custom-rule.schema.json (JSON Schema for rule definition itself)
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["rules"],
  "properties":
    {
      "rules":
        {
          "type": "array",
          "items":
            {
              "type": "object",
              "required": ["id", "name", "target", "validation"],
              "properties":
                {
                  "id": { "type": "string", "pattern": "^[A-Z]+-\\d{3}$" },
                  "name": { "type": "string" },
                  "description": { "type": "string" },
                  "severity": { "enum": ["error", "warning", "info"] },
                  "target":
                    {
                      "type": "object",
                      "required": ["type"],
                      "properties":
                        {
                          "type": { "type": "string" },
                          "subtype": { "type": "string" },
                        },
                    },
                  "condition":
                    {
                      "type": "object",
                      "properties":
                        {
                          "property": { "type": "string" },
                          "operator":
                            { "enum": ["equals", "notEquals", "in", "notIn"] },
                          "value": {},
                        },
                    },
                  "validation":
                    {
                      "type": "object",
                      "required": ["check", "message"],
                      "properties":
                        {
                          "check": { "type": "string" },
                          "message": { "type": "string" },
                          "action": { "type": "string" },
                          "reference": { "type": "string" },
                        },
                    },
                },
            },
        },
    },
}
```

### ルールエンジン実装

```typescript
// src/engines/custom-rule-engine.ts

interface CustomRule {
  id: string;
  name: string;
  description?: string;
  severity: "error" | "warning" | "info";
  target: {
    type: string;
    subtype?: string;
  };
  condition?: {
    property: string;
    operator: "equals" | "notEquals" | "in" | "notIn";
    value: any;
  };
  validation: {
    check: string; // 検証関数名
    message: string;
    action?: string;
    reference?: string;
    [key: string]: any; // 検証関数固有のパラメータ
  };
}

interface CustomRuleSet {
  rules: CustomRule[];
}

class CustomRuleEngine {
  private rules: Map<string, CustomRule> = new Map();
  private validators: Map<string, ValidationFunction> = new Map();

  constructor() {
    // 組み込み検証関数の登録
    this.registerBuiltinValidators();
  }

  loadRules(ruleSet: CustomRuleSet) {
    for (const rule of ruleSet.rules) {
      this.rules.set(rule.id, rule);
    }
  }

  async validate(
    document: UkiyoueDocument,
    context: ValidationContext
  ): Promise<CustomRuleViolation[]> {
    const violations: CustomRuleViolation[] = [];

    for (const rule of this.rules.values()) {
      // ターゲットマッチング
      if (!this.matchesTarget(document, rule.target)) {
        continue;
      }

      // 条件チェック
      if (rule.condition && !this.evaluateCondition(document, rule.condition)) {
        continue;
      }

      // 検証実行
      const validator = this.validators.get(rule.validation.check);
      if (!validator) {
        throw new Error(`Unknown validator: ${rule.validation.check}`);
      }

      const result = await validator(document, rule.validation, context);
      if (!result.valid) {
        violations.push({
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          message: rule.validation.message,
          action: rule.validation.action,
          reference: rule.validation.reference,
          details: result.details,
        });
      }
    }

    return violations;
  }

  private matchesTarget(
    document: UkiyoueDocument,
    target: CustomRule["target"]
  ): boolean {
    if (document.metadata.type !== target.type) {
      return false;
    }
    if (target.subtype && document.metadata.subtype !== target.subtype) {
      return false;
    }
    return true;
  }

  private evaluateCondition(
    document: UkiyoueDocument,
    condition: NonNullable<CustomRule["condition"]>
  ): boolean {
    const value = this.getPropertyValue(document, condition.property);

    switch (condition.operator) {
      case "equals":
        return value === condition.value;
      case "notEquals":
        return value !== condition.value;
      case "in":
        return (
          Array.isArray(condition.value) && condition.value.includes(value)
        );
      case "notIn":
        return (
          Array.isArray(condition.value) && !condition.value.includes(value)
        );
      default:
        return false;
    }
  }

  private getPropertyValue(obj: any, path: string): any {
    return path.split(".").reduce((acc, key) => acc?.[key], obj);
  }

  private registerBuiltinValidators() {
    // hasLinkedTestCase: 関連するテストケースの存在確認
    this.validators.set("hasLinkedTestCase", async (doc, params, context) => {
      const testCases = context.getLinkedDocuments(doc.metadata.id, "testCase");
      const minCount = params.minCount || 1;
      return {
        valid: testCases.length >= minCount,
        details: { found: testCases.length, required: minCount },
      };
    });

    // hasErrorResponses: API仕様のエラーレスポンス確認
    this.validators.set("hasErrorResponses", async (doc, params) => {
      if (doc.metadata.type !== "api-spec") {
        return { valid: true };
      }

      const requiredCodes = params.requiredCodes || [400, 401, 500];
      const responses = doc.content.responses || {};
      const definedCodes = Object.keys(responses).map(Number);
      const missingCodes = requiredCodes.filter(
        (code) => !definedCodes.includes(code)
      );

      return {
        valid: missingCodes.length === 0,
        details: { missing: missingCodes },
      };
    });

    // descriptionLength: 説明文の長さチェック
    this.validators.set("descriptionLength", async (doc, params) => {
      const description = doc.content.description || "";
      const minLength = params.minLength || 0;
      const maxLength = params.maxLength || Infinity;
      const actualLength = description.length;

      return {
        valid: actualLength >= minLength && actualLength <= maxLength,
        details: {
          actualLength,
          minLength,
          maxLength,
          shortfall: Math.max(0, minLength - actualLength),
        },
      };
    });

    // hasSecurityScheme: APIセキュリティスキームの確認
    this.validators.set("hasSecurityScheme", async (doc, params) => {
      if (doc.metadata.type !== "api-spec") {
        return { valid: true };
      }

      const requiredSchemes = params.requiredSchemes || [];
      const security = doc.content.security || [];
      const definedSchemes = security.flatMap((s: any) => Object.keys(s));

      const hasRequired = requiredSchemes.some((scheme: string) =>
        definedSchemes.includes(scheme)
      );

      return {
        valid: hasRequired,
        details: {
          required: requiredSchemes,
          defined: definedSchemes,
        },
      };
    });

    // hasAcceptanceCriteria: 受入基準の存在確認
    this.validators.set("hasAcceptanceCriteria", async (doc, params) => {
      const criteria = doc.content.acceptanceCriteria || [];
      const minCount = params.minCount || 1;

      return {
        valid: Array.isArray(criteria) && criteria.length >= minCount,
        details: {
          count: criteria.length,
          required: minCount,
        },
      };
    });

    // その他の組み込み検証関数...
  }

  registerValidator(name: string, fn: ValidationFunction) {
    this.validators.set(name, fn);
  }
}

type ValidationFunction = (
  document: UkiyoueDocument,
  params: Record<string, any>,
  context: ValidationContext
) => Promise<{ valid: boolean; details?: any }>;

interface ValidationContext {
  getLinkedDocuments(docId: string, type: string): UkiyoueDocument[];
  getAllDocuments(): UkiyoueDocument[];
}
```

### 使用例

```typescript
import { CustomRuleEngine } from "@ukiyoue/framework";
import YAML from "yaml";

// ルール読み込み
const rulesYaml = await Bun.file(
  "./.ukiyoue/rules/company-standards.yaml"
).text();
const ruleSet = YAML.parse(rulesYaml);

// エンジン初期化
const engine = new CustomRuleEngine();
engine.loadRules(ruleSet);

// 検証実行
const violations = await engine.validate(document, context);

// 結果表示
violations.forEach((v) => {
  console.error(`[${v.severity}] ${v.message}`);
  if (v.action) console.error(`  💡 ${v.action}`);
});
```

### ルール定義例

```yaml
# .ukiyoue/rules/company-standards.yaml
rules:
  # API仕様のエラーレスポンス必須化
  - id: API-001
    name: "APIエンドポイントにはエラーレスポンスが必要"
    severity: warning
    target:
      type: api-spec
    validation:
      check: hasErrorResponses
      requiredCodes: [400, 401, 500]
      message: "推奨されるエラーレスポンス（400, 401, 500）が不足しています"
      action: "標準的なエラーレスポンスを追加してください"

  # 高優先度要件の詳細記述
  - id: DOC-001
    name: "高優先度要件の詳細記述"
    severity: warning
    target:
      type: requirement
    condition:
      property: content.priority
      operator: equals
      value: high
    validation:
      check: descriptionLength
      minLength: 200
      message: "高優先度の要件には詳細な説明（200文字以上）が推奨されます"
      action: "ユースケース、受入基準等を含めた詳細説明を追加してください"
```

### カスタム検証関数の実装例

プロジェクト固有のロジックが必要な場合のみ作成：

```typescript
// .ukiyoue/validators/custom-validators.ts

// APIバージョニング規則
export const apiVersioningCheck = async (doc, params) => {
  const path = doc.content.basePath || "";
  const hasVersion = /\/v\d+/.test(path);

  return {
    valid: hasVersion,
    details: { suggestion: "例: /api/v1/..." },
  };
};

// 期限チェック
export const implementationDeadlineCheck = async (doc, params, context) => {
  const approvedDate = new Date(doc.content.approvedAt);
  const maxDays = params.maxDays || 30;
  const deadline = new Date(approvedDate);
  deadline.setDate(deadline.getDate() + maxDays);

  const designDocs = context.getLinkedDocuments(doc.metadata.id, "design");

  return {
    valid: designDocs.length > 0 || new Date() <= deadline,
    details: { daysRemaining: Math.ceil((deadline - new Date()) / 86400000) },
  };
};
```

### カスタム検証関数の登録

```typescript
import * as customValidators from "./.ukiyoue/validators/custom-validators";

const engine = new CustomRuleEngine();

// カスタム検証関数を登録
for (const [name, fn] of Object.entries(customValidators)) {
  engine.registerValidator(name, fn);
}

engine.loadRules(ruleSet);
```

### ルール例（組織標準）

```yaml
# .ukiyoue/rules/company-standards.yaml
rules:
  # API仕様のエラーレスポンス必須化
  - id: API-001
    name: "APIエンドポイントにはエラーレスポンスが必要"
    description: "すべてのAPIエンドポイントは、標準的なエラーレスポンス（400, 401, 500）を定義する必要がある"
    severity: warning
    target:
      type: api-spec
    validation:
      check: hasErrorResponses
      requiredCodes: [400, 401, 500]
      message: "推奨されるエラーレスポンス（400, 401, 500）が不足しています"
      action: "標準的なエラーレスポンスを追加してください"
      reference: "/templates/error-responses.json"

  # 認証APIのセキュリティ必須化
  - id: SEC-001
    name: "認証APIのセキュリティスキーム必須"
    description: "認証関連のAPIは、必ずセキュリティスキーム（bearer or oauth2）を定義する必要がある"
    severity: error
    target:
      type: api-spec
    condition:
      property: content.tags
      operator: in
      value: authentication
    validation:
      check: hasSecurityScheme
      requiredSchemes: [bearer, oauth2]
      message: "認証APIはセキュリティスキーム（bearer or oauth2）が必須です"
      action: "セキュリティスキームを追加してください"
      reference: "/docs/security-best-practices.md"

  # 高優先度要件の詳細記述
  - id: DOC-001
    name: "高優先度要件の詳細記述"
    description: "優先度が'high'の要件は、詳細な説明（200文字以上）が必要"
    severity: warning
    target:
      type: requirement
    condition:
      property: content.priority
      operator: equals
      value: high
    validation:
      check: descriptionLength
      minLength: 200
      message: "高優先度の要件には詳細な説明（200文字以上）が推奨されます（現在: {actualLength}文字、不足: {shortfall}文字）"
      action: "ユースケース、受入基準、前提条件等を含めた詳細説明を追加してください"
      reference: "/templates/requirement-detail.md"

  # 受入基準の必須化（承認済み要件）
  - id: DOC-002
    name: "承認済み要件には受入基準が必要"
    description: "ステータスが'approved'の要件には、明確な受入基準が必要"
    severity: error
    target:
      type: requirement
    condition:
      property: content.status
      operator: equals
      value: approved
    validation:
      check: hasAcceptanceCriteria
      minCount: 3
      message: "承認済みの要件には受入基準が最低3つ必要です（現在: {count}個）"
      action: "受入基準を追加してください（推奨: 正常系2つ、異常系1つ以上）"
      reference: "/docs/acceptance-criteria-guide.md"
```

### 統合検証パイプライン

```typescript
// すべての検証レイヤーを統合
async function validateAll(document: unknown) {
  // Level 1: 構造検証（JSON Schema）
  const structureResult = await validateJsonSchema(document);
  if (!structureResult.valid) {
    return { level: "structure", errors: structureResult.errors };
  }

  // Level 2: セマンティック検証（SHACL）
  const semanticResult = await validateSHACL(document);
  if (!semanticResult.valid) {
    return { level: "semantic", errors: semanticResult.errors };
  }

  // Level 3: カスタムルール検証
  const customViolations = await customRuleEngine.validate(document, context);

  return {
    level: customViolations.length > 0 ? "custom" : "valid",
    violations: customViolations,
  };
}
```

### テスト

```typescript
import { describe, it, expect } from "bun:test";

describe("Custom Rule Engine", () => {
  it("should validate API error responses", async () => {
    const doc = {
      metadata: { type: "api-spec" },
      content: { responses: { 200: {}, 404: {} } },
    };

    const violations = await engine.validate(doc, context);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("API-001");
  });
});
```

## Related

- **ADR-002**: Structure Validation - JSON Schema（構造検証の第1段階）
- **ADR-006**: Semantic Integrity Validation - SHACL（セマンティック検証の第2段階）
- **ADR-004**: Schema Validation Engine - Ajv（JSON Schema検証エンジン）
