# ADR-009: データ辞書統合戦略

## Status

**承認済み** (Accepted)

## Context

### Background

Ukiyoue フレームワークでは、プロジェクト全体の用語を一元管理するデータ辞書（Data Dictionary）を定義する。データ辞書は単なる用語集ではなく、以下の役割を果たす必要がある：

1. **用語の一元管理**: プロジェクトライフサイクル全体で使用される用語を定義
2. **用語の整合性保証**: 他の成果物（Data Model、API Spec等）での用語使用を検証
3. **セマンティック統合**: データカタログ（Collibra、Atlan、DataHub等）との連携
4. **AI/LLM 対応**: 知識グラフとしての活用、セマンティック検索の基盤

### Requirements

この決定は、specs/requirements.md で定義された以下のフレームワーク要件に関連する：

| 要件 ID          | 要件名                   | 関連性                                     |
| ---------------- | ------------------------ | ------------------------------------------ |
| **FR-AUTO-002**  | 自動バリデーション       | 🔴 Critical - 用語整合性の自動検証         |
| **FR-REUSE-001** | コンポーネント化         | 🔴 Critical - 用語の再利用と一元管理       |
| **FR-CONV-001**  | セマンティック検索       | 🟡 High - 用語を基にした知識グラフ検索     |
| **FR-REUSE-002** | セマンティック検索と推奨 | 🟡 High - データカタログ統合による推奨機能 |

### Decision Criteria

| 基準                   | 説明                                     | 重要度      |
| ---------------------- | ---------------------------------------- | ----------- |
| **用語整合性の保証**   | 成果物間での用語使用の一貫性を保証       | 🔴 Critical |
| **開発者の負担最小化** | 通常の JSON 編集で完結、特殊知識不要     | 🔴 Critical |
| **検証の高速性**       | 保存時・コミット時に即座にフィードバック | 🔴 Critical |
| **セマンティック対応** | RDF/データカタログ統合が可能             | 🟡 High     |
| **横断的な管理**       | プロジェクトライフサイクル全体で更新     | 🟡 High     |
| **標準技術の活用**     | SKOS、DCAT、PROV 等の標準準拠            | 🟢 Medium   |

## Options

### Option 1: ビジネス用語辞書（Layer 1）+ 技術用語辞書（Layer 2）分割

#### Description

用語をビジネス層と要件層に分割し、それぞれ独立した辞書として管理：

- **Business Glossary (Layer 1)**: ビジネス用語のみ（Order, Customer, Menu）
- **Data Dictionary (Layer 2)**: 技術的な属性定義（Order ID: UUID, 制約等）

#### Pros

- ✅ レイヤー分離が明確
- ✅ ビジネス用語を早期に定義可能

#### Cons

- ❌ **重複管理**: ビジネス用語と技術用語の対応関係を別途管理
- ❌ **検証の複雑化**: 2つの辞書を参照する必要がある
- ❌ **データカタログ統合困難**: 統一ビューの構築が複雑

### Option 2: 単一データ辞書 + domain/layer タグ分類（推奨）

#### Description

単一のデータ辞書で全用語を管理し、`domain`（ビジネス/システム/分析/インフラ）と `layer`（概念/論理/物理）のタグで分類：

```json
{
  "type": "data-dictionary",
  "terms": [
    {
      "id": "TERM-TOS-001",
      "term": "Order",
      "domain": "business",
      "layer": "conceptual",
      "description": "顧客の注文",
      "synonyms": ["注文", "オーダー"]
    },
    {
      "id": "TERM-TOS-002",
      "term": "Order ID",
      "domain": "system",
      "layer": "logical",
      "dataType": "UUID",
      "constraints": { "required": true, "unique": true }
    }
  ]
}
```

#### Pros

- ✅ **単一管理**: すべての用語が1箇所に集約
- ✅ **柔軟な分類**: タグで多次元の分類が可能
- ✅ **検証の簡潔性**: 単一の辞書を参照するだけ
- ✅ **データカタログ統合容易**: DCAT/SKOS 標準に準拠

#### Cons

- ⚠️ **辞書サイズの増大**: 1ファイルに全用語が集まる
- ⚠️ **レイヤー境界の曖昧化**: 厳密なレイヤー分離ではない

### Option 3: 用語参照なし（各成果物が独自に定義）

#### Description

データ辞書を作成せず、各成果物が用語を独自に定義。

#### Pros

- ✅ シンプル（辞書管理不要）

#### Cons

- ❌ **用語の揺らぎ**: 同じ概念に異なる用語が使われる
- ❌ **整合性検証不可**: 型・制約の不一致を検出できない
- ❌ **データカタログ統合不可**: 用語の統一ビューが構築できない

## Decision

