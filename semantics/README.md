# Semantics

このディレクトリには、新しいプロジェクトドキュメントの**意味・コンテキストを定義する**セマンティック定義が含まれます。

## 📋 概要

**技術**: JSON-LD (JSON for Linking Data)  
**目的**: ドキュメントの意味的な関係性や文脈を機械可読な形式で定義し、対話的な情報抽出を可能にする

## 📁 構成

```
semantics/
├── README.md                 # このファイル
├── context.jsonld            # 基本コンテキスト定義
├── vocabularies/             # 語彙定義
│   ├── document.jsonld       # ドキュメント関連の語彙
│   ├── project.jsonld        # プロジェクト関連の語彙
│   └── ...
└── ontologies/               # オントロジー定義
    ├── relationships.jsonld  # ドキュメント間の関係性
    └── ...
```

## 🎯 役割

### 1. 意味の定義

ドキュメント内の概念や関係性に意味を与えます。

**例**:

```json
{
  "@context": {
    "@vocab": "http://schema.org/",
    "ukiyoue": "https://ukiyoue.dev/vocab#",
    "document": "ukiyoue:Document",
    "dependsOn": {
      "@id": "ukiyoue:dependsOn",
      "@type": "@id"
    },
    "author": "http://schema.org/author"
  }
}
```

### 2. 関係性の表現

ドキュメント間の依存関係や参照関係を表現します。

**使用例**:

```json
{
  "@context": "https://ukiyoue.dev/context.jsonld",
  "@type": "TechnicalSpecification",
  "@id": "docs/api/users.json",
  "title": "User API Specification",
  "dependsOn": ["docs/architecture/auth.json"],
  "relatedTo": ["docs/guides/api-usage.json"]
}
```

### 3. セマンティック検索

意味的な検索や推論を可能にします。

**クエリ例**:

```sparql
# "認証に関連する全てのドキュメント"を検索
SELECT ?doc WHERE {
  ?doc ukiyoue:relatedConcept "authentication" .
}
```

## 📝 JSON-LD とは

JSON-LD (JSON for Linking Data) は、JSON にセマンティック Web の機能を追加する形式です。

**メリット**:

- ✅ リンクトデータ: ドキュメント間の関係性を表現
- ✅ セマンティック検索: 意味的な検索が可能
- ✅ 推論: 明示されていない関係も推論可能
- ✅ 互換性: 既存の JSON 処理ツールでも扱える
- ✅ 標準化: W3C 標準

**参考**:

- [JSON-LD 公式サイト](https://json-ld.org/)
- [JSON-LD 1.1 (W3C Recommendation)](https://www.w3.org/TR/json-ld11/)

## 🎨 具体的な活用例

### Use Case 1: ドキュメント依存関係の可視化

```json
{
  "@context": "context.jsonld",
  "@graph": [
    {
      "@id": "doc1",
      "title": "認証設計",
      "dependsOn": ["doc2"]
    },
    {
      "@id": "doc2",
      "title": "アーキテクチャ概要"
    }
  ]
}
```

→ ツールで依存関係グラフを自動生成

### Use Case 2: AI Agent による対話的情報抽出

```
User: "認証に関連するドキュメントは？"
AI: JSON-LDから "authentication" に relatedTo な全ドキュメントを検索
→ 「認証設計」「API仕様書」「セキュリティガイド」を返す
```

### Use Case 3: 影響範囲分析

```
Input: "doc2" を更新
Process: JSON-LDで dependsOn 関係を辿る
Output: ["doc1", "doc3", "doc5"] が影響を受ける
```

## 🔄 今後の作成予定

1. **context.jsonld** - 基本コンテキスト
2. **document.jsonld** - ドキュメント語彙
3. **relationships.jsonld** - 関係性の定義
