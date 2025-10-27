# ADR-004: Schema Validation Engine

## Status

Accepted

## Context

ADR-002でJSON Schema (Draft 2020-12)を構造検証手法として採用しました。次に、JSON Schemaを実際に検証するエンジン（ライブラリ）を選定する必要があります。

**要求事項**:

- ✅ JSON Schema Draft 2020-12完全対応
- ✅ 高速な検証処理（大量ドキュメント対応）
- ✅ 詳細なエラーメッセージ生成
- ✅ TypeScript型定義サポート
- ✅ `$ref`解決機能
- ✅ カスタムキーワード拡張可能
- ✅ フォーマット検証（email, uri, date-time等）
- ✅ エラー位置の正確な特定（JSON Pointer）
- ✅ プログラマティックなAPI
- ✅ アクティブにメンテナンスされている

**制約条件**:

- TypeScript/Bun環境で動作（ADR-008, ADR-009）
- npm/bunパッケージとして利用可能
- MITライセンス等のOSSライセンス
- パフォーマンス目標: 1000ドキュメント/秒以上

## Decision

**Ajv (Another JSON Schema Validator) v8** を採用します。

## Options Considered

### Option A: Ajv v8 (提案)

**概要**: 最も高速かつ広く使われているJSON Schema検証ライブラリ

**Pros**:

- ✅ JSON Schema Draft 2020-12完全対応
- ✅ 圧倒的なパフォーマンス（他ライブラリの2〜10倍高速）
- ✅ 詳細なエラーメッセージ（`ajv-errors`プラグイン）
- ✅ TypeScript型定義が完備
- ✅ `$ref`完全サポート（外部参照も可能）
- ✅ カスタムキーワード・フォーマット対応
- ✅ スタンドアロンコード生成（さらに高速化）
- ✅ JSON Pointerによるエラー位置特定
- ✅ プラグインエコシステム（ajv-formats, ajv-errors等）
- ✅ アクティブなメンテナンス（週次更新）
- ✅ 広範な採用実績（npm週間DL 4000万+）
- ✅ Bunで動作確認済み

**Cons**:

- ⚠️ APIがやや複雑（高機能ゆえ）
- ⚠️ エラーメッセージのカスタマイズに追加プラグイン必要

**実装例**:

```typescript
import Ajv from "ajv";
import addFormats from "ajv-formats";
import ajvErrors from "ajv-errors";

const ajv = new Ajv({
  allErrors: true, // すべてのエラーを収集
  verbose: true, // 詳細情報を含める
});

addFormats(ajv); // email, uri, date-time等
ajvErrors(ajv); // カスタムエラーメッセージ

const schema = {
  type: "object",
  required: ["name"],
  properties: {
    name: { type: "string", minLength: 1 },
    email: { type: "string", format: "email" },
  },
};

const validate = ajv.compile(schema);
const valid = validate(data);

if (!valid) {
  console.log(validate.errors);
  // [{ instancePath: '/email', message: 'must match format "email"' }]
}
```

### Option B: Zod

**概要**: TypeScript-firstのスキーマバリデーションライブラリ

**Pros**:

- ✅ TypeScript型推論が強力
- ✅ 開発者体験が良い
- ✅ エラーメッセージがわかりやすい

**Cons**:

- ❌ JSON Schemaとの互換性なし（独自スキーマ）
- ❌ ADR-002の決定と矛盾
- ❌ スキーマをTypeScriptコードで定義（宣言的でない）
- ❌ 外部ツールとの統合が困難
- ❌ パフォーマンスがAjvより劣る

### Option C: json-schema (npm)

**概要**: シンプルなJSON Schema検証ライブラリ

**Pros**:

- ✅ シンプルなAPI
- ✅ 軽量

**Cons**:

- ❌ Draft 2020-12非対応（Draft-04まで）
- ❌ パフォーマンスが低い
- ❌ メンテナンスが停滞
- ❌ 機能が限定的
- ❌ Ajvが利用可能な今、選ぶ理由がない

### Option D: jsonschema (Python PyPI)

**概要**: Pythonの標準的なJSON Schema検証ライブラリ

**Pros**:

- ✅ Pythonエコシステムで広く使用

**Cons**:

- ❌ TypeScript環境で利用不可（ADR-008と矛盾）
- ❌ 言語が異なる
- ❌ パフォーマンスがAjvより劣る

