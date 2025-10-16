# ADR-003: JSON-LD バージョンの選定

## Status

**承認済み** (Accepted)

## Context

JSON-LD には 2 つのメジャーバージョンが存在する：

- **JSON-LD 1.0** (2014 年) - W3C Recommendation
- **JSON-LD 1.1** (2020 年) - W3C Recommendation（最新）

**前提**: ADR-001 で、JSON-LD をセマンティック定義に使用することが決定している。

どのバージョンを採用するかは、機能性、ツールサポート、将来性に影響する。

### 満たすべき要件（specs/requirements.md より）

この決定は、以下のフレームワーク要件に直接影響する：

| 要件 ID          | 要件名                   | 関連性                             |
| ---------------- | ------------------------ | ---------------------------------- |
| **FR-CONV-001**  | セマンティック検索の実現 | 🔴 Critical - 意味定義の表現力     |
| **FR-REUSE-002** | セマンティック検索と推奨 | 🔴 Critical - 関係性定義の柔軟性   |
| **FR-CONV-002**  | 動的な情報再構成         | 🟡 High - コンテキスト定義の柔軟性 |

JSON-LD バージョンは、AI エージェントによる意味理解、セマンティック検索、関係性推論の精度に直結する。

## Decision Drivers

### 1. JSON-LD 1.0 (2014)

**基本構造**:

```json
{
  "@context": {
    "name": "http://schema.org/name",
    "homepage": {
      "@id": "http://schema.org/url",
      "@type": "@id"
    }
  },
  "@id": "https://example.com/person/alice",
  "@type": "Person",
  "name": "Alice",
  "homepage": "https://alice.example.com"
}
```

**評価**:
| 項目 | スコア | 説明 |
|------|--------|------|
| ツールサポート | ⭐⭐⭐⭐⭐ | 最も広くサポート |
| 機能性 | ⭐⭐⭐⭐ | 基本機能は充実 |
| 成熟度 | ⭐⭐⭐⭐⭐ | 非常に安定 |
| 将来性 | ⭐⭐⭐ | 古いバージョン |

**サポート状況**:

- ✅ jsonld.js: 完全サポート
- ✅ PyLD: 完全サポート
- ✅ RDF 生態系: 完全対応
- ✅ すべての主要ツール対応

**長所**:

- 最も広く採用されている
- 安定性が高い
- ツール・ライブラリが豊富
- ドキュメントが充実

**短所**:

- 古い仕様（2014 年）
- 新機能がない
- 制限がある（nested context 等）

---

### 2. JSON-LD 1.1 (2020) 最新

**新機能の例**:

#### Nested Contexts

```json
{
  "@context": {
    "@version": 1.1,
    "name": "http://schema.org/name",
    "address": {
      "@id": "http://schema.org/address",
      "@context": {
        "street": "http://schema.org/streetAddress",
        "city": "http://schema.org/addressLocality"
      }
    }
  },
  "name": "Alice",
  "address": {
    "street": "123 Main St",
    "city": "Anytown"
  }
}
```

#### Protected Term Definitions

```json
{
  "@context": {
    "@version": 1.1,
    "@protected": true,
    "name": "http://schema.org/name"
  }
}
```

#### @import

```json
{
  "@context": {
    "@version": 1.1,
    "@import": "https://example.com/contexts/base.jsonld",
    "customField": "https://example.com/vocab#customField"
  }
}
```

#### @json and @none Types

```json
{
  "@context": {
    "@version": 1.1,
    "metadata": {
      "@id": "https://example.com/metadata",
      "@type": "@json"
    }
  },
  "metadata": {
    "arbitrary": "json",
    "structure": [1, 2, 3]
  }
}
```

**主な新機能**:

- **Nested contexts**: コンテキストのネスト対応
- **@protected**: 用語定義の保護
- **@import**: 外部コンテキストのインポート
- **@json/@none types**: JSON 値の直接埋め込み
- **@container: @graph**: グラフコンテナ
- **@direction**: テキストの方向性
- **@prefix**: より柔軟なプレフィックス定義

**評価**:
| 項目 | スコア | 説明 |
|------|--------|------|
| ツールサポート | ⭐⭐⭐⭐⭐ | 主要ツール対応済み |
| 機能性 | ⭐⭐⭐⭐⭐ | 大幅に機能強化 |
| 成熟度 | ⭐⭐⭐⭐ | 安定している（2020 年勧告） |
| 将来性 | ⭐⭐⭐⭐⭐ | 最新標準 |

**サポート状況**:

- ✅ jsonld.js: 完全サポート（v5.0+）
- ✅ PyLD: 完全サポート（v2.0+）
- ✅ RDF 生態系: 対応済み
- ✅ 主要ツール対応完了

**長所**:

- W3C 最新勧告（2020 年）
- 強力な新機能
- 後方互換性あり（1.0 も解釈可能）
- 複雑な構造に対応
- セキュリティ強化（@protected）

**短所**:

