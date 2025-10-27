# ADR-005: Element Identification

## Status

Accepted

## Context

ドキュメント内の特定の要素（フィールド、配列要素等）を一意に識別・参照する方法を定義する必要があります。これは、エラー報告、部分的な更新、要素間のリンク等に不可欠です。

**要求事項**:

- ✅ 一意性（同じパスは常に同じ要素を指す）
- ✅ 階層構造の表現（ネストしたオブジェクト・配列）
- ✅ 人間可読性（デバッグ時の理解しやすさ）
- ✅ 機械処理可能（プログラムで容易に解析・生成）
- ✅ 標準化（広く認知された仕様）
- ✅ JSON互換（ADR-001との整合性）
- ✅ エラーメッセージでの利用（Ajvとの統合）
- ✅ URL安全（特殊文字のエスケープ）
- ✅ 軽量（オーバーヘッドが小さい）

**制約条件**:

- JSON形式のドキュメント（ADR-001）
- Ajv検証エンジンと統合（ADR-004）
- TypeScript/Bun環境で処理可能
- IETF/W3C標準に準拠することが望ましい

## Decision

**JSON Pointer (RFC 6901)** を採用します。

## Options Considered

### Option A: JSON Pointer (RFC 6901) (提案)

**概要**: IETF標準のJSON要素参照形式

**Pros**:

- ✅ IETF標準（RFC 6901）で広く認知されている
- ✅ シンプルで人間可読
  - 例: `/metadata/title`, `/items/0/name`
- ✅ 階層構造を自然に表現
- ✅ JSON完全対応
- ✅ Ajvがネイティブサポート（エラー報告で使用）
- ✅ JSON Schema `$ref`と互換性あり
- ✅ 軽量（単なる文字列）
- ✅ URL安全（エスケープ規則定義済み）
- ✅ 広範なライブラリサポート
- ✅ パフォーマンスが良い（単純な文字列パース）

**Cons**:

- ⚠️ 配列インデックスが0ベース（自然言語では1ベース）
- ⚠️ 特殊文字のエスケープが必要（`~`, `/`）

**実装例**:

```json
{
  "metadata": {
    "title": "User Authentication",
    "tags": ["security", "auth"]
  },
  "items": [
    { "name": "Login", "priority": "high" },
    { "name": "Logout", "priority": "low" }
  ]
}
```

要素参照:

- `/metadata/title` → `"User Authentication"`
- `/metadata/tags/0` → `"security"`
- `/items/1/priority` → `"low"`

エスケープ:

- `~` → `~0`
- `/` → `~1`
- 例: `/foo~bar/baz~qux` → キー名 `foo~bar` の下の `baz/qux`

### Option B: JSONPath

**概要**: XPathライクなJSON要素参照形式

**Pros**:

- ✅ 強力なクエリ機能（ワイルドカード、フィルタ等）
- ✅ 複数要素の選択が可能
- ✅ 人間可読

**Cons**:

- ❌ 標準化されていない（複数の実装が非互換）
- ❌ 複雑すぎる（単純な要素参照には過剰）
- ❌ Ajvが直接サポートしない
- ❌ パフォーマンスが劣る（パースが重い）
- ❌ 一意性が保証されない（クエリ結果が複数要素の場合）
- ❌ JSON Schemaとの統合が困難

### Option C: XPath

**概要**: XML向けの要素参照形式

**Pros**:

- ✅ 強力なクエリ機能
- ✅ W3C標準

**Cons**:

- ❌ XML用途（JSONとの整合性が低い）
- ❌ 複雑すぎる
- ❌ JSONネイティブサポートなし
- ❌ ライブラリサポートが限定的（JSON用途では）
- ❌ パフォーマンスが悪い
- ❌ Ajvとの統合不可

### Option D: ドット記法 (Lodash get/set)

**概要**: `object.property.nested` 形式

**Pros**:

- ✅ JavaScriptネイティブ
- ✅ 直感的

**Cons**:

- ❌ 標準仕様がない（実装依存）
- ❌ 配列インデックスの表現が曖昧
  - `items.0` か `items[0]` か？
- ❌ 特殊文字（`.` を含むキー名）の扱いが困難
- ❌ エスケープ規則が未定義
- ❌ Ajvが直接サポートしない
- ❌ JSON Schemaとの統合が困難

### Option E: Custom Path Notation

**概要**: プロジェクト独自のパス記法

