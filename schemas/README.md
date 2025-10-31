# JSON Schemas

Ukiyoue Frameworkで使用するJSON Schema定義です。

## 📂 構成

- `definitions/` - スキーマ定義ファイル
  - `business-goal.schema.json` - ビジネスゴール
  - `use-case.schema.json` - ユースケース
  - `success-metric.schema.json` - 成功指標
  - `constraint.schema.json` - 制約

## 📋 JSON Schema仕様

- **バージョン**: JSON Schema Draft 2020-12
- **検証エンジン**: Ajv v8

## 🔧 使用方法

これらのスキーマは`@ukiyoue/core`パッケージに含まれており、プログラムから自動的に読み込まれます。

```typescript
import { SchemaLoader } from "@ukiyoue/core";

const loader = new SchemaLoader();
const schema = loader.loadSchema("definitions/business-goal.schema.json");
```

## 📖 スキーマ設計

### 共通フィールド

すべてのドキュメントタイプは以下の共通フィールドを持ちます：

- `@context`: JSON-LDコンテキストURI（固定値）
- `@type`: ドキュメントタイプ（BusinessGoal, UseCase等）
- `id`: 一意識別子（型プレフィックス + 連番、例: BG-001）
- `name`: ドキュメント名
- `description`: 詳細説明

### 参照関係

ドキュメント間の関係は以下のフィールドで表現されます：

- `relatedUseCases`: ビジネスゴールから関連ユースケースへの参照
- `relatedGoals`: ユースケースから関連ビジネスゴールへの参照
- `metrics`: ビジネスゴールから成功指標への参照
- `constraints`: 各ドキュメントから制約への参照
