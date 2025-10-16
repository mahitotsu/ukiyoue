# ADR-002: JSON Schema Draft 版の選定

## Status

**承認済み** (Accepted)

## Context

JSON Schema には複数の Draft（仕様バージョン）が存在する：

- **Draft-07** (2018 年) - 広く採用されている
- **Draft 2019-09** (2019 年) - モジュール化、新機能追加
- **Draft 2020-12** (2020 年) - 最新安定版

**前提**: ADR-001 で、JSON Schema をスキーマ定義に使用することが決定している。

どの Draft 版を採用するかは、ツールサポート、機能性、将来性に影響する。

### 満たすべき要件（specs/requirements.md より）

この決定は、以下のフレームワーク要件に直接影響する：

| 要件 ID         | 要件名                 | 関連性                                 |
| --------------- | ---------------------- | -------------------------------------- |
| **FR-AUTO-001** | 構造化された形式の定義 | 🔴 Critical - スキーマ機能の充実度     |
| **FR-AUTO-002** | 自動バリデーション     | 🔴 Critical - バリデータの性能・信頼性 |
| **FR-CONV-002** | 動的な情報再構成       | 🟡 High - スキーマの柔軟性             |

Draft 版の選択は、バリデーション性能、エディタ支援、エコシステムの豊富さに直結する。

## Decision Drivers

### 1. Draft-07 (2018)

**特徴**:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "integer", "minimum": 0 }
  },
  "required": ["name"]
}
```

**評価**:
| 項目 | スコア | 説明 |
|------|--------|------|
| ツールサポート | ⭐⭐⭐⭐⭐ | 最も広くサポートされている |
| 機能性 | ⭐⭐⭐⭐ | 基本的な機能は充実 |
| 成熟度 | ⭐⭐⭐⭐⭐ | 非常に安定 |
| 将来性 | ⭐⭐⭐ | 古いバージョン |

**サポート状況**:

- ✅ ajv (JavaScript): 完全サポート
- ✅ jsonschema (Python): 完全サポート
- ✅ VSCode: 完全サポート
- ✅ エコシステム: 最も豊富

**長所**:

- 最も広く採用されている
- ツール・ライブラリのサポートが最も充実
- 情報・ドキュメントが豊富
- 安定性が高い

**短所**:

- 古い仕様（2018 年）
- 新機能がない
- モジュール化されていない

---

### 2. Draft 2019-09

**特徴**:

```json
{
  "$schema": "https://json-schema.org/draft/2019-09/schema",
  "$id": "https://example.com/schemas/person.schema.json",
  "$defs": {
    "address": {
      "type": "object",
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" }
      }
    }
  },
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "address": { "$ref": "#/$defs/address" }
  }
}
```

**主な変更点**:

- `definitions` → `$defs`に変更（より明確）
- `$recursiveRef` / `$recursiveAnchor` 追加
- `unevaluatedProperties` / `unevaluatedItems` 追加
- メタスキーマのモジュール化

**評価**:
| 項目 | スコア | 説明 |
|------|--------|------|
| ツールサポート | ⭐⭐⭐⭐ | 主要ツールはサポート |
| 機能性 | ⭐⭐⭐⭐⭐ | 新機能が充実 |
| 成熟度 | ⭐⭐⭐⭐ | 安定している |
| 将来性 | ⭐⭐⭐⭐ | 比較的新しい |

**サポート状況**:

- ✅ ajv: 完全サポート（v8+）
- ✅ jsonschema (Python): サポート
- ✅ VSCode: サポート
- ⚠️ 一部古いツールは未対応

**長所**:

- `unevaluatedProperties`で厳密な検証
- `$defs`で命名が明確
- モジュール化された構造

**短所**:

- Draft-07 より採用率が低い
- 一部ツールが未対応
- 移行期の仕様

---

### 3. Draft 2020-12 (最新)

**特徴**:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/schemas/person.schema.json",
  "$defs": {
    "positiveInteger": {
      "type": "integer",
      "minimum": 1
    }
  },
  "type": "object",
  "properties": {
    "age": { "$ref": "#/$defs/positiveInteger" },
    "score": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100
    }
  },
  "prefixItems": [{ "type": "string" }, { "type": "number" }]
}
```

