# ADR-003: Semantic Definition Method

## Status

Accepted

## Context

Ukiyoue Frameworkでは、ドキュメントの**意味**と**関係性**を形式的に定義する必要があります。これにより、AIが文脈を理解して動的に情報を再構成し、対話可能性（Conversational）を実現します。

**要求事項**:

- ✅ 用語の意味を形式的に定義
- ✅ ドキュメント間の関係性を表現（依存、関連、派生等）
- ✅ 外部語彙（schema.org, Dublin Core等）との連携
- ✅ 機械可読・推論可能な形式
- ✅ JSON形式と統合可能（ADR-001）
- ✅ W3C標準準拠
- ✅ Linked Data対応
- ✅ グラフ構造の表現
- ✅ セマンティック検索の基盤

**制約条件**:

- ADR-001でJSON形式を採用済み → JSON互換の手法が必要
- ADR-002でJSON Schemaを採用 → 併用可能な手法が必要
- AIが理解・生成可能な形式
- 標準的なRDF/Linked Dataエコシステムとの統合

## Decision

**JSON-LD 1.1** を採用します。

## Options Considered

### Option A: JSON-LD 1.1 (提案)

**概要**: W3C標準のJSON形式でLinked Dataを表現する仕様

**Pros**:

- ✅ W3C勧告（2020年）で標準化済み
- ✅ JSON完全互換（既存JSONにコンテキストを追加するだけ）
- ✅ RDFへの変換可能（セマンティックWeb技術と統合）
- ✅ 外部語彙との連携が容易（schema.org, Dublin Core等）
- ✅ `@context`による用語定義の一元管理
- ✅ `@id`, `@type`によるリソース識別
- ✅ グラフ構造の自然な表現
- ✅ 広範なツールサポート（jsonld.js, PyLD等）
- ✅ JSON Schemaと併用可能
- ✅ 人間可読（JSONそのもの）

**Cons**:

- ⚠️ 学習コスト（RDF概念の理解が必要）
- ⚠️ コンテキストファイルの管理が必要

**実装例**:

```json
{
  "@context": {
    "@vocab": "https://ukiyoue.dev/vocab#",
    "schema": "https://schema.org/",
    "dc": "http://purl.org/dc/terms/",

    "Document": "schema:CreativeWork",
    "title": "dc:title",
    "description": "dc:description",
    "author": {
      "@id": "dc:creator",
      "@type": "@id"
    },
    "dependsOn": {
      "@id": "schema:isBasedOn",
      "@type": "@id"
    }
  },
  "@type": "Document",
  "@id": "https://example.com/docs/req-001",
  "title": "ユーザー認証機能",
  "description": "ユーザーがメールアドレスとパスワードでログインできる",
  "author": "https://example.com/users/alice",
  "dependsOn": ["https://example.com/docs/design-001"]
}
```

### Option B: RDF/XML

**概要**: W3C標準のRDF表現形式（XML）

**Pros**:

- ✅ RDFのオリジナル形式
- ✅ W3C標準

**Cons**:

- ❌ XMLの冗長性（人間可読性が低い）
- ❌ JSON形式との統合が困難（ADR-001と不整合）
- ❌ AI生成に不向き（構文が複雑）
- ❌ 開発者体験が悪い

### Option C: Turtle (RDF)

**概要**: 人間可読なRDF表現形式

**Pros**:

- ✅ 人間可読性が高い
- ✅ 簡潔な構文

**Cons**:

- ❌ JSON形式との統合が困難（ADR-001と不整合）
- ❌ JSON Schemaとの併用が不可
- ❌ 別ファイルでの管理が必要（ドキュメント本体と分離）
- ❌ AIがJSONとTurtleを別々に生成する必要がある

### Option D: Microdata (HTML埋め込み)

**概要**: HTML内にセマンティック情報を埋め込む仕様

**Pros**:

- ✅ HTMLに直接埋め込み可能

**Cons**:

- ❌ HTML前提（JSON形式と不整合）
- ❌ 構造化データの管理に不向き
- ❌ プロジェクトドキュメントには過剰

### Option E: Custom Semantic Schema (独自定義)

**概要**: プロジェクト独自のセマンティック定義

**Pros**:

- ✅ 完全なカスタマイズ性
- ✅ プロジェクト特化

**Cons**:

- ❌ 標準がなく、相互運用性ゼロ
- ❌ 外部語彙との連携不可
- ❌ ツールサポートなし
- ❌ 開発・メンテナンスコスト膨大
- ❌ Linked Dataエコシステムと隔絶

### Option F: GraphQL Schema

**概要**: GraphQLのスキーマ定義

**Pros**:

- ✅ 型システムが強力
- ✅ APIクエリに最適

**Cons**:

- ❌ API用途に特化（ドキュメント管理には過剰）
- ❌ セマンティック推論が不可
- ❌ Linked Dataエコシステムとの統合不可
- ❌ ドキュメント形式ではない

## Comparison Matrix

| 評価基準                       | 重み | JSON-LD | RDF/XML | Turtle | Microdata | Custom | GraphQL |
| ------------------------------ | ---- | ------- | ------- | ------ | --------- | ------ | ------- |
| **W3C標準準拠**                | 5    | 5       | 5       | 5      | 4         | 0      | 3       |
| **JSON統合性**                 | 5    | 5       | 1       | 1      | 0         | 4      | 2       |
| **RDF/Linked Data互換**        | 5    | 5       | 5       | 5      | 3         | 0      | 0       |
| **外部語彙連携**               | 4    | 5       | 5       | 5      | 3         | 0      | 1       |
| **人間可読性**                 | 3    | 5       | 2       | 5      | 3         | 4      | 4       |
| **AI生成可能性**               | 4    | 5       | 2       | 3      | 2         | 4      | 4       |
| **JSON Schema併用**            | 4    | 5       | 1       | 1      | 0         | 3      | 2       |
| **ツールエコシステム**         | 3    | 5       | 4       | 4      | 3         | 0      | 5       |
| **学習コスト（低いほど良い）** | 2    | 3       | 2       | 3      | 4         | 2      | 4       |
| **セマンティック推論**         | 4    | 5       | 5       | 5      | 2         | 0      | 1       |
| **合計**                       | 39   | **189** | 142     | 156    | 99        | 68     | 103     |
| **正規化スコア（/30）**        | -    | **29**  | 21.8    | 24     | 15.2      | 10     | 15.8    |

