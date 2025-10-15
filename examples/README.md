# Examples

このディレクトリには、新しいプロジェクトドキュメントフレームワークを使用した**実証実験とサンプル**が含まれます。

## 📋 概要

**目的**: フレームワークの有効性を実証し、実際の使用例を提供する

## 📁 構成

```
examples/
├── README.md                    # このファイル
├── sample-project/              # サンプルプロジェクト
│   ├── documents/               # プロジェクトドキュメント
│   │   ├── architecture.json
│   │   ├── api-spec.json
│   │   └── design.json
│   ├── .ukiyoue/                # 設定ファイル
│   │   └── config.json
│   └── README.md
├── templates/                   # ドキュメントテンプレート
│   ├── technical-spec.json
│   ├── design-doc.json
│   ├── api-doc.json
│   └── README.md
└── case-studies/                # ケーススタディ
    ├── web-api-project/
    ├── microservices-project/
    └── README.md
```

## 🎯 実証実験の目的

### 1. フレームワークの検証

実際のプロジェクトでフレームワークを使用し、以下を検証します：

```yaml
validation_points:
  - 対話可能性: AI Agentが情報を抽出できるか
  - 自動生成可能性: ドキュメントを自動生成できるか
  - 再利用可能性: コンポーネントを再利用できるか
  - 効率性: 従来方式と比較して効率的か
  - 品質: ドキュメントの品質が向上するか
```

### 2. ベストプラクティスの確立

実証を通じてベストプラクティスを見出します：

```yaml
best_practices:
  - ドキュメント構造のパターン
  - メタデータの設計
  - セマンティックな関係性の定義
  - ツールの使い方
```

### 3. 使用例の提供

実際に動作する例を提供し、採用を促進します。

## 📝 サンプルプロジェクト

### sample-project/

架空の Web アプリケーションプロジェクトを題材に、フレームワークを適用した例です。

**含まれるドキュメント**:

```json
{
  "documents": [
    {
      "type": "architecture",
      "file": "architecture.json",
      "description": "システムアーキテクチャ設計書"
    },
    {
      "type": "api-specification",
      "file": "api-spec.json",
      "description": "API仕様書"
    },
    {
      "type": "design",
      "file": "design.json",
      "description": "詳細設計書"
    }
  ]
}
```

**実証する機能**:

- ✅ JSON Schema によるバリデーション
- ✅ JSON-LD による関係性の定義
- ✅ ツールによる品質評価
- ✅ Markdown への変換

## 📋 テンプレート集

よく使われるドキュメントタイプのテンプレートを提供します。

### technical-spec.json

```json
{
  "$schema": "../schemas/types/technical-spec.schema.json",
  "@context": "../semantics/context.jsonld",
  "metadata": {
    "type": "technical-specification",
    "title": "",
    "version": "1.0.0",
    "created": "",
    "updated": "",
    "authors": [],
    "tags": []
  },
  "content": {
    "overview": "",
    "requirements": [],
    "architecture": {},
    "implementation": {}
  }
}
```

### api-doc.json

```json
{
  "$schema": "../schemas/types/api-doc.schema.json",
  "@context": "../semantics/context.jsonld",
  "metadata": {
    "type": "api-documentation",
    "title": "",
    "version": "1.0.0",
    "baseUrl": "",
    "authentication": ""
  },
  "endpoints": []
}
```

## 📊 ケーススタディ

実際のプロジェクトタイプ別にフレームワークの適用例を示します。

### Case Study 1: Web API Project

RESTful API プロジェクトでの活用例

**成果**:

```yaml
before:
  - ドキュメント作成時間: 8時間
  - 更新頻度: 月1回
  - コードとの乖離: 30%

after:
  - ドキュメント作成時間: 2時間 (75%削減)
  - 更新頻度: 週1回 (自動化により容易に)
  - コードとの乖離: 5% (自動検証により)
```

### Case Study 2: Microservices Project

マイクロサービスアーキテクチャでの活用例

**特徴**:

- サービス間の依存関係を JSON-LD で表現
- 各サービスのドキュメントを独立して管理
- セマンティック検索でサービス横断的な情報取得

## 🔬 評価実験

### 実験 1: 効率性の測定

**目的**: フレームワークの使用が効率向上につながるか検証

**方法**:

```yaml
participants: 10名の開発者
tasks:
  - 従来方式でドキュメント作成
  - フレームワークでドキュメント作成
metrics:
  - 作成時間
  - 更新時間
  - エラー率
```

### 実験 2: 品質の評価

**目的**: ドキュメントの品質が向上するか検証

**方法**:

```yaml
evaluation:
  - 完全性チェック
  - 一貫性チェック
  - 可読性スコア
  - AI Agentによる情報抽出成功率
```

### 実験 3: 再利用性の測定

**目的**: コンポーネントの再利用が促進されるか検証

**方法**:

```yaml
tracking:
  - 再利用率の測定
  - 新規作成 vs 再利用の比率
  - 再利用による工数削減効果
```

## 🚀 使い方

### 1. サンプルプロジェクトを試す

```bash
cd examples/sample-project

# ドキュメントのバリデーション
ukiyoue validate --all

# 品質分析
ukiyoue analyze quality documents/architecture.json

# Markdownへ変換
ukiyoue convert documents/architecture.json \
        --output docs/architecture.md
```

### 2. テンプレートから新規作成

```bash
# テンプレートをコピー
cp examples/templates/technical-spec.json my-spec.json

# 内容を編集
vim my-spec.json

# バリデーション
ukiyoue validate my-spec.json
```

### 3. 自分のプロジェクトに適用

```bash
# プロジェクトディレクトリで初期化
ukiyoue init

# ドキュメント生成
ukiyoue generate --template technical-spec

# 継続的に検証
ukiyoue watch
```

## 📈 今後の拡張

- [ ] より多様なプロジェクトタイプの例
- [ ] 実際の OSS プロジェクトへの適用
- [ ] 詳細な評価レポート
- [ ] チュートリアル動画