**Pros**:

- ✅ 完全なカスタマイズ性

**Cons**:

- ❌ 標準がなく、相互運用性ゼロ
- ❌ ライブラリサポートなし
- ❌ 開発・メンテナンスコスト膨大
- ❌ Ajvとの統合が困難
- ❌ コミュニティサポートなし
- ❌ JSON Pointerが存在する今、選択肢にならない

### Option F: URI Fragment (#/path/to/element)

**概要**: URI Fragment形式でのJSON要素参照

**Pros**:

- ✅ URLとの統合が自然
- ✅ JSON Pointer + `#` プレフィックス

**Cons**:

- ❌ 本質的にはJSON Pointerと同じ（`#` プレフィックスのみの差）
- ❌ 単純な要素参照には `#` が冗長
- ❌ 内部参照では `#` 不要
- ❌ JSON Pointerで十分

## Comparison Matrix

| 評価基準                       | 重み | JSON Pointer | JSONPath | XPath | ドット記法 | Custom | URI Fragment |
| ------------------------------ | ---- | ------------ | -------- | ----- | ---------- | ------ | ------------ |
| **IETF/W3C標準準拠**           | 5    | 5            | 0        | 5     | 0          | 0      | 4            |
| **JSON統合性**                 | 5    | 5            | 5        | 0     | 4          | 3      | 5            |
| **Ajv統合**                    | 5    | 5            | 0        | 0     | 0          | 0      | 3            |
| **シンプルさ**                 | 4    | 5            | 2        | 1     | 4          | 3      | 4            |
| **一意性保証**                 | 4    | 5            | 2        | 3     | 3          | 4      | 5            |
| **人間可読性**                 | 3    | 5            | 4        | 2     | 5          | 4      | 4            |
| **パフォーマンス**             | 3    | 5            | 3        | 2     | 4          | 3      | 5            |
| **ライブラリサポート**         | 3    | 5            | 3        | 1     | 4          | 0      | 3            |
| **エスケープ規則**             | 2    | 5            | 3        | 4     | 1          | 2      | 5            |
| **学習コスト（低いほど良い）** | 2    | 5            | 3        | 1     | 5          | 2      | 4            |
| **合計**                       | 36   | **180**      | 95       | 74    | 118        | 79     | 156          |
| **正規化スコア（/30）**        | -    | **30**       | 16       | 12    | 20         | 13     | 26           |

**重み付け理由**:

- **IETF/W3C標準準拠（5）**: 相互運用性と長期的な保守性に直結
- **JSON統合性（5）**: ADR-001との整合性が必須
- **Ajv統合（5）**: ADR-004との統合、エラー報告に必須
- **シンプルさ（4）**: 実装と理解の容易さ
- **一意性保証（4）**: 要素参照の信頼性
- **人間可読性（3）**: デバッグ時の効率性
- **パフォーマンス（3）**: 大量要素の参照解決速度
- **ライブラリサポート（3）**: 実装効率と信頼性
- **エスケープ規則（2）**: 特殊文字処理の明確さ
- **学習コスト（2）**: 重要だが、シンプルな仕様で軽減可能

## Consequences

### Positive

- ✅ **IETF標準**: RFC 6901により標準化、広く認知
- ✅ **Ajv完全統合**: エラー報告で自動的に使用される
- ✅ **シンプル**: 文字列ベースで処理が容易
- ✅ **一意性**: 常に単一要素を指す
- ✅ **JSON Schema統合**: `$ref`との互換性
- ✅ **ライブラリ充実**: 多数の実装あり
- ✅ **パフォーマンス**: 軽量で高速

### Negative

- ⚠️ **配列インデックス**: 0ベース（人間には1ベースが自然）
- ⚠️ **エスケープ**: `~`, `/` の扱いに注意が必要

### Mitigation

- **配列インデックス**:
  - ドキュメントで明示的に説明
  - エラーメッセージで「0番目（最初の要素）」と補足
- **エスケープ**:
  - ライブラリを使用（手動エスケープは避ける）
  - キー名に特殊文字を使わない設計推奨

## Implementation Notes

### ライブラリ

```bash
bun add json-pointer
```

### 基本的な使用方法

