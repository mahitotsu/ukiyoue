# ADR-002: Structure Validation Method

## Status

Accepted

## Context

Ukiyoue Frameworkでは、ドキュメントの構造を厳密に定義・検証する必要があります。これにより、AI生成ドキュメントの品質保証と、ミクロの好循環（自動検証→フィードバック→改善）を実現します。

**要求事項**:

- ✅ 厳密な型定義（曖昧さの排除）
- ✅ 必須項目・オプション項目の明示
- ✅ データ型の検証（string, number, boolean, array, object等）
- ✅ フォーマット検証（email, uri, date-time等）
- ✅ 構造的制約（minLength, maxLength, pattern等）
- ✅ 人間可読な定義形式
- ✅ AI生成可能な形式
- ✅ エラーメッセージの詳細化
- ✅ 広範なツール・ライブラリサポート
- ✅ IDE補完対応

**制約条件**:

- ADR-001でJSON形式を採用済み → JSON互換の検証手法が必要
- TypeScriptとの統合が必要（ADR-008）
- 高速な検証処理（大量ドキュメント対応）
- W3C/IETF標準への準拠が望ましい

## Decision

**JSON Schema (Draft 2020-12)** を採用します。

## Options Considered

### Option A: JSON Schema (提案)

**概要**: W3C標準のJSON検証仕様（Draft 2020-12）

**Pros**:

- ✅ W3C標準仕様で広く採用されている
- ✅ 豊富なバリデーション機能（型、必須、パターン、範囲等）
- ✅ 詳細なエラーメッセージ生成
- ✅ TypeScript型定義の自動生成可能（json-schema-to-typescript）
- ✅ IDE補完サポート（VS Code, IntelliJ等）
- ✅ 広範なライブラリエコシステム（Ajv, Joi等）
- ✅ JSON-LDと併用可能（ADR-003と互換）
- ✅ 人間可読なYAML/JSON形式
- ✅ `$ref`による再利用可能な定義
- ✅ `$defs`によるコンポーネント化

**Cons**:

- ⚠️ 学習コストがやや高い（複雑な制約の記述）
- ⚠️ セマンティックな検証には別途SHACL等が必要（意図的な分離）

