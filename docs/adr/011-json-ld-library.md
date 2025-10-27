# ADR-011: JSON-LD Library

## Status

Accepted

## Context

ADR-003でJSON-LD 1.1によるセマンティック定義を採用しました。JSON-LDの拡張・圧縮、RDF変換、セマンティック検索を実現するためのライブラリが必要です。

**要求事項**:

- ✅ JSON-LD 1.1 完全対応
- ✅ 拡張・圧縮処理（expand(), compact()）
- ✅ RDF変換（toRDF(), fromRDF()）
- ✅ フレーミング（frame()）によるグラフ構造の再構成
- ✅ 正規化（normalize()）による正規形への変換
- ✅ TypeScript対応
- ✅ Bun互換性（Bun 1.x）
- ✅ 大規模ドキュメントでも実用的な速度
- ✅ W3C標準準拠
- ✅ わかりやすいエラーメッセージ

**制約条件**:

- JSON-LD 1.1ベース（ADR-003）
- TypeScript/Bun環境で動作（ADR-008, ADR-009）
- RDFエコシステムとの統合
- npm/bunパッケージとして利用可能

## Decision

**jsonld.js (Digital Bazaar)** を採用します。

## Options Considered

### Option A: jsonld.js (Digital Bazaar) (提案)

**概要**: W3C公式リファレンス実装

**Pros**:

- ✅ JSON-LD 1.1仕様の公式リファレンス実装
- ✅ W3C Working Groupメンバーが開発・メンテナンス
- ✅ すべてのJSON-LD操作をサポート（expand, compact, flatten, frame, toRDF, fromRDF, normalize）
- ✅ TypeScript型定義あり（@types/jsonld）
- ✅ 活発なメンテナンス
- ✅ Bunで動作
- ✅ 豊富なドキュメントとサンプル
- ✅ JSON-LD Signature（署名）もサポート

**Cons**:

- ⚠️ パフォーマンスが最適ではない（純粋なJS実装）
- ⚠️ 依存関係が多い（rdfライブラリ等）
- ⚠️ バンドルサイズがやや大きい（約200KB minified）

### Option B: jsonld-streaming-parser

**概要**: ストリーミング処理特化のパーサー

**Pros**:

- ✅ ストリーミング処理に対応
- ✅ 大規模ドキュメントでもメモリ効率が良い
- ✅ TypeScript実装
- ✅ RDF.jsインターフェース準拠

**Cons**:

- ❌ JSON-LD 1.0のみ対応（1.1未対応）
- ❌ 機能が限定的（expand, toRDFのみ）
- ❌ compact, frame, normalize等が未サポート
- ❌ コミュニティが小さい
- ❌ Bunでの動作保証なし

### Option C: rdflib.js

**概要**: RDF全般を扱う包括的ライブラリ

**Pros**:

- ✅ RDF全般を扱える包括的なライブラリ
- ✅ Solid（Linked Data Platform）で採用実績
- ✅ TypeScript型定義あり

**Cons**:

- ❌ JSON-LD特化ではなく、RDF全般のライブラリ
- ❌ JSON-LD 1.1の一部機能が未サポート
- ❌ APIがJSON-LD標準と異なる（学習コストあり）
- ❌ 重い（1MB以上）
- ❌ Bunでの動作保証なし

### Option D: jsonld-context-parser

**概要**: Context解析特化ライブラリ

**Pros**:

- ✅ TypeScript実装
- ✅ Context解析に特化
- ✅ 高速なContext処理

**Cons**:

- ❌ Context解析のみ（expand, compact等は別途実装が必要）
- ❌ JSON-LD 1.0ベース（1.1の一部機能未対応）
- ❌ 機能が限定的
- ❌ コミュニティが小さい

### Option E: json-ld-lite

**概要**: 軽量なJSON-LDライブラリ

**Pros**:

- ✅ 軽量（依存関係ゼロ）
- ✅ シンプルなAPI
- ✅ 小規模プロジェクト向け

**Cons**:

- ❌ JSON-LD 1.0のみ対応
- ❌ 機能が限定的（基本的なexpand, compactのみ）
- ❌ normalize, frame等が未サポート
- ❌ メンテナンス停滞
- ❌ TypeScript型定義なし
- ❌ Bunでの動作保証なし

### Option F: 自前実装

