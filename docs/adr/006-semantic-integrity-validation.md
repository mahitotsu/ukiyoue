# ADR-006: Semantic Integrity Validation

## Status

Accepted

## Context

ADR-002でJSON Schemaによる構造検証、ADR-003でJSON-LDによるセマンティック定義を採用しました。次に、セマンティックレベルの整合性（意味的な制約）を検証する仕組みが必要です。

**具体例**:

- 構造検証（JSON Schema）: 「`dependsOn`フィールドは配列型で、各要素は文字列」
- **セマンティック検証（必要）**: 「`dependsOn`で参照されたドキュメントIDが実際に存在する」

**要求事項**:

- ✅ RDFグラフレベルの制約定義
- ✅ 関係性の整合性検証（リンク先の存在確認等）
- ✅ カーディナリティ制約（1対多、多対多等）
- ✅ 値の範囲制約（数値範囲、列挙値等）
- ✅ W3C標準準拠
- ✅ JSON-LDとの統合（ADR-003）
- ✅ プログラマティックな検証
- ✅ 詳細なエラーレポート
- ✅ 拡張可能な制約定義

**制約条件**:

- JSON-LD 1.1ベース（ADR-003）
- TypeScript/Bun環境で動作（ADR-008, ADR-009）
- RDFエコシステムとの統合

## Decision

**SHACL (Shapes Constraint Language)** を採用します。

## Options Considered

### Option A: SHACL (Shapes Constraint Language) (提案)

**概要**: W3C勧告のRDFグラフ制約検証言語

**Pros**:

- ✅ W3C勧告（2017年）で標準化済み
- ✅ RDFグラフに対する制約を宣言的に定義
- ✅ JSON-LDとシームレスに統合
- ✅ 豊富な制約タイプ
  - プロパティ制約（sh:property）
  - クラス制約（sh:targetClass）
  - カーディナリティ（sh:minCount, sh:maxCount）
  - 値の範囲（sh:minInclusive, sh:maxInclusive）
  - 型制約（sh:datatype, sh:class）
  - パターン（sh:pattern）
  - ロジカル制約（sh:and, sh:or, sh:not）
- ✅ 詳細なバリデーションレポート
- ✅ SPARQLクエリによるカスタム制約（sh:sparql）
- ✅ JavaScriptライブラリ（rdf-validate-shacl）
- ✅ Turtle/RDF形式で記述（人間可読）
- ✅ 再利用可能な形状定義（sh:node）

**Cons**:

- ⚠️ RDF/Turtle記法の学習コスト
- ⚠️ JavaScriptエコシステムではマイナー

**実装例**:

```turtle
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix ukiyoue: <https://ukiyoue.dev/vocab#> .

ukiyoue:DocumentShape
  a sh:NodeShape ;
  sh:targetClass ukiyoue:Document ;
  sh:property [
    sh:path ukiyoue:dependsOn ;
    sh:nodeKind sh:IRI ;
    sh:message "依存関係は有効なIRIである必要があります" ;
  ] ;
  sh:property [
    sh:path ukiyoue:title ;
    sh:datatype xsd:string ;
    sh:minLength 1 ;
    sh:maxLength 200 ;
    sh:message "タイトルは1〜200文字である必要があります" ;
  ] .

ukiyoue:RequirementShape
  a sh:NodeShape ;
  sh:targetClass ukiyoue:Requirement ;
  sh:property [
    sh:path ukiyoue:testCases ;
    sh:minCount 1 ;
    sh:message "要件には少なくとも1つのテストケースが必要です" ;
  ] .
```

### Option B: ShEx (Shape Expressions)

**概要**: W3C提案中のRDFスキーマ言語

**Pros**:

- ✅ コンパクトな構文
- ✅ RDFグラフ検証

**Cons**:

- ❌ W3C勧告ではない（Draft段階）
- ❌ SHACLより採用実績が少ない
- ❌ JavaScriptライブラリが限定的
- ❌ JSONとの統合がSHACLより弱い
- ❌ ツールサポートが不足