- 1.0 より若干複雑
- 一部古いツールは未対応

---

## 比較マトリクス

| 項目               | JSON-LD 1.0 | JSON-LD 1.1 |
| ------------------ | ----------- | ----------- |
| **ツールサポート** | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐  |
| **機能性**         | ⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐  |
| **成熟度**         | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐    |
| **将来性**         | ⭐⭐⭐      | ⭐⭐⭐⭐⭐  |
| **Nested Context** | ❌          | ✅          |
| **@protected**     | ❌          | ✅          |
| **@import**        | ❌          | ✅          |
| **@json/@none**    | ❌          | ✅          |
| **後方互換**       | -           | ✅          |
| **学習コスト**     | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐    |
| **Total**          | **33/40**   | **38/40**   |

---

## Decision

### ✅ 採用: **JSON-LD 1.1**

```json
{
  "@context": {
    "@version": 1.1,
    "@vocab": "http://schema.org/",
    "@base": "https://ukiyoue.dev/",
    "ukiyoue": "https://ukiyoue.dev/vocab#",

    "Document": "ukiyoue:Document",
    "TechnicalSpecification": {
      "@id": "ukiyoue:TechnicalSpecification",
      "@type": "@id"
    },

    "dependsOn": {
      "@id": "ukiyoue:dependsOn",
      "@type": "@id",
      "@container": "@set"
    },

    "metadata": {
      "@id": "ukiyoue:metadata",
      "@context": {
        "@protected": true,
        "type": "@type",
        "title": "http://schema.org/name",
        "version": "http://schema.org/version",
        "created": {
          "@id": "http://schema.org/dateCreated",
          "@type": "http://www.w3.org/2001/XMLSchema#dateTime"
        }
      }
    },

    "content": {
      "@id": "ukiyoue:content",
      "@type": "@json"
    }
  }
}
```

### 理由

1. **W3C 最新勧告**
   - 2020 年に W3C Recommendation に昇格
   - 現在の標準バージョン
   - 今後の開発はこれに基づく

2. **強力な新機能**

   **Nested Contexts**で階層的定義:

   ```json
   {
     "@context": {
       "metadata": {
         "@context": {
           "@protected": true,
           "title": "http://schema.org/name"
         }
       }
     }
   }
   ```

   **@protected**でセキュリティ強化:

   ```json
   {
     "@context": {
       "@protected": true,
       "sensitiveField": "https://example.com/sensitive"
     }
   }
   ```

   **@json**で任意の JSON 埋め込み:

   ```json
   {
     "@context": {
       "content": { "@type": "@json" }
     },
     "content": {
       "arbitrary": "structure",
       "with": ["any", "json"]
     }
   }
   ```

3. **Ukiyoue の要件に最適**

   | 要件                   | JSON-LD 1.1 の利点         |
   | ---------------------- | -------------------------- |
   | **構造化ドキュメント** | Nested context で階層表現  |
   | **セキュリティ**       | @protected で用語保護      |
   | **柔軟性**             | @json で任意の JSON        |
   | **再利用**             | @import でコンテキスト共有 |

4. **ツールサポート完備**
   - jsonld.js v5.0+: 完全対応
   - PyLD v2.0+: 完全対応
   - RDF libraries: 対応済み
   - すべての主要ツールが対応完了（2020 年以降）

5. **後方互換性**
   - JSON-LD 1.0 も解釈可能
   - `@version: 1.1`で明示的にバージョン指定
   - 段階的移行が可能

6. **将来性**
   - 最新標準
   - セマンティック Web の今後の発展に対応
   - W3C の今後の開発はこれに基づく

---

## Consequences

### Positive

- ✅ W3C 最新勧告
- ✅ 強力な新機能（nested, @protected, @import, @json）
- ✅ 階層的なコンテキスト定義
- ✅ セキュリティ強化
- ✅ 柔軟性の向上
- ✅ 後方互換性あり
- ✅ 主要ツール対応完了
- ✅ 将来性が高い

### Negative

- ⚠️ 1.0 より若干複雑
- ⚠️ 新機能の学習コスト

### Mitigation

- **複雑性への対応**:
  - 基本的な使い方は 1.0 と同じ
  - 必要な機能のみ段階的に導入
  - ドキュメント・サンプルを充実
- **学習コスト**:
  - 1.0 の知識があれば容易に移行可能
  - 新機能は任意（必要に応じて使用）
  - チュートリアルを提供

---

## Implementation Examples

### 基本的なコンテキスト

```json
{
  "@context": {
    "@version": 1.1,
    "@vocab": "http://schema.org/",
    "ukiyoue": "https://ukiyoue.dev/vocab#",

    "Document": "ukiyoue:Document",
    "author": "http://schema.org/author",
    "created": {
      "@id": "http://schema.org/dateCreated",
      "@type": "http://www.w3.org/2001/XMLSchema#dateTime"
    }
  }
}
```

### Nested Context の活用