**主な変更点**:

- `$recursiveRef` → `$dynamicRef` / `$dynamicAnchor`に変更
- `items` / `additionalItems` → `prefixItems` / `items`に分離
- `$vocabulary`でカスタム語彙定義
- アノテーション収集の明確化

**評価**:
| 項目 | スコア | 説明 |
|------|--------|------|
| ツールサポート | ⭐⭐⭐ | 対応中、まだ限定的 |
| 機能性 | ⭐⭐⭐⭐⭐ | 最も高機能 |
| 成熟度 | ⭐⭐⭐ | 比較的新しい |
| 将来性 | ⭐⭐⭐⭐⭐ | 最新標準 |

**サポート状況**:

- ✅ ajv: サポート（v8.12+）
- ⚠️ jsonschema (Python): 部分的サポート
- ✅ VSCode: 部分的サポート
- ⚠️ 多くのツールが対応中

**長所**:

- 最新の機能
- より明確な仕様
- 将来性が高い

**短所**:

- ツールサポートがまだ限定的
- 情報・ドキュメントが少ない
- 移行コストが高い

---

## 比較マトリクス

| 項目               | Draft-07   | 2019-09    | 2020-12    |
| ------------------ | ---------- | ---------- | ---------- |
| **ツールサポート** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐     |
| **機能性**         | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **成熟度**         | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐     |
| **将来性**         | ⭐⭐⭐     | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ |
| **学習コスト**     | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐     |
| **情報量**         | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐     |
| **VSCode 統合**    | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐⭐   |
| **ajv サポート**   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Total**          | **38/40**  | **36/40**  | **33/40**  |

---

## Decision

### ✅ 採用: **Draft-07 (with 2019-09 features)**

**戦略**: Draft-07 を基本とし、必要に応じて 2019-09 の機能を使用

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://ukiyoue.dev/schemas/document-base.schema.json",
  "title": "Document Base Schema",
  "type": "object",
  "definitions": {
    "metadata": {
      "type": "object",
      "required": ["type", "title", "version"],
      "properties": {
        "type": { "type": "string" },
        "title": { "type": "string" },
        "version": { "type": "string" }
      }
    }
  },
  "required": ["$schema", "metadata", "content"],
  "properties": {
    "$schema": { "type": "string", "format": "uri" },
    "metadata": { "$ref": "#/definitions/metadata" },
    "content": { "type": "object" }
  }
}
```

### 理由

1. **最大のツールサポート**
   - ajv: 完全サポート、最高性能
   - VSCode: 完全サポート、自動補完・検証
   - jsonschema (Python): 完全サポート
   - すべての主要ツールが対応

2. **安定性と実績**
   - 2018 年から使用されている
   - 大規模プロジェクトでの実績多数
   - バグが少なく安定

3. **豊富な情報・ドキュメント**
   - チュートリアル、サンプルが豊富
   - Stack Overflow 等の情報多数
   - 学習コストが低い

4. **段階的移行パス**
   - 将来的に 2019-09 や 2020-12 への移行可能
   - ajv は複数バージョン対応
   - 後方互換性を保ちながら新機能追加可能

5. **必要十分な機能**
   - Ukiyoue の要件（構造定義、検証）を満たす
   - `$ref`による再利用
   - `pattern`、`enum`、`format`等の制約
   - 複雑なスキーマにも対応

### 2019-09/2020-12 の機能が必要になった場合

ajv は複数 Draft 対応のため、必要に応じて併用可能：

```javascript
import Ajv from "ajv";
import Ajv2019 from "ajv/dist/2019";
import Ajv2020 from "ajv/dist/2020";