### Option C: OWL (Web Ontology Language)

**概要**: W3C標準のオントロジー定義言語

**Pros**:

- ✅ W3C勧告
- ✅ 強力な推論機能
- ✅ セマンティックWeb技術の中核

**Cons**:

- ❌ 検証用途には過剰（推論が主目的）
- ❌ 複雑すぎる（学習コストが高い）
- ❌ パフォーマンスが悪い（推論エンジンが重い）
- ❌ JavaScriptライブラリが限定的
- ❌ Ukiyoueの要求には不適合

### Option D: Custom Semantic Rules (YAML/JSON)

**概要**: プロジェクト独自のセマンティックルール定義

**Pros**:

- ✅ プロジェクト特化
- ✅ YAML/JSONで記述可能

**Cons**:

- ❌ 標準がなく、相互運用性ゼロ
- ❌ RDFエコシステムと隔絶
- ❌ 推論機能がない
- ❌ 開発・メンテナンスコスト膨大
- ❌ SHACLが存在する今、選択肢にならない

### Option E: JSON Schema only (セマンティック検証なし)

**概要**: JSON Schemaのみで全てを検証

**Pros**:

- ✅ 追加ツール不要
- ✅ シンプル

**Cons**:

- ❌ セマンティックな制約を表現できない
  - 例: リンク先の存在確認は不可能
- ❌ RDFグラフの検証不可
- ❌ ADR-003のセマンティック定義が活かせない
- ❌ 対話可能性（Conversational）が実現できない

### Option F: No Semantic Validation

**概要**: セマンティック検証を行わない

**Pros**:

- ✅ 実装が不要

**Cons**:

- ❌ 整合性の問題を検出できない
- ❌ データ品質が保証されない
- ❌ ADR-003のセマンティック定義が無意味になる
- ❌ Ukiyoueの価値提案が崩壊
- ❌ 採用すべきでない

## Comparison Matrix

| 評価基準                        | 重み | SHACL    | ShEx | OWL | Custom | JSON Schema only | No Validation |
| ------------------------------- | ---- | -------- | ---- | --- | ------ | ---------------- | ------------- |
| **W3C標準準拠**                 | 5    | 5        | 3    | 5   | 0      | 3                | 0             |
| **RDFグラフ検証**               | 5    | 5        | 5    | 4   | 0      | 0                | 0             |
| **JSON-LD統合**                 | 5    | 5        | 4    | 3   | 2      | 0                | 0             |
| **制約表現力**                  | 4    | 5        | 4    | 5   | 3      | 2                | 0             |
| **詳細エラーレポート**          | 4    | 5        | 3    | 2   | 3      | 4                | 0             |
| **ライブラリサポート（JS/TS）** | 4    | 4        | 2    | 1   | 0      | 5                | 5             |
| **パフォーマンス**              | 3    | 4        | 4    | 1   | 3      | 5                | 5             |
| **人間可読性**                  | 3    | 4        | 5    | 2   | 4      | 4                | 5             |
| **学習コスト（低いほど良い）**  | 2    | 3        | 3    | 1   | 4      | 5                | 5             |
| **エコシステム成熟度**          | 3    | 4        | 2    | 4   | 0      | 5                | 5             |
| **合計**                        | 38   | **168**  | 131  | 113 | 69     | 121              | 90            |
| **正規化スコア（/30）**         | -    | **26.5** | 21   | 18  | 11     | 19               | 14            |

**重み付け理由**:

