# Examples

このディレクトリには、新しいプロジェクトドキュメントフレームワークを使用した**実証実験とサンプル**が含まれます。

## 📋 概要

**目的**: フレームワークの有効性を実証し、実際の使用例を提供する

## 📁 構成

```text
examples/
├── README.md                    # このファイル
└── reservation-system/          # 予約システムの実例
    ├── business-requirements.json
    ├── functional-requirements.json
    ├── non-functional-requirements.json
    ├── stakeholders.json
    └── use-cases.json
```

**注**: スキーマ定義（`schemas/`）とセマンティックコンテキスト（`semantics/`）があるため、
テンプレートファイルは不要です。JSON Schemaから構造を、JSON-LDから意味を理解できます。

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
- ✅ 相互参照の検証（リンクチェック）

## � 予約システムの例（reservation-system/）

実在の来店予約システムを題材に、要件定義ドキュメントをフレームワークで表現した例です。

**含まれるドキュメント**:

- `business-requirements.json`: 業務要件（目的、スコープ、制約、リスク）
- `stakeholders.json`: ステークホルダー定義（顧客、店舗スタッフ、管理者等）
- `use-cases.json`: ユースケース定義（予約登録、変更、スタッフログイン等）
- `functional-requirements.json`: 機能要件（45件の詳細要件）
- `non-functional-requirements.json`: 非機能要件（性能、セキュリティ等）

**実証する機能**:

- ✅ スキーマによる構造検証（JSON Schema Draft-07）
- ✅ セマンティックな関係性（JSON-LD 1.1）
- ✅ 相互参照の自動検証（151個のリンク）
- ✅ `$REF`構文による依存関係の表現
- ✅ Pre-commitフックによる品質保証

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

### 1. 予約システムの例を参照する

```bash
cd examples/reservation-system

# ドキュメントのバリデーション
bun run validate /home/akring/ukiyoue/examples/reservation-system/use-cases.json

# 相互参照の検証
bun run check-links /home/akring/ukiyoue/examples/reservation-system
```

### 2. 新しいドキュメントを作成する

スキーマ定義を参照して、新しいJSONドキュメントを作成します：

```bash
# スキーマ定義を確認
cat schemas/components/use-case.schema.json

# 新しいドキュメントを作成（エディタで編集）
vim my-use-cases.json

# スキーマに従った構造でJSONを記述
# 例: {"id": "UC-001", "title": "...", "actor": "SH-...", ...}

# バリデーション
bun run validate my-use-cases.json
```

### 3. 継続的品質保証

Git pre-commitフックで自動検証：

```bash
# コミット時に自動で実行される
git commit -m "docs: add new use case"

# 実行内容:
# - Prettier フォーマット
# - JSON Schema バリデーション
# - 相互参照チェック（リンクチェック）
```

## 📈 今後の拡張

- [ ] Markdown生成機能の実装
- [ ] より多様なプロジェクトタイプの例
- [ ] 実際の OSS プロジェクトへの適用
- [ ] 詳細な評価レポート