**Option 2: 単一データ辞書 + domain/layer タグ分類**を採用する。

### Rationale

Decision Criteria の Critical 項目をすべて満たすのは Option 2：

1. **用語整合性の保証** (Critical)
   - 単一辞書により、用語の重複・矛盾を防止
   - `termReference` による参照で、型・制約の整合性を自動検証

2. **開発者の負担最小化** (Critical)
   - 通常の JSON 編集で完結（JSON-LD の知識不要）
   - `@context` は自動付与、RDF エクスポートはオプション

3. **検証の高速性** (Critical)
   - Reference Validator で単一ドキュメント + 辞書のみ読み込み
   - SHACL のようなプロジェクト全体スキャン不要

4. **セマンティック対応** (High)
   - domain/layer タグを SKOS/DCAT/PROV にマッピング
   - データカタログへのエクスポートが容易

5. **横断的な管理** (High)
   - Risk Register、ADR と同様に、特定の入力依存なし
   - プロジェクトライフサイクル全体で随時更新

### データ辞書の位置づけ

**横断的成果物**（Risk Register、ADR と同様）:

- `inputs: []` - 特定の成果物に依存しない
- プロジェクト全段階で継続的に更新
- 個別用語が複数成果物から参照される

**配置**: Layer 1（ビジネス層）

- **理由**: ビジネス用語（Order, Customer, Menu等）を含むため、ビジネス層に配置
- Layer 1 で定義した用語は、Layer 2（要件層）、Layer 3（設計層）、Layer 4（実装層）すべてで参照される
- `domain`（business/system/analytics/infrastructure）と `layer`（conceptual/logical/physical）タグで、ビジネス用語と技術用語を区別
- 横断的成果物として、プロジェクトライフサイクル全体で継続的に更新

### 用語参照の検証方法

**Reference Validator の拡張**（ADR-008 の多層検証戦略に準拠）:

```typescript
// Stage 2: Reference Validator
// - トレーサビリティ参照（derivedFrom, satisfies）の検証
// - 用語参照（termReference）の検証 ← 新規追加

interface TermReference {
  path: string;
  fieldName: string;
  termId: string;
  dataType?: string;
  constraints?: { required?: boolean; unique?: boolean };
}

async function validateTermReferences(
  data: unknown,
  dataDictionary: DataDictionary
): Promise<ReferenceValidationError[]> {
  // 1. termReference が Data Dictionary に存在するか
  // 2. 型の整合性（field.type === term.dataType）
  // 3. 制約の整合性（field.required === term.constraints.required）
  // 4. 同義語使用の警告（synonym が使われている場合）
}
```

**検証レベル**:

| 成果物                | 検証レベル        | 理由                            |
| --------------------- | ----------------- | ------------------------------- |
| Conceptual Data Model | 🔴 強制（エラー） | エンティティは用語定義必須      |
| Logical Data Model    | 🔴 強制（エラー） | 属性は用語定義必須              |
| API Architecture      | � 推奨（警告）    | API設計原則で用語参照が望ましい |
| Physical Data Model   | 🔴 強制（エラー） | DB カラムは型定義必須           |
| UI/UX Specification   | 🟡 推奨（警告）   | 画面項目は用語参照が望ましい    |
| Use Case/Requirements | 🟢 任意（情報）   | テキスト中の用語一貫性          |

### RDF 統合アプローチ

**開発者は Pure JSON を書く**（ADR-001 の原則を維持）:

```json
{
  "type": "data-dictionary",
  "id": "dict-tos-001",
  "terms": [
    {
      "id": "TERM-TOS-001",
      "term": "Order",
      "domain": "business",
      "layer": "conceptual",
      "synonyms": ["注文", "オーダー"]
    }
  ]
}
```

**フレームワークが @context を自動付与**:

```typescript
// Validation 時に自動で JSON-LD Context を付与
const withContext = {
  "@context": [
    "https://ukiyoue.example.org/context/base.jsonld",
    "https://ukiyoue.example.org/context/data-dictionary.jsonld",
  ],
  ...data,
};

// JSON-LD として展開・検証
const expanded = await jsonld.expand(withContext);
```

**RDF エクスポートはオプション**:

```bash
# データカタログ連携時のみ使用
bun run export-rdf dict-tos-001.json --format turtle

# Collibra/Atlan/DataHub へのインポート
collibra-cli import dict.ttl --type glossary
```

### JSON-LD Context マッピング