### Option E: tv4 (Tiny Validator for v4)

**概要**: 軽量なJSON Schema検証ライブラリ

**Pros**:

- ✅ 非常に軽量
- ✅ シンプル

**Cons**:

- ❌ Draft-04のみ対応（2020-12非対応）
- ❌ メンテナンス停止（2016年以降更新なし）
- ❌ パフォーマンスがAjvより劣る
- ❌ 機能が限定的
- ❌ 採用すべきでない

### Option F: Custom Implementation (手作り)

**概要**: プロジェクト独自の検証エンジン

**Pros**:

- ✅ 完全なカスタマイズ性

**Cons**:

- ❌ 開発コストが膨大
- ❌ JSON Schema仕様（数百ページ）の完全実装は非現実的
- ❌ バグのリスクが極めて高い
- ❌ パフォーマンス最適化が困難
- ❌ コミュニティサポートなし
- ❌ Ajvが存在する今、選択肢にならない

## Comparison Matrix

| 評価基準                         | 重み | Ajv v8  | Zod | json-schema | jsonschema (Py) | tv4 | Custom |
| -------------------------------- | ---- | ------- | --- | ----------- | --------------- | --- | ------ |
| **Draft 2020-12対応**            | 5    | 5       | 0   | 0           | 3               | 0   | 3      |
| **パフォーマンス**               | 5    | 5       | 3   | 2           | 2               | 2   | 1      |
| **TypeScript統合**               | 4    | 5       | 5   | 3           | 0               | 3   | 4      |
| **エラーメッセージ詳細度**       | 4    | 5       | 5   | 2           | 3               | 2   | 3      |
| **$ref サポート**                | 4    | 5       | 2   | 3           | 4               | 3   | 2      |
| **カスタマイズ性**               | 3    | 5       | 4   | 2           | 2               | 1   | 5      |
| **フォーマット検証**             | 3    | 5       | 4   | 2           | 3               | 2   | 2      |
| **エコシステム（プラグイン等）** | 3    | 5       | 4   | 1           | 3               | 1   | 0      |
| **メンテナンス状況**             | 4    | 5       | 5   | 1           | 4               | 0   | 3      |
| **学習コスト（低いほど良い）**   | 2    | 3       | 4   | 5           | 3               | 4   | 1      |
| **合計**                         | 37   | **179** | 132 | 77          | 97              | 63  | 88     |
| **正規化スコア（/30）**          | -    | **29**  | 21  | 12          | 16              | 10  | 14     |

**重み付け理由**:

- **Draft 2020-12対応（5）**: ADR-002の決定に準拠することが必須
- **パフォーマンス（5）**: 大量ドキュメント検証の実現可能性に直結
- **TypeScript統合（4）**: ADR-008との整合性、型安全性
- **エラーメッセージ詳細度（4）**: フィードバック生成（ミクロの好循環）の基盤
- **$ref サポート（4）**: スキーマの再利用性に必須
- **カスタマイズ性（3）**: プロジェクト固有要件への対応
- **フォーマット検証（3）**: email, uri等の検証品質
- **エコシステム（3）**: 拡張性と将来性
- **メンテナンス状況（4）**: 長期的な保守性とセキュリティ
- **学習コスト（2）**: 重要だが、ドキュメントで軽減可能

## Consequences

### Positive

- ✅ **最高速**: 検証処理が圧倒的に高速（1万ドキュメント/秒以上）
- ✅ **完全対応**: Draft 2020-12の全機能をサポート
- ✅ **詳細エラー**: フィードバック生成に最適な情報を提供
- ✅ **型安全**: TypeScript型定義により開発時エラー検出
- ✅ **拡張性**: カスタムキーワード・フォーマットを追加可能
- ✅ **実績**: 数千のプロジェクトで採用実績あり
- ✅ **スタンドアロン生成**: さらなる高速化が可能

### Negative

- ⚠️ **APIの複雑さ**: 高機能ゆえにオプションが多い
- ⚠️ **プラグイン依存**: エラーメッセージカスタマイズに追加プラグイン必要

### Mitigation

- **APIの複雑さ**:
  - 標準設定をラップしたヘルパー関数を提供
  - ベストプラクティスをドキュメント化
  - 一般的なユースケースはテンプレート化
- **プラグイン管理**:
  - 必要なプラグイン（ajv-formats, ajv-errors）を標準セットアップに含める
  - プラグイン設定もヘルパー関数で隠蔽

