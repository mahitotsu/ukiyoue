# JSON-LD Semantics

Ukiyoue Frameworkで使用するJSON-LDコンテキスト定義です。

## 📂 構成

- `contexts/` - JSON-LDコンテキストファイル
  - `context.jsonld` - メインコンテキスト定義

## 🔗 JSON-LD仕様

- **バージョン**: JSON-LD 1.1
- **用途**: ドキュメント間の意味的関係の定義

## 📖 コンテキスト設計

### 名前空間

```json
{
  "@context": {
    "ukiyoue": "https://ukiyoue.dev/ns/",
    "schema": "https://schema.org/"
  }
}
```

### 定義されるプロパティ

- `relatedGoals`: ビジネスゴールとの関連（@type: @id）
- `relatedUseCases`: ユースケースとの関連（@type: @id）
- `metrics`: 成功指標との関連（@type: @id）
- `constraints`: 制約との関連（@type: @id）
- `relatedDocuments`: 一般的なドキュメント間の関連（@type: @id）

### 使用例

```json
{
  "@context": "https://ukiyoue.dev/contexts/v1",
  "@type": "UseCase",
  "id": "UC-001",
  "relatedGoals": ["BG-001"]
}
```

この`relatedGoals`は、JSON-LDコンテキストにより`@type: @id`として解釈され、
セマンティックウェブ技術でリンクとして扱われます。

## 🔄 SHACL検証（将来実装予定）

現在はJSON Schemaによる構造検証のみですが、将来的にはSHACLによる
セマンティックレベルの検証も追加予定です。
