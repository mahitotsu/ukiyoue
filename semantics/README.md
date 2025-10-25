# Semantics - JSON-LD Context Definitions

このディレクトリは、Ukiyoue フレームワークのセマンティック定義（JSON-LD context）を格納します。

## 📋 概要

JSON-LD 1.1 を使用して、成果物の意味（semantics）と関係性を形式的に定義します。
これにより、AI エージェントによるセマンティック検索、知識グラフ構築、SPARQL クエリが可能になります。

## 🎯 目的

- **FR-CONV-001**: セマンティック検索の実現
- **FR-REUSE-002**: セマンティック検索と推奨
- **FR-CONV-002**: 動的な情報再構成

## 📁 ディレクトリ構造

```text
semantics/
├── README.md                 # このファイル
├── context/                  # JSON-LD context定義
│   ├── base.jsonld          # 基本vocabulary定義
│   ├── properties.jsonld    # 共通プロパティ定義
│   ├── traceability.jsonld  # トレーサビリティ関係定義
│   ├── artifact-types.jsonld # 成果物タイプ定義（45種類）
│   └── data-dictionary.jsonld # Data Dictionary用語管理定義
└── vocabularies/             # 統合vocabulary
    ├── ukiyoue.jsonld       # Ukiyoue vocabulary統合エントリポイント
    └── data-dictionary.ttl  # Data Dictionary Ontology (OWL/SKOS)
```

## 🔧 技術仕様

### JSON-LD バージョン

- **JSON-LD 1.1** (W3C Recommendation, 2020年7月)
- ADR-003 に基づく選定

### 主要機能

- **Nested Context**: 成果物タイプごとのスコープ管理
- **@protected**: 意図しない context 上書き防止
- **@import**: 外部 context の再利用
- **@json 型**: JSON リテラルの型安全な扱い

## 📖 使用方法

### JSON ドキュメントでの使用

```json
{
  "@context": "https://ukiyoue.example.org/vocabularies/ukiyoue.jsonld",
  "@type": "ProjectCharter",
  "id": "charter-2025-q4",
  "title": "新プロダクト開発プロジェクト",
  "background": "市場ニーズに対応するため...",
  "traceability": {
    "derivedFrom": ["business-case-001"]
  }
}
```

### 個別 Context の使用

特定の context のみを使用する場合：

```json
{
  "@context": [
    "https://ukiyoue.example.org/context/base.jsonld",
    "https://ukiyoue.example.org/context/traceability.jsonld"
  ],
  "@type": "FunctionalRequirements",
  "id": "req-func-001",
  "title": "機能要件定義"
}
```

## 🔗 Context 定義の詳細

### base.jsonld

- Ukiyoue フレームワークの基本 vocabulary
- 外部標準 vocabulary への参照（schema.org, Dublin Core）
- 6 つの成果物レイヤー定義

### properties.jsonld

- 全成果物共通のプロパティ定義
- Dublin Core へのマッピング
- データ型定義（dateTime, string など）

### traceability.jsonld

- ADR-007 のトレーサビリティ関係を形式化
- 6 種類のトレース関係（derivedFrom, satisfies, implements, testedBy, relatedTo, dependsOn）
- IRI 参照と重複排除（@container: "@set"）

### artifact-types.jsonld

- 45 種類の成果物タイプのセマンティック定義
  - **Layer 1 (Business)**: ProjectCharter, Roadmap, RiskRegister, BusinessGoal, UserStory, DataDictionary
  - **Layer 2 (Requirements)**: FunctionalRequirements, NonFunctionalRequirements, UseCase, ConceptualDataModel, TestStrategy
  - **Layer 3 (Design)**: RuntimeArchitecture, ApiArchitecture, DataModel, SecurityArchitecture, etc.
  - **Layer 4-6**: (実装・運用・検証成果物)
- 各タイプごとの nested context
- プロパティの標準 vocabulary へのマッピング
- 新しいトレーサビリティ関係：`relatedBusinessGoals`, `relatedUserStories`

### data-dictionary.jsonld

- Data Dictionary（データ辞書）用語管理のセマンティック定義
- **SKOS (Simple Knowledge Organization System)** ベース：
  - `skos:prefLabel` → `termName`（推奨ラベル）
  - `skos:altLabel` → `synonyms`（別名・同義語）
  - `skos:definition` → `definition`（定義）
  - `skos:related`, `skos:broader`, `skos:narrower` → 用語間関係
- **DCAT (Data Catalog Vocabulary)** 統合：
  - `dcat:Dataset` → Data Dictionary collection
  - `dcat:keyword` → `tags`（タグ付け）
- **PROV (Provenance)** 統合：
  - `prov:wasDerivedFrom` → `termReference`（用語参照のトレーサビリティ）
  - `prov:wasRevisedBy` → `replacedBy`（非推奨用語の置き換え）