## Implementation Notes

### インストール

```bash
bun add ajv ajv-formats ajv-errors
```

### 標準設定

```typescript
// src/utils/ajv-setup.ts
import Ajv from "ajv";
import addFormats from "ajv-formats";
import ajvErrors from "ajv-errors";

export function createAjvInstance() {
  const ajv = new Ajv({
    // すべてのエラーを収集（最初のエラーで停止しない）
    allErrors: true,

    // 詳細情報を含める
    verbose: true,

    // スキーマとデータを変更しない
    removeAdditional: false,
    useDefaults: false,
    coerceTypes: false,

    // エラーメッセージに追加情報を含める
    $data: true,

    // 厳密モード
    strict: true,

    // Draft 2020-12対応
    strictSchema: true,
  });

  // フォーマット検証を追加
  addFormats(ajv);

  // カスタムエラーメッセージ対応
  ajvErrors(ajv);

  return ajv;
}
```

### スキーマコンパイル

```typescript
import { createAjvInstance } from "./utils/ajv-setup";
import documentSchema from "../schemas/document.schema.json";

const ajv = createAjvInstance();
const validateDocument = ajv.compile(documentSchema);

// 検証実行
const isValid = validateDocument(document);
if (!isValid) {
  // エラー情報取得
  const errors = validateDocument.errors;
  console.error(errors);
}
```

### エラーハンドリング

```typescript
interface ValidationError {
  instancePath: string; // JSON Pointer形式のパス
  schemaPath: string; // スキーマ内のパス
  keyword: string; // 失敗したキーワード（required, type等）
  params: Record<string, any>; // 追加パラメータ
  message?: string; // エラーメッセージ
}

function formatErrors(errors: ValidationError[]): string {
  return errors
    .map((err) => {
      const path = err.instancePath || "/";
      return `${path}: ${err.message}`;
    })
    .join("\n");
}
```

### スタンドアロンコード生成（最適化）

```typescript
import standaloneCode from "ajv/dist/standalone";

// スキーマからスタンドアロンコード生成
const ajv = createAjvInstance();
const validate = ajv.compile(schema);
const moduleCode = standaloneCode(ajv, validate);

// ファイルに保存
fs.writeFileSync("validate-document.js", moduleCode);

// 使用時
import validate from "./validate-document.js";
const isValid = validate(data);
```

### カスタムキーワード

```typescript
ajv.addKeyword({
  keyword: "ukiyoue-id",
  type: "string",
  validate: (schema: any, data: string) => {
    // Ukiyoue ID形式: [type]-[number] (例: REQ-001)
    return /^[A-Z]+-\d{3,}$/.test(data);
  },
  error: {
    message: "must be valid Ukiyoue ID format (e.g., REQ-001)",
  },
});
```

### パフォーマンス最適化

```typescript
// スキーマをキャッシュ
const schemaCache = new Map();

function getValidator(schemaId: string) {
  if (!schemaCache.has(schemaId)) {
    const schema = loadSchema(schemaId);
    const validate = ajv.compile(schema);
    schemaCache.set(schemaId, validate);
  }
  return schemaCache.get(schemaId);
}

// バッチ検証
function validateBatch(documents: unknown[]) {
  const validator = getValidator("document");
  return documents.map((doc) => ({
    valid: validator(doc),
    errors: validator.errors,
  }));
}
```

### テスト

```typescript
import { describe, it, expect } from "bun:test";
import { createAjvInstance } from "./ajv-setup";

describe("Ajv Validation", () => {
  it("should validate valid document", () => {
    const ajv = createAjvInstance();
    const schema = { type: "object", required: ["name"] };
    const validate = ajv.compile(schema);

    expect(validate({ name: "test" })).toBe(true);
  });

  it("should reject invalid document", () => {
    const ajv = createAjvInstance();
    const schema = { type: "object", required: ["name"] };
    const validate = ajv.compile(schema);

    expect(validate({})).toBe(false);
    expect(validate.errors).toHaveLength(1);
    expect(validate.errors[0].keyword).toBe("required");
  });
});
```

## Related

- **ADR-002**: Structure Validation - JSON Schemaを採用（Ajvで検証）
- **ADR-008**: Implementation Language - TypeScript（Ajv型定義活用）
- **ADR-009**: Runtime Environment - Bun（Ajv動作確認済み）