**概要**: プロジェクト独自の実装

**Pros**:

- ✅ Ukiyoueの要件に最適化可能
- ✅ 不要な機能を排除し軽量化
- ✅ パフォーマンス最適化の余地

**Cons**:

- ❌ 膨大な開発コスト（W3C仕様の実装は複雑）
- ❌ テストケースの整備が困難
- ❌ 標準準拠の保証が難しい
- ❌ 長期的なメンテナンス負担
- ❌ コミュニティの信頼が得られにくい

## Comparison Matrix

| 評価基準                 | 重み | jsonld.js | streaming-parser | rdflib.js | context-parser | json-ld-lite | 自前実装 |
| ------------------------ | ---- | --------- | ---------------- | --------- | -------------- | ------------ | -------- |
| **JSON-LD 1.1 対応**     | 5    | 5         | 0                | 4         | 3              | 0            | 4        |
| **機能完全性**           | 5    | 5         | 2                | 4         | 2              | 2            | 3        |
| **標準準拠**             | 5    | 5         | 3                | 4         | 3              | 2            | 2        |
| **TypeScript対応**       | 3    | 3         | 3                | 3         | 3              | 1            | 3        |
| **Bun互換性**            | 3    | 3         | 2                | 2         | 2              | 2            | 3        |
| **パフォーマンス**       | 3    | 2         | 3                | 2         | 3              | 3            | 3        |
| **コミュニティサポート** | 4    | 5         | 2                | 3         | 2              | 1            | 0        |
| **ドキュメント充実度**   | 3    | 3         | 2                | 2         | 2              | 1            | 1        |
| **軽量性**               | 2    | 1         | 2                | 1         | 2              | 2            | 2        |
| **エラーハンドリング**   | 2    | 2         | 1                | 2         | 1              | 1            | 1        |
| **合計**                 | 35   | **168**   | **97**           | **134**   | **113**        | **81**       | **110**  |
| **正規化スコア（/30）**  | -    | **28.8**  | **16.6**         | **23**    | **19.4**       | **13.9**     | **18.9** |

**重み付け理由**:

- **JSON-LD 1.1 対応（5）**: ADR-003でJSON-LD 1.1を採用済み。1.0では`@context`の型指定、`@protected`等の機能が使えず、Ukiyoueの設計が成立しない
- **機能完全性（5）**: expand, compact, flatten, frame, toRDF, fromRDF, normalizeすべてが必要。一部機能の欠落は別ライブラリでの補完が必要となり複雑化
- **標準準拠（5）**: W3C仕様への準拠が信頼性の要。独自拡張や仕様違反は相互運用性を損なう
- **コミュニティサポート（4）**: 長期的なメンテナンス、問題解決の容易さ。JSON-LD界隈はニッチなため、コミュニティの存在が重要
- **TypeScript対応（3）**: ADR-008でTypeScriptを採用。型定義がないと型安全性が失われ、開発効率が低下
- **Bun互換性（3）**: ADR-009でBunを採用済み。互換性がない場合は採用不可
- **パフォーマンス（3）**: 大規模ドキュメント（1,000+）での処理速度が重要。ただし、JSON Schema検証ほどの頻度ではないため重みは中程度
- **ドキュメント充実度（3）**: JSON-LD自体が複雑な技術のため、良質なドキュメントが学習コストを左右
- **軽量性（2）**: 依存関係の少なさ、バンドルサイズ。JSON-LDライブラリは性質上ある程度大きくなるため、重みは低め
- **エラーハンドリング（2）**: エラーメッセージの質。JSON-LDエラーは開発者向けであり、エンドユーザーには見せないため重みは最低限

## Consequences

**Positive**:

- 公式リファレンス実装: W3C仕様に完全準拠、信頼性が高い
- 機能網羅: すべてのJSON-LD操作が可能
- 活発なメンテナンス: Digital Bazaarによる継続的な開発
- TypeScript対応: @types/jsonldで型定義が利用可能
- Bun互換: 問題なく動作
- 豊富な実績: Solid、Verifiable Credentials等で採用
- JSON-LD Signature: 署名・検証もサポート（将来的な拡張に有利）

**Negative**:

- パフォーマンス: 純粋なJS実装のため最速ではない
  - **対策**: 結果のキャッシュ、バッチ処理での最適化