```json
{
  "@context": {
    "@version": 1.1,
    "ukiyoue": "https://ukiyoue.dev/vocab#",

    "metadata": {
      "@id": "ukiyoue:metadata",
      "@context": {
        "@protected": true,
        "type": "@type",
        "title": "http://schema.org/name",
        "version": "http://schema.org/version"
      }
    },

    "content": {
      "@id": "ukiyoue:content",
      "@context": {
        "requirements": {
          "@id": "ukiyoue:requirements",
          "@container": "@list"
        }
      }
    }
  }
}
```

### @import の活用

**base-context.jsonld**:

```json
{
  "@context": {
    "@version": 1.1,
    "@protected": true,
    "@vocab": "http://schema.org/",
    "ukiyoue": "https://ukiyoue.dev/vocab#"
  }
}
```

**technical-spec-context.jsonld**:

```json
{
  "@context": {
    "@version": 1.1,
    "@import": "https://ukiyoue.dev/contexts/base-context.jsonld",

    "TechnicalSpecification": "ukiyoue:TechnicalSpecification",
    "requirements": {
      "@id": "ukiyoue:requirements",
      "@container": "@list"
    }
  }
}
```

### @json の活用（任意の JSON 構造）

```json
{
  "@context": {
    "@version": 1.1,
    "content": {
      "@id": "https://ukiyoue.dev/vocab#content",
      "@type": "@json"
    }
  },
  "@id": "https://example.com/doc/123",
  "content": {
    "overview": "Any text...",
    "requirements": [
      {"id": "REQ-001", "description": "..."}
    ],
    "api": {
      "endpoints": [...]
    }
  }
}
```

### @protected の活用（用語保護）

```json
{
  "@context": {
    "@version": 1.1,
    "@protected": true,

    "Document": "https://ukiyoue.dev/vocab#Document",
    "metadata": "https://ukiyoue.dev/vocab#metadata",
    "content": "https://ukiyoue.dev/vocab#content"
  }
}
```

---

## jsonld.js Usage

```typescript
import * as jsonld from "jsonld";

// JSON-LD 1.1のドキュメント
const doc = {
  "@context": {
    "@version": 1.1,
    name: "http://schema.org/name",
  },
  "@id": "https://example.com/alice",
  name: "Alice",
};

// Expand（展開）
const expanded = await jsonld.expand(doc);

// Compact（コンパクト化）
const compacted = await jsonld.compact(doc, context);

// Frame（フレーム化）
const framed = await jsonld.frame(doc, frame);

// Normalize（正規化 - RDF Datasetへ変換）
const normalized = await jsonld.normalize(doc, {
  algorithm: "URDNA2015",
  format: "application/n-quads",
});
```

---

## Requirements Traceability

この決定が満たすフレームワーク要件：

### FR-CONV-001: セマンティック検索の実現 ✅

**実現方法**:

- JSON-LD 1.1 の `@context` による語彙定義
- `@type` による概念の明示的な分類
- `@id` による一意識別子、リンク可能データ
- nested context による階層的な意味定義

**効果**:

- AI エージェントが「認証」「API」等の概念を正確に理解
- 語彙の曖昧性を排除、検索精度向上（目標: 適合率 > 90%）
- RDF 変換による SPARQL 検索も可能

---

### FR-REUSE-002: セマンティック検索と推奨 ✅

**実現方法**:

- 関係性の明示的定義（`relatedTo`, `usedWith`, `similarTo`）
- JSON-LD 1.1 の `@graph` による複数エンティティの関連付け
- `@import` によるコンテキストの再利用・拡張

**効果**:

- コンポーネント間の関係を機械可読に表現
- 「このパターンを使うなら、あのパターンも推奨」の推論が可能
- 推奨エンジンの精度向上（目標: 適合率 > 80%）

---

### FR-CONV-002: 動的な情報再構成 ✅

**実現方法**:

- 柔軟なコンテキスト定義による多視点表現
- `@json` による任意 JSON 構造のサポート
- `@protected` による意味的一貫性の保護

**効果**:

- 同一データを異なる視点（開発者/PM/ステークホルダー）で解釈可能
- コンテキストの切り替えによる動的ビュー生成
- 意味の一貫性を保ちながら柔軟な再構成を実現

---

## Related Decisions

- **ADR-001: データフォーマット選定** - JSON-LD 採用（前提）
- **ADR-002: JSON Schema Draft 版選定** - Draft-07 採用
- **ADR-004: ツール実装選定** - jsonld.js 採用（JSON-LD 1.1 完全サポート）

---

## References

- [JSON-LD 1.1 Specification](https://www.w3.org/TR/json-ld11/)
- [JSON-LD 1.1 Processing Algorithms](https://www.w3.org/TR/json-ld11-api/)
- [JSON-LD 1.1 Framing](https://www.w3.org/TR/json-ld11-framing/)
- [jsonld.js Documentation](https://github.com/digitalbazaar/jsonld.js)