**重み付け理由**:

- **W3C標準準拠（5）**: 相互運用性とエコシステム統合の基盤
- **JSON統合性（5）**: ADR-001との整合性が必須
- **RDF/Linked Data互換（5）**: セマンティックWeb技術の活用に必須
- **外部語彙連携（4）**: schema.org等との統合により知識の再利用性向上
- **人間可読性（3）**: 重要だがAI支援で補完可能
- **AI生成可能性（4）**: AIによる高速生成に影響
- **JSON Schema併用（4）**: ADR-002との整合性
- **ツールエコシステム（3）**: 開発効率と保守性に影響
- **学習コスト（2）**: 重要だが、ドキュメントで軽減可能
- **セマンティック推論（4）**: 対話可能性の実現に重要

## Consequences

### Positive

- ✅ **JSON完全互換**: ADR-001, ADR-002と完全に整合
- ✅ **標準準拠**: W3C勧告により長期的な保守性確保
- ✅ **セマンティック推論**: RDF変換によりSPARQLクエリ・推論が可能
- ✅ **外部語彙統合**: schema.org, Dublin Core等との連携
- ✅ **グラフ構造**: ドキュメント間の関係性を自然に表現
- ✅ **AI可読性**: JSONなのでAIが容易に理解・生成
- ✅ **エコシステム**: jsonld.js等の高品質ライブラリ利用可能

### Negative

- ⚠️ **学習コスト**: RDF概念の理解が必要
- ⚠️ **コンテキスト管理**: `@context`ファイルの適切な管理が必要
- ⚠️ **処理オーバーヘッド**: RDF変換時に若干のオーバーヘッド

### Mitigation

- **学習コスト軽減**:
  - 標準コンテキストファイルを提供
  - ベストプラクティスガイドを作成
  - 一般的なユースケースはテンプレート化
- **コンテキスト管理**:
  - バージョニング（`https://ukiyoue.dev/context/v1`）
  - Git管理による変更履歴追跡
  - 後方互換性の維持
- **パフォーマンス**:
  - RDF変換のキャッシュ
  - 必要時のみ変換（遅延評価）
  - インデックス化による高速検索

## Implementation Notes

### コンテキストファイル構造

```text
semantics/
├── context.jsonld              # メインコンテキスト
├── contexts/
│   ├── document.jsonld         # ドキュメント用語
│   ├── requirement.jsonld      # 要件用語
│   ├── api-spec.jsonld         # API仕様用語
│   └── test-case.jsonld        # テストケース用語
└── vocab/
    └── ukiyoue.ttl             # Ukiyoue独自語彙定義
```

### メインコンテキスト

```json
{
  "@context": {
    "@version": 1.1,
    "@vocab": "https://ukiyoue.dev/vocab#",

    "schema": "https://schema.org/",
    "dc": "http://purl.org/dc/terms/",
    "foaf": "http://xmlns.com/foaf/0.1/",

    "Document": "schema:CreativeWork",
    "title": "dc:title",
    "description": "dc:description",
    "created": {
      "@id": "dc:created",
      "@type": "http://www.w3.org/2001/XMLSchema#dateTime"
    },
    "modified": {
      "@id": "dc:modified",
      "@type": "http://www.w3.org/2001/XMLSchema#dateTime"
    },
    "author": {
      "@id": "dc:creator",
      "@type": "@id"
    },
    "dependsOn": {
      "@id": "schema:isBasedOn",
      "@type": "@id",
      "@container": "@set"
    },
    "relatedTo": {
      "@id": "schema:relatedLink",
      "@type": "@id",
      "@container": "@set"
    }
  }
}
```

### TypeScript統合

```typescript
import * as jsonld from "jsonld";

// JSON-LDを拡張（展開）
const expanded = await jsonld.expand(document);

// RDFに変換
const nquads = await jsonld.toRDF(document, { format: "application/n-quads" });

// 圧縮（特定のコンテキストで）
const compacted = await jsonld.compact(document, context);
```

### セマンティック検索

```typescript
// SPARQL クエリ例
const query = `
  PREFIX ukiyoue: <https://ukiyoue.dev/vocab#>
  PREFIX dc: <http://purl.org/dc/terms/>

  SELECT ?doc ?title
  WHERE {
    ?doc a ukiyoue:Requirement ;
         dc:title ?title ;
         ukiyoue:dependsOn ?dep .
    ?dep dc:title "ユーザー認証機能" .
  }
`;
```

### バージョニング戦略

- **コンテキストURL**: `https://ukiyoue.dev/context/v1`
- **破壊的変更**: メジャーバージョンアップ（v1 → v2）
- **後方互換追加**: マイナーバージョン（v1.1, v1.2）
- **`@version`フィールド**: JSON-LD 1.1機能の明示

## Related

- **ADR-001**: Document Format - JSON形式を採用（JSON-LD完全互換）
- **ADR-002**: Structure Validation - JSON Schemaと併用可能
- **ADR-006**: Semantic Integrity Validation - SHACLによるセマンティック検証
- **ADR-011**: JSON-LD Library - jsonld.js選定