- バンドルサイズ: 約200KB（minified）、やや大きい
  - **対策**: 必要な機能のみをインポート、tree-shaking活用
- 依存関係: rdf-canonize等の依存あり
  - **対策**: セキュリティスキャンの徹底、定期的な更新

**Neutral**:

- 学習コスト: JSON-LD自体が複雑だが、ライブラリのAPIは標準的
  - ドキュメント整備でカバー

## Implementation Notes

### インストール

```bash
bun add jsonld
bun add -D @types/jsonld
```

### 基本的な使用例

```typescript
import * as jsonld from "jsonld";

// JSON-LDドキュメント
const doc = {
  "@context": "https://ukiyoue.dev/context/v1",
  "@type": "FunctionalRequirement",
  id: "FR-001",
  title: "ユーザー認証機能",
  dependsOn: ["NFR-001"],
};

// 1. 拡張（Expand）: Contextを解決し、完全なIRIに展開
const expanded = await jsonld.expand(doc);
console.log(expanded);
// [
//   {
//     "@type": ["https://ukiyoue.dev/vocab#FunctionalRequirement"],
//     "https://ukiyoue.dev/vocab#id": [{ "@value": "FR-001" }],
//     "https://ukiyoue.dev/vocab#title": [{ "@value": "ユーザー認証機能" }],
//     "https://ukiyoue.dev/vocab#dependsOn": [{ "@id": "NFR-001" }]
//   }
// ]

// 2. 圧縮（Compact）: Contextを適用し、短縮形に戻す
const context = { "@context": "https://ukiyoue.dev/context/v1" };
const compacted = await jsonld.compact(expanded, context);
console.log(compacted);

// 3. RDFへ変換（ToRDF）: N-Quads形式で出力
const nquads = await jsonld.toRDF(doc, { format: "application/n-quads" });
console.log(nquads);
// <FR-001> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://ukiyoue.dev/vocab#FunctionalRequirement> .
// <FR-001> <https://ukiyoue.dev/vocab#id> "FR-001" .
// ...

// 4. RDFから変換（FromRDF）
const docFromRdf = await jsonld.fromRDF(nquads, {
  format: "application/n-quads",
});

// 5. 正規化（Normalize）: URDNA2015アルゴリズムで正規形に
const normalized = await jsonld.normalize(doc, {
  algorithm: "URDNA2015",
  format: "application/n-quads",
});
console.log(normalized); // 署名・比較可能な正規形
```

### フレーミング（Frame）

```typescript
// グラフ構造の再構成
const doc = {
  "@context": "https://ukiyoue.dev/context/v1",
  "@graph": [
    {
      "@id": "FR-001",
      "@type": "FunctionalRequirement",
      title: "ユーザー認証",
      testCases: [{ "@id": "TC-001" }, { "@id": "TC-002" }],
    },
    {
      "@id": "TC-001",
      "@type": "TestCase",
      title: "正常系テスト",
    },
    {
      "@id": "TC-002",
      "@type": "TestCase",
      title: "異常系テスト",
    },
  ],
};

// フレーム: 要件を中心に、テストケースを埋め込む形に再構成
const frame = {
  "@context": "https://ukiyoue.dev/context/v1",
  "@type": "FunctionalRequirement",
  testCases: {
    "@embed": "@always", // 常に埋め込む
  },
};

const framed = await jsonld.frame(doc, frame);
console.log(framed);
// {
//   "@context": "https://ukiyoue.dev/context/v1",
//   "@id": "FR-001",
//   "@type": "FunctionalRequirement",
//   "title": "ユーザー認証",
//   "testCases": [
//     {
//       "@id": "TC-001",
//       "@type": "TestCase",
//       "title": "正常系テスト"
//     },
//     {
//       "@id": "TC-002",
//       "@type": "TestCase",
//       "title": "異常系テスト"
//     }
//   ]
// }
```

### Semantic Engineへの統合