- **W3C標準準拠（5）**: 相互運用性とエコシステム統合の基盤
- **RDFグラフ検証（5）**: セマンティック検証の核心機能
- **JSON-LD統合（5）**: ADR-003との整合性が必須
- **制約表現力（4）**: 複雑な整合性ルールの実現可能性
- **詳細エラーレポート（4）**: フィードバック生成（ミクロの好循環）の基盤
- **ライブラリサポート（4）**: 実装効率と信頼性
- **パフォーマンス（3）**: 大量ドキュメント検証の実現可能性
- **人間可読性（3）**: ルール定義の保守性
- **学習コスト（2）**: 重要だが、ドキュメントで軽減可能
- **エコシステム成熟度（3）**: 長期的な保守性

## Consequences

### Positive

- ✅ **W3C標準**: 勧告により標準化、長期的な保守性
- ✅ **RDF完全対応**: JSON-LDとシームレス統合
- ✅ **豊富な制約**: あらゆる整合性ルールを表現可能
- ✅ **詳細レポート**: どの制約が違反したか明確
- ✅ **拡張性**: SPARQLクエリで柔軟なカスタム制約
- ✅ **再利用性**: 形状定義を共有・再利用可能

### Negative

- ⚠️ **学習コスト**: RDF/Turtle記法の理解が必要
- ⚠️ **JavaScriptエコシステムではマイナー**: ライブラリ選択肢が限定的
- ⚠️ **パフォーマンス**: JSON Schemaより処理が重い

### Mitigation

- **学習コスト**:
  - 標準的なSHACL形状をテンプレート化
  - ベストプラクティスをドキュメント化
  - よくある制約はプリセットとして提供
- **ライブラリ選択肢**:
  - rdf-validate-shacl（Node.js/Bun対応）を採用
  - 必要に応じて機能拡張
- **パフォーマンス**:
  - JSON Schema検証を先に実行（早期リターン）
  - SHACL検証は構造的に正しいドキュメントのみに適用
  - 検証結果のキャッシュ

## Implementation Notes

### ライブラリ

```bash
bun add rdf-validate-shacl rdf-ext @rdfjs/data-model
```

### 基本的な使用方法

```typescript
import { Validator } from "rdf-validate-shacl";
import * as jsonld from "jsonld";
import { rdfParser } from "rdf-parse";

// JSON-LDドキュメント
const document = {
  "@context": "https://ukiyoue.dev/context/v1",
  "@type": "Requirement",
  "@id": "https://example.com/req-001",
  title: "User Authentication",
  dependsOn: ["https://example.com/design-001"],
};

// SHACL形状（Turtle形式）
const shapesGraph = `
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix ukiyoue: <https://ukiyoue.dev/vocab#> .

ukiyoue:RequirementShape
  a sh:NodeShape ;
  sh:targetClass ukiyoue:Requirement ;
  sh:property [
    sh:path ukiyoue:title ;
    sh:minLength 1 ;
    sh:maxLength 200 ;
  ] ;
  sh:property [
    sh:path ukiyoue:dependsOn ;
    sh:minCount 1 ;
  ] .
`;

// 1. JSON-LDをRDFに変換
const rdfDataset = await jsonld.toRDF(document, {
  format: "application/n-quads",
});

// 2. SHACLバリデーション実行
const shapes = await loadTurtleToRDF(shapesGraph);
const validator = new Validator(shapes);
const report = await validator.validate(rdfDataset);

// 3. 結果確認
console.log(report.conforms); // true/false
console.log(report.results); // 違反詳細
```

### エラーレポート処理

```typescript
interface SHACLValidationResult {
  path: string; // 違反したプロパティパス
  focusNode: string; // 違反が発生したノード
  message: string; // エラーメッセージ
  severity: "Violation" | "Warning" | "Info";
  sourceConstraintComponent: string; // 違反した制約タイプ
}

function formatSHACLReport(report: ValidationReport): string[] {
  return report.results.map((result) => {
    const path = result.path?.value || "unknown";
    const message = result.message?.[0]?.value || "Constraint violated";
    return `${path}: ${message}`;
  });
}
```

### 標準SHACL形状