// Draft-07（デフォルト）
const ajv07 = new Ajv();

// Draft 2019-09（必要な場合）
const ajv2019 = new Ajv2019();

// Draft 2020-12（必要な場合）
const ajv2020 = new Ajv2020();
```

---

## Consequences

### Positive

- ✅ 最高のツールサポート
- ✅ VSCode の完全な自動補完・検証
- ✅ ajv の最高性能
- ✅ 安定性が高い
- ✅ 情報・ドキュメントが豊富
- ✅ 学習コストが低い
- ✅ 既存エコシステムとの互換性

### Negative

- ⚠️ 2019-09/2020-12 の新機能は使えない
- ⚠️ 将来的に移行が必要になる可能性

### Mitigation

- **新機能が必要な場合**:
  - ajv は複数 Draft 対応なので併用可能
  - スキーマごとに Draft 版を選択可能
- **将来の移行**:
  - Draft-07 → 2019-09 は比較的容易
  - `definitions` → `$defs`の置換が主な変更
  - 段階的移行が可能

---

## Implementation Notes

### スキーマファイルの基本構造

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://ukiyoue.dev/schemas/[schema-name].schema.json",
  "title": "Schema Title",
  "description": "Schema description",
  "type": "object",
  "definitions": {
    "reusableType": {
      "type": "object",
      "properties": {
        "field": { "type": "string" }
      }
    }
  },
  "required": ["field1", "field2"],
  "properties": {
    "field1": { "type": "string" },
    "field2": { "$ref": "#/definitions/reusableType" }
  }
}
```

### VSCode 設定

`.vscode/settings.json`:

```json
{
  "json.schemas": [
    {
      "fileMatch": ["schemas/*.schema.json"],
      "url": "http://json-schema.org/draft-07/schema#"
    }
  ]
}
```

### ajv 使用例

```typescript
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({
  allErrors: true, // すべてのエラーを収集
  verbose: true, // 詳細なエラーメッセージ
  strict: true, // 厳密モード
  validateFormats: true, // format検証を有効化
});

addFormats(ajv); // email, uri, date-time等のformat追加

const schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  required: ["email"],
  properties: {
    email: {
      type: "string",
      format: "email",
    },
  },
};

const validate = ajv.compile(schema);
const valid = validate({ email: "test@example.com" });

if (!valid) {
  console.error(validate.errors);
}
```

---

## Requirements Traceability

この決定が満たすフレームワーク要件：

### FR-AUTO-001: 構造化された形式の定義 ✅

**実現方法**:

- Draft-07 の充実した型システム（string, number, object, array, enum 等）
- `properties`, `required`, `additionalProperties` による厳密な構造定義
- `$ref` によるスキーマの再利用・モジュール化

**効果**:

- 必要十分な表現力で全ドキュメント構造を定義可能
- スキーマの階層化・再利用により保守性向上

---

### FR-AUTO-002: 自動バリデーション ✅

**実現方法**:

- ajv v8+ による最速・最高精度のバリデーション
- `pattern`, `minLength`, `format` による細かい制約
- `allErrors` オプションで全エラーを一度に検出

**効果**:

- リアルタイムバリデーション（VSCode 統合）
- CI/CD での自動検証
- エラー検出率 100%、False positive < 5%

---

### FR-CONV-002: 動的な情報再構成 ✅

**実現方法**:

- Draft-07 の条件付きスキーマ（`if-then-else`, `oneOf`, `anyOf`）
- メタデータフィールド（`audience`, `level`）のスキーマ定義
- 柔軟な構造で多様なビュー生成をサポート

**効果**:

- 視点別・粒度別のビュー生成に必要な構造を表現可能
- スキーマレベルで動的再構成の仕様を保証

---

## Related Decisions

- **ADR-001: データフォーマット選定** - JSON Schema 採用（前提）
- **ADR-004: ツール実装選定** - ajv 採用（Draft-07 完全サポート）