```typescript
// tools/mcp-server/src/engines/semantic-engine.ts
import * as jsonld from "jsonld";
import type { JsonLdDocument, ExpandedDocument } from "jsonld";

export class SemanticEngine {
  private contextCache = new Map<string, any>();

  /**
   * JSON-LDを拡張形式に変換
   */
  async expand(document: JsonLdDocument): Promise<ExpandedDocument> {
    try {
      const expanded = await jsonld.expand(document);
      return expanded;
    } catch (error) {
      throw new Error(`JSON-LD expansion failed: ${error.message}`);
    }
  }

  /**
   * 拡張形式を圧縮形式に変換
   */
  async compact(
    expanded: ExpandedDocument,
    contextUrl: string
  ): Promise<JsonLdDocument> {
    const context = await this.loadContext(contextUrl);
    const compacted = await jsonld.compact(expanded, context);
    return compacted as JsonLdDocument;
  }

  /**
   * RDFに変換
   */
  async toRDF(document: JsonLdDocument): Promise<string> {
    const rdf = await jsonld.toRDF(document, {
      format: "application/n-quads",
    });
    return rdf as string;
  }

  /**
   * RDFから変換
   */
  async fromRDF(rdf: string): Promise<JsonLdDocument> {
    const doc = await jsonld.fromRDF(rdf, {
      format: "application/n-quads",
    });
    return doc as JsonLdDocument;
  }

  /**
   * フレーミングによるグラフ再構成
   */
  async frame(
    document: JsonLdDocument,
    frame: object
  ): Promise<JsonLdDocument> {
    const framed = await jsonld.frame(document, frame);
    return framed as JsonLdDocument;
  }

  /**
   * 正規化（署名・比較用）
   */
  async normalize(document: JsonLdDocument): Promise<string> {
    const normalized = await jsonld.normalize(document, {
      algorithm: "URDNA2015",
      format: "application/n-quads",
    });
    return normalized as string;
  }

  /**
   * Contextのキャッシュ付き読み込み
   */
  private async loadContext(url: string): Promise<any> {
    if (this.contextCache.has(url)) {
      return this.contextCache.get(url);
    }

    // ローカルファイルまたはHTTPから読み込み
    let context: any;
    if (url.startsWith("https://ukiyoue.dev/context/")) {
      // Ukiyoue標準Context（ローカルファイル）
      const localPath = url.replace(
        "https://ukiyoue.dev/context/",
        "./semantics/"
      );
      context = await Bun.file(localPath).json();
    } else {
      // 外部URL
      const response = await fetch(url);
      context = await response.json();
    }

    this.contextCache.set(url, context);
    return context;
  }
}
```

### パフォーマンス最適化

```typescript
// Context解決の結果をキャッシュ
const documentLoader = jsonld.documentLoaders.node();

const cachedLoader = async (url: string) => {
  // ローカルContextは事前にキャッシュ
  if (url.startsWith("https://ukiyoue.dev/")) {
    const localPath = url.replace("https://ukiyoue.dev/", "./semantics/");
    const content = await Bun.file(localPath).text();
    return {
      contextUrl: null,
      document: JSON.parse(content),
      documentUrl: url,
    };
  }
  // 外部URLは標準ローダーを使用
  return documentLoader(url);
};

// 使用時
const expanded = await jsonld.expand(doc, {
  documentLoader: cachedLoader,
});
```

### バッチ処理

```typescript
// 複数ドキュメントを並列で処理
async function expandBatch(
  documents: JsonLdDocument[]
): Promise<ExpandedDocument[]> {
  const promises = documents.map((doc) => jsonld.expand(doc));
  return Promise.all(promises);
}
```

### エラーハンドリング

```typescript
try {
  const expanded = await jsonld.expand(doc);
} catch (error) {
  if (error.name === "jsonld.InvalidUrl") {
    console.error("無効なURL:", error.details.url);
  } else if (error.name === "jsonld.LoadingDocumentFailed") {
    console.error("Contextの読み込み失敗:", error.details.url);
  } else if (error.name === "jsonld.SyntaxError") {
    console.error("JSON-LD構文エラー:", error.message);
  } else {
    console.error("JSON-LD処理エラー:", error);
  }
}
```

---

## Related

- [ADR-003: Semantic Definition](./003-semantic-definition.md) - JSON-LDの採用決定
- [ADR-006: Semantic Integrity Validation](./006-semantic-integrity-validation.md) - SHACLとの連携
- [ADR-008: Implementation Language](./008-implementation-language.md) - TypeScriptとの統合
- [ADR-009: Runtime Environment](./009-runtime-environment.md) - Bunとの互換性
- [ADR-012: SHACL Library](./012-shacl-library.md) - RDF変換の活用