```json
{
  "@context": {
    "@version": 1.1,
    "@vocab": "https://ukiyoue.example.org/vocab#",
    "@protected": true,

    "skos": "http://www.w3.org/2004/02/skos/core#",
    "dcat": "http://www.w3.org/ns/dcat#",
    "prov": "http://www.w3.org/ns/prov#",

    "domain": {
      "@id": "domain",
      "@type": "@vocab",
      "@context": {
        "business": "BusinessDomain",
        "system": "SystemDomain",
        "analytics": "AnalyticsDomain",
        "infrastructure": "InfrastructureDomain"
      }
    },

    "layer": {
      "@id": "layer",
      "@type": "@vocab",
      "@context": {
        "conceptual": "ConceptualLayer",
        "logical": "LogicalLayer",
        "physical": "PhysicalLayer"
      }
    },

    "synonyms": {
      "@id": "skos:altLabel",
      "@container": "@language"
    },

    "termReference": {
      "@id": "prov:wasDerivedFrom",
      "@type": "@id"
    }
  }
}
```

## Consequences

### Positive

1. **用語の一元管理**
   - プロジェクト全体の用語が単一の辞書に集約
   - 用語の重複・矛盾を防止

2. **自動検証による品質保証**
   - Reference Validator で型・制約の整合性を自動検証
   - 同義語使用の警告、非推奨用語の検出

3. **開発者の負担最小化**
   - Pure JSON を書くだけ（JSON-LD、RDF の知識不要）
   - VS Code の補完機能で編集支援

4. **データカタログ統合**
   - SKOS/DCAT/PROV 準拠で Collibra、Atlan、DataHub と連携
   - RDF エクスポートで知識グラフ構築

5. **AI/LLM 対応**
   - セマンティック検索の基盤
   - 知識グラフによる自動推奨・影響分析

### Negative

1. **辞書サイズの増大**
   - 全用語が1ファイルに集約されるため、大規模プロジェクトでは数百～数千の用語
   - 緩和策: 用語のグルーピング、検索機能の提供

2. **レイヤー境界の曖昧化**
   - Layer 1/2/3 の厳密な分離ではなく、タグによる柔軟な分類
   - 緩和策: domain/layer タグによる明示的な分類ルールの策定

3. **学習コスト**
   - domain/layer の分類基準を理解する必要がある
   - 緩和策: テンプレート提供、Example の充実

### Risks

- ⚠️ **辞書のメンテナンス負荷**: 用語の追加・更新時に影響範囲が大きい
- ⚠️ **初期構築コスト**: 既存用語の洗い出しと分類に時間がかかる
- ⚠️ **ツール開発負荷**: Reference Validator の拡張、RDF エクスポート機能の実装

### Mitigation

- 💡 **段階的導入**: まず重要な用語のみ登録し、徐々に拡充
- 💡 **テンプレート提供**: domain/layer 別のテンプレートを用意
- 💡 **Example 充実**: Table Order System での実践例を提供
- 💡 **ツール支援**: VS Code 拡張での用語補完、自動 RDF エクスポート

## Prerequisites

- **ADR-001**: JSON + JSON Schema + JSON-LD の採用
- **ADR-002**: JSON Schema Draft-07 の選定
- **ADR-003**: JSON-LD 1.1 の選定
- **ADR-007**: JSON 成果物のトレーサビリティ管理
- **ADR-008**: 多層検証戦略（Reference Validator の役割定義）

## Related Decisions

- **ADR-010** (未来): Data Catalog Export 戦略（Collibra、Atlan、DataHub へのエクスポート詳細）
- **ADR-011** (未来): Terminology Evolution Strategy（用語のバージョン管理、非推奨化ポリシー）

## Implementation Notes

### Phase 1: 基本機能（現在）

1. ✅ Data Dictionary Schema 拡張（domain, layer, synonyms, canonicalName）
2. ✅ 用語参照フィールド追加（termReference）
3. ✅ Reference Validator 拡張（用語参照検証）
4. ✅ artifact-input-rules.json 更新（terminologyRules）
5. ✅ artifact-definitions.md 更新（横断的成果物としての位置づけ）

### Phase 2: RDF 統合

1. ⏳ JSON-LD Context 拡張（data-dictionary.jsonld）
2. ⏳ Data Dictionary Ontology 作成（data-dictionary.ttl）
3. ⏳ RDF Export ツール実装（export-rdf.ts）

### Phase 3: データカタログ連携（将来）

1. 🔮 Collibra エクスポート機能
2. 🔮 Atlan エクスポート機能
3. 🔮 DataHub エクスポート機能
4. 🔮 SPARQL エンドポイント（オプション）

## References

- W3C SKOS (Simple Knowledge Organization System): <https://www.w3.org/2004/02/skos/>
- W3C DCAT (Data Catalog Vocabulary): <https://www.w3.org/TR/vocab-dcat-3/>
- W3C PROV (Provenance Ontology): <https://www.w3.org/TR/prov-o/>
- Collibra Documentation: <https://productresources.collibra.com/>
- DataHub Documentation: <https://datahubproject.io/docs/>
