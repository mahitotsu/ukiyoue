# Schemas

このディレクトリには、新しいプロジェクトドキュメントの**構造を定義する**スキーマファイルが含まれます。

## 📋 概要

**技術**: JSON Schema  
**目的**: ドキュメントの構造・形式を機械可読な形式で定義し、自動検証を可能にする

## 📁 構成

```
schemas/
├── README.md                    # このファイル
├── document-base.schema.json    # 全ドキュメント共通の基底スキーマ
├── types/                       # ドキュメントタイプ別スキーマ
│   ├── technical-spec.schema.json
│   ├── design-doc.schema.json
│   ├── api-doc.schema.json
│   └── ...
└── components/                  # 再利用可能なスキーマコンポーネント
    ├── metadata.schema.json
    ├── author.schema.json
    └── ...
```

## 🎯 役割

### 1. 構造の定義

ドキュメントがどのような構造であるべきかを定義します。

**例**:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Technical Specification Document",
  "type": "object",
  "required": ["metadata", "content"],
  "properties": {
    "metadata": {
      "$ref": "#/definitions/metadata"
    },
    "content": {
      "type": "object"
    }
  }
}
```

### 2. バリデーション

作成されたドキュメントが正しい構造を持っているか検証します。

**使用例**:

```bash
# ドキュメントの妥当性検証
ukiyoue validate --schema schemas/types/technical-spec.schema.json \
                 --document examples/sample-spec.json
```

### 3. 自動生成のガイド

AI Agent がドキュメントを生成する際の「設計図」として機能します。

## 📝 JSON Schema とは

JSON Schema は、JSON データの構造を定義するための仕様です。

**メリット**:

- ✅ 機械可読: ツールで自動処理可能
- ✅ 標準化: 広く採用されている標準
- ✅ バリデーション: 自動検証が容易
- ✅ ドキュメント生成: スキーマからドキュメントを自動生成可能
- ✅ エディタサポート: IDE で補完・検証が効く

**参考**:

- [JSON Schema 公式サイト](https://json-schema.org/)
- [Understanding JSON Schema](https://json-schema.org/understanding-json-schema/)

## 🔄 今後の作成予定

1. **document-base.schema.json** - 基底スキーマ
2. **metadata.schema.json** - メタデータの定義
3. **technical-spec.schema.json** - 技術仕様書のスキーマ
4. **api-doc.schema.json** - API 仕様書のスキーマ