- **Domain/Layer 分類**：
  - `domain`: business/system/analytics/infrastructure
  - `layer`: conceptual/logical/physical
- **目的**: RDF エクスポートによるデータカタログ統合（ADR-009 Phase 2）

### ukiyoue.jsonld

- 上記すべての context を統合
- 単一エントリポイントとして使用推奨

### data-dictionary.ttl (Ontology)

- **形式**: RDF/Turtle（OWL 2 + SKOS Core）
- **目的**: Data Dictionary の形式的オントロジー定義
- **主要クラス**:
  - `ukiyoue:DataDictionary` (subclass of `skos:ConceptScheme`, `dcat:Dataset`)
  - `ukiyoue:Term` (subclass of `skos:Concept`)
  - Domain classes: `BusinessDomain`, `SystemDomain`, `AnalyticsDomain`, `InfrastructureDomain`
  - Layer classes: `ConceptualLayer`, `LogicalLayer`, `PhysicalLayer`
- **主要プロパティ**:
  - `ukiyoue:canonicalName`: コード/スキーマでの正規名称
  - `ukiyoue:dataType`: データ型（String, Integer, Date, etc.）
  - `ukiyoue:domain`: 意味的ドメイン
  - `ukiyoue:layer`: 抽象レイヤー
  - `ukiyoue:deprecated`: 非推奨フラグ
  - `ukiyoue:termReference`: 用語参照（トレーサビリティ）
- **SHACL互換**: OWL制約でバリデーションルールを定義
- **用途**:
  - RDF triplestore への Data Dictionary インポート
  - SPARQL クエリによる高度な用語検索
  - データカタログツール（Apache Atlas, AWS Glue等）との統合

## 🛠️ ツール対応

### jsonld.js (推奨)

```bash
bun add jsonld
```

```typescript
import * as jsonld from "jsonld";

// Expand (RDF変換)
const expanded = await jsonld.expand(document);

// Compact (context適用)
const compacted = await jsonld.compact(document, context);

// Frame (特定構造抽出)
const framed = await jsonld.frame(document, frame);
```

### RDF 変換

JSON-LD を RDF トリプルに変換し、SPARQL クエリが可能：

```typescript
import * as jsonld from "jsonld";

const nquads = await jsonld.toRDF(document, { format: "application/n-quads" });
```

## 📚 関連ドキュメント

- [ADR-003: JSON-LD バージョンの選定](../specs/design-decisions/003-json-ld-version.md)
- [ADR-007: JSON 成果物のトレーサビリティ実現方式](../specs/design-decisions/007-json-artifact-traceability.md)
- [JSON-LD 1.1 Specification](https://www.w3.org/TR/json-ld11/)
- [JSON-LD Playground](https://json-ld.org/playground/)

## 🔍 検証方法

### JSON-LD Playground での検証

1. <https://json-ld.org/playground/> を開く
2. JSON-LD context をペースト
3. サンプルドキュメントで動作確認
4. "Expanded" タブで RDF 変換結果を確認

### jsonld.js での検証

```typescript
import * as jsonld from "jsonld";

const document = {
  "@context": "https://ukiyoue.example.org/vocabularies/ukiyoue.jsonld",
  "@type": "ProjectCharter",
  id: "charter-001",
  title: "テストプロジェクト",
};

// 検証
try {
  const expanded = await jsonld.expand(document);
  console.log("✅ Valid JSON-LD 1.1");
} catch (error) {
  console.error("❌ Invalid JSON-LD:", error);
}
```

## ⚠️ 注意事項

### JSON-LD 1.1 準拠

- **重要**: Term definition 内で `rdfs:comment` は使用不可
  - JSON-LD 1.1仕様では、term definition に含められるキーワードが厳密に定義されている
  - `@id`, `@type`, `@container`, `@context`, `@language`, `@direction` 等のみ有効
  - ドキュメント的な情報は別ファイル（README、vocabulary定義等）で管理
- すべてのcontext定義からコメント的な `rdfs:comment` を削除済み（JSON-LD expansion時のエラー回避）

### @protected の使用

- すべての基本 context で `@protected: true` を設定
- 意図しない上書きを防ぐため、慎重に使用

### URL スキーム

- 現在は `https://ukiyoue.example.org/` を使用（開発用）
- 本番環境では実際のドメインに変更すること

### バージョン管理

- Context 定義の変更は破壊的変更となる可能性
- バージョニング戦略を検討（例: `/v1/context/base.jsonld`）

## 🚀 今後の拡張

- [ ] SHACL による制約定義
- [ ] OWL による推論ルール定義
- [ ] JSON-LD Framing テンプレート
- [ ] SPARQL クエリサンプル集