**実装例**:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://ukiyoue.dev/schemas/document.schema.json",
  "title": "Ukiyoue Document",
  "type": "object",
  "required": ["@context", "metadata", "content"],
  "properties": {
    "@context": {
      "type": ["string", "object", "array"],
      "description": "JSON-LD context"
    },
    "metadata": {
      "$ref": "#/$defs/metadata"
    },
    "content": {
      "type": "object"
    }
  },
  "$defs": {
    "metadata": {
      "type": "object",
      "required": ["id", "type", "title", "version"],
      "properties": {
        "id": {
          "type": "string",
          "pattern": "^[a-z0-9-]+$"
        },
        "type": {
          "type": "string",
          "enum": ["requirement", "design", "api-spec", "test-case"]
        },
        "title": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "version": {
          "type": "string",
          "pattern": "^\\d+\\.\\d+\\.\\d+$"
        }
      }
    }
  }
}
```

### Option B: TypeScript型定義のみ

**概要**: TypeScriptの型システムで検証

**Pros**:

- ✅ TypeScriptネイティブ
- ✅ コンパイル時型チェック
- ✅ IDE補完が強力

**Cons**:

- ❌ ランタイム検証ができない（JSON入力の検証不可）
- ❌ エラーメッセージが不親切
- ❌ AI生成ドキュメントの検証に不向き
- ❌ 言語依存（TypeScript以外で利用不可）

### Option C: Zod (TypeScript Validation Library)

**概要**: TypeScript用のスキーマバリデーションライブラリ

**Pros**:

- ✅ TypeScriptネイティブ
- ✅ ランタイム検証可能
- ✅ 型推論が強力
- ✅ 開発体験が良い

**Cons**:

- ❌ TypeScript専用（他言語で利用不可）
- ❌ JSON Schemaとの相互運用性が低い
- ❌ スキーマのエクスポート・共有が困難
- ❌ IDE補完が限定的（JSON Schema比）
- ❌ W3C標準ではない

### Option D: Joi (Node.js Validation Library)

**概要**: Node.js用のオブジェクトスキーマバリデーションライブラリ

**Pros**:

- ✅ 豊富なバリデーション機能
- ✅ 詳細なエラーメッセージ
- ✅ Node.jsエコシステムで広く使用

**Cons**:

- ❌ プログラマティックな定義のみ（宣言的な定義不可）
- ❌ JSON Schemaとの相互運用性が低い
- ❌ IDE補完サポートが限定的
- ❌ スキーマのエクスポート・共有が困難
- ❌ W3C標準ではない

### Option E: Yup (JavaScript Validation Library)

**概要**: JavaScriptオブジェクト検証ライブラリ

**Pros**:

- ✅ シンプルなAPI
- ✅ React等のフロントエンドで人気

**Cons**:

- ❌ プログラマティックな定義のみ
- ❌ JSON Schemaとの相互運用性が低い
- ❌ IDE補完サポートが限定的
- ❌ バックエンド検証には過剰
- ❌ W3C標準ではない

### Option F: Custom Validation (手作り)

**概要**: プロジェクト独自の検証ロジック

**Pros**:

- ✅ 完全なカスタマイズ性
- ✅ 依存関係ゼロ

**Cons**:

- ❌ 開発・メンテナンスコストが膨大
- ❌ 標準仕様がなく、他ツールとの統合が困難
- ❌ バグのリスクが高い
- ❌ コミュニティサポートなし
- ❌ IDE補完サポート不可

## Comparison Matrix

| 評価基準                       | 重み | JSON Schema | TypeScript | Zod | Joi | Yup | Custom |
| ------------------------------ | ---- | ----------- | ---------- | --- | --- | --- | ------ |
| **標準準拠性**                 | 5    | 5           | 2          | 2   | 2   | 2   | 0      |
| **ランタイム検証**             | 5    | 5           | 0          | 5   | 5   | 5   | 5      |
| **TypeScript統合**             | 4    | 4           | 5          | 5   | 3   | 3   | 3      |
| **エラーメッセージ詳細度**     | 4    | 5           | 2          | 4   | 5   | 4   | 3      |
| **IDE補完サポート**            | 3    | 5           | 5          | 3   | 2   | 2   | 0      |
| **JSON-LD互換性**              | 4    | 5           | 3          | 3   | 3   | 3   | 4      |
| **再利用性（$ref等）**         | 3    | 5           | 3          | 2   | 1   | 1   | 2      |
| **学習コスト（低いほど良い）** | 2    | 3           | 4          | 4   | 3   | 4   | 2      |
| **エコシステム**               | 3    | 5           | 5          | 4   | 4   | 3   | 0      |
| **パフォーマンス**             | 3    | 5           | 5          | 4   | 4   | 4   | 5      |
| **合計**                       | 36   | **165**     | 125        | 127 | 121 | 117 | 88     |
| **正規化スコア（/30）**        | -    | **27.5**    | 20.8       | 21  | 20  | 19  | 15     |

**重み付け理由**:

- **標準準拠性（5）**: W3C標準準拠は相互運用性と長期保守性に直結
- **ランタイム検証（5）**: AI生成JSONの検証が主目的
- **TypeScript統合（4）**: 実装言語がTypeScript（ADR-008）
- **エラーメッセージ（4）**: フィードバック生成の基礎（ミクロの好循環）
- **JSON-LD互換性（4）**: ADR-003との整合性

## Consequences

### Positive

- ✅ **標準準拠**: W3C標準により他ツールとの統合が容易
- ✅ **型安全性**: TypeScript型定義を自動生成可能
- ✅ **詳細なエラー**: フィードバック生成に最適
- ✅ **再利用性**: `$ref`により共通定義を再利用
- ✅ **IDE サポート**: VS Code等で強力な補完
- ✅ **エコシステム**: Ajv等の高品質ライブラリが利用可能
- ✅ **JSON-LD互換**: セマンティクス定義と併用可能

### Negative

- ⚠️ **学習コスト**: 複雑な制約の記述に習熟が必要
- ⚠️ **スキーマ管理**: 多数のスキーマファイルの管理が必要

### Mitigation

- **学習コスト軽減**:
  - 標準テンプレートを提供
  - ベストプラクティスをドキュメント化
  - AI生成を活用（スキーマ自体もAIが生成可能）
- **スキーマ管理効率化**:
  - `$ref`による共通定義の再利用
  - `$defs`によるコンポーネント化
  - Git管理による変更履歴追跡

## Implementation Notes

### ツール選定

- **検証エンジン**: Ajv v8 (ADR-004で詳細決定)
- **型生成**: json-schema-to-typescript
- **エディタサポート**: VS Code JSON Schema Store

### ディレクトリ構造

```text
schemas/
├── document.schema.json       # 基本ドキュメント
├── metadata.schema.json       # メタデータ（共通定義）
├── requirement.schema.json    # 要件定義
├── api-spec.schema.json       # API仕様
├── test-case.schema.json      # テストケース
└── common/                    # 共通定義
    ├── types.schema.json
    └── formats.schema.json
```

### TypeScript統合

```typescript
// スキーマから型定義を自動生成
import type { UkiyoueDocument } from "./types/generated";

// ランタイム検証
import Ajv from "ajv";
const ajv = new Ajv();
const validate = ajv.compile(documentSchema);

const isValid = validate(document);
if (!isValid) {
  console.error(validate.errors);
}
```

### スキーマバージョニング

- `$id`にバージョンを含める: `https://ukiyoue.dev/schemas/v1/document.schema.json`
- セマンティックバージョニング適用
- 破壊的変更時はメジャーバージョンアップ

## Based on

- **ADR-001**: Document Format - JSON形式を採用