```typescript
import pointer from "json-pointer";

const doc = {
  metadata: {
    title: "User Authentication",
    tags: ["security", "auth"],
  },
  items: [
    { name: "Login", priority: "high" },
    { name: "Logout", priority: "low" },
  ],
};

// 要素取得
const title = pointer.get(doc, "/metadata/title");
console.log(title); // "User Authentication"

const firstTag = pointer.get(doc, "/metadata/tags/0");
console.log(firstTag); // "security"

// 要素設定
pointer.set(doc, "/metadata/version", "1.0.0");

// 要素削除
pointer.remove(doc, "/metadata/tags/0");

// 存在確認
const hasTitle = pointer.has(doc, "/metadata/title");
console.log(hasTitle); // true
```

### エスケープ処理

```typescript
// 特殊文字を含むキー名
const doc = {
  "foo~bar": {
    "baz/qux": "value",
  },
};

// エスケープが必要
const path = "/foo~0bar/baz~1qux"; // ~0 = ~, ~1 = /
const value = pointer.get(doc, path);
console.log(value); // "value"

// ライブラリを使用すれば自動エスケープ
pointer.compile(["foo~bar", "baz/qux"]); // "/foo~0bar/baz~1qux"
```

### Ajv統合

```typescript
import Ajv from "ajv";
import pointer from "json-pointer";

const ajv = new Ajv({ allErrors: true });
const schema = {
  type: "object",
  required: ["name"],
  properties: {
    name: { type: "string" },
    items: {
      type: "array",
      items: { type: "object", required: ["id"] },
    },
  },
};

const validate = ajv.compile(schema);
const doc = {
  name: "Test",
  items: [{ id: 1 }, { title: "Missing ID" }],
};

validate(doc);

// Ajvのエラーは自動的にJSON Pointer形式
console.log(validate.errors);
// [
//   {
//     instancePath: '/items/1',  ← JSON Pointer形式
//     keyword: 'required',
//     params: { missingProperty: 'id' },
//     message: "must have required property 'id'"
//   }
// ]

// エラー位置の要素を取得
const errorPath = validate.errors[0].instancePath;
const problematicElement = pointer.get(doc, errorPath);
console.log(problematicElement); // { title: "Missing ID" }
```

### フィードバック生成への活用

```typescript
interface ValidationFeedback {
  path: string; // JSON Pointer
  message: string;
  suggestion?: string;
}

function generateFeedback(errors: ValidationError[]): ValidationFeedback[] {
  return errors.map((err) => {
    const path = err.instancePath || "/";
    let suggestion: string | undefined;

    if (err.keyword === "required") {
      const missing = err.params.missingProperty;
      suggestion = `'${missing}' フィールドを追加してください`;
    } else if (err.keyword === "type") {
      const expected = err.params.type;
      suggestion = `型を ${expected} に修正してください`;
    }

    return {
      path,
      message: err.message || "",
      suggestion,
    };
  });
}
```

### パフォーマンス最適化

```typescript
// JSON Pointerのコンパイル（繰り返し使用する場合）
const compiledPointer = pointer.compile(["metadata", "items", 0, "priority"]);

// 高速な取得（パースが不要）
const value1 = compiledPointer.get(doc);
const value2 = compiledPointer.get(doc); // 2回目以降も高速
```

### TypeScript型定義

```typescript
// JSON Pointerの型安全性
type JSONPointer = `/${string}`;

function safeGet<T = unknown>(doc: object, path: JSONPointer): T | undefined {
  try {
    return pointer.get(doc, path) as T;
  } catch {
    return undefined;
  }
}

// 使用例
const title = safeGet<string>(doc, "/metadata/title");
```

### テスト

```typescript
import { describe, it, expect } from "bun:test";
import pointer from "json-pointer";

describe("JSON Pointer", () => {
  const doc = {
    foo: { bar: "baz" },
    items: [1, 2, 3],
  };

  it("should get nested property", () => {
    expect(pointer.get(doc, "/foo/bar")).toBe("baz");
  });

  it("should get array element", () => {
    expect(pointer.get(doc, "/items/1")).toBe(2);
  });

  it("should handle special characters", () => {
    const doc2 = { "a/b": { "c~d": "value" } };
    expect(pointer.get(doc2, "/a~1b/c~0d")).toBe("value");
  });
});
```

## Related

- **ADR-001**: Document Format - JSON形式（JSON Pointer対応）
- **ADR-004**: Schema Validation Engine - Ajv（JSON Pointer使用）
- **ADR-002**: Structure Validation - JSON Schema `$ref`（JSON Pointer互換）