```turtle
# semantics/shapes/document.ttl
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix ukiyoue: <https://ukiyoue.dev/vocab#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ukiyoue:DocumentShape
  a sh:NodeShape ;
  sh:targetClass ukiyoue:Document ;

  # タイトル必須、1〜200文字
  sh:property [
    sh:path ukiyoue:title ;
    sh:datatype xsd:string ;
    sh:minLength 1 ;
    sh:maxLength 200 ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
    sh:message "タイトルは必須で、1〜200文字である必要があります" ;
  ] ;

  # 依存関係はIRI
  sh:property [
    sh:path ukiyoue:dependsOn ;
    sh:nodeKind sh:IRI ;
    sh:message "依存関係は有効なIRIである必要があります" ;
  ] ;

  # 作成日時は必須
  sh:property [
    sh:path ukiyoue:created ;
    sh:datatype xsd:dateTime ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
    sh:message "作成日時は必須です" ;
  ] .
```

### 検証パイプライン

```typescript
// 2段階検証: JSON Schema → SHACL
async function validateDocument(document: unknown) {
  // Phase 1: 構造検証（JSON Schema）
  const structureValid = validateJsonSchema(document);
  if (!structureValid) {
    return {
      level: "structure",
      errors: getJsonSchemaErrors(),
    };
  }

  // Phase 2: セマンティック検証（SHACL）
  const rdf = await jsonld.toRDF(document);
  const shapes = await loadShapes();
  const validator = new Validator(shapes);
  const report = await validator.validate(rdf);

  if (!report.conforms) {
    return {
      level: "semantic",
      errors: formatSHACLReport(report),
    };
  }

  return { level: "valid", errors: [] };
}
```

### カスタム制約（SPARQL）

```turtle
ukiyoue:LinkExistenceConstraint
  a sh:NodeShape ;
  sh:targetClass ukiyoue:Document ;
  sh:sparql [
    sh:message "依存関係で参照されたドキュメントが存在しません: {$value}" ;
    sh:select """
      PREFIX ukiyoue: <https://ukiyoue.dev/vocab#>
      SELECT $this ?value
      WHERE {
        $this ukiyoue:dependsOn ?value .
        FILTER NOT EXISTS { ?value a ukiyoue:Document }
      }
    """ ;
  ] .
```

### パフォーマンス最適化

```typescript
// 形状のプリロード
const shapesCache = new Map<string, RDFDataset>();

async function getShapes(shapeId: string): Promise<RDFDataset> {
  if (!shapesCache.has(shapeId)) {
    const shapes = await loadShapes(shapeId);
    shapesCache.set(shapeId, shapes);
  }
  return shapesCache.get(shapeId)!;
}

// バッチ検証
async function validateBatch(documents: JsonLdDocument[]) {
  const shapes = await getShapes("document");
  const validator = new Validator(shapes);

  return Promise.all(
    documents.map(async (doc) => {
      const rdf = await jsonld.toRDF(doc);
      return validator.validate(rdf);
    })
  );
}
```

### テスト

```typescript
import { describe, it, expect } from "bun:test";

describe("SHACL Validation", () => {
  it("should validate valid document", async () => {
    const doc = {
      "@context": "https://ukiyoue.dev/context/v1",
      "@type": "Document",
      title: "Test",
      created: "2025-10-27T00:00:00Z",
    };

    const result = await validateDocument(doc);
    expect(result.level).toBe("valid");
  });

  it("should reject document with missing title", async () => {
    const doc = {
      "@context": "https://ukiyoue.dev/context/v1",
      "@type": "Document",
      created: "2025-10-27T00:00:00Z",
    };

    const result = await validateDocument(doc);
    expect(result.level).toBe("semantic");
    expect(result.errors).toContain("タイトルは必須");
  });
});
```

## Related

- **ADR-003**: Semantic Definition - JSON-LD（SHACLで検証）
- **ADR-002**: Structure Validation - JSON Schema（構造検証の前段階）
- **ADR-011**: JSON-LD Library - jsonld.js（RDF変換）
