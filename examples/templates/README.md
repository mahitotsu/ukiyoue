# 業務要件定義書テンプレート

このディレクトリには、Ukiyoue フレームワークを使用して業務要件定義書を作成するためのテンプレートファイルが含まれています。

## 📋 テンプレートファイル一覧

| ファイル                                    | 説明                             | スキーマ                                           |
| ------------------------------------------- | -------------------------------- | -------------------------------------------------- |
| `business-requirements.template.json`       | メイン文書テンプレート           | `/schemas/types/business-requirements.schema.json` |
| `stakeholders.template.json`                | ステークホルダー定義テンプレート | `/schemas/components/stakeholder.schema.json`      |
| `use-cases.template.json`                   | ユースケース定義テンプレート     | `/schemas/components/use-case.schema.json`         |
| `functional-requirements.template.json`     | 機能要件テンプレート             | `/schemas/components/requirement.schema.json`      |
| `non-functional-requirements.template.json` | 非機能要件テンプレート           | `/schemas/components/requirement.schema.json`      |

## 🚀 使い方

### 1. 新しいプロジェクトを作成

```bash
# プロジェクトディレクトリを作成
mkdir -p /home/akring/ukiyoue/examples/my-project

# テンプレートをコピー
cp /home/akring/ukiyoue/examples/templates/*.template.json /home/akring/ukiyoue/examples/my-project/

# .template 拡張子を削除
cd /home/akring/ukiyoue/examples/my-project
for file in *.template.json; do
  mv "$file" "${file%.template.json}.json"
done
```

### 2. テンプレートを編集

各ファイルを開いて、`【】`で囲まれた部分を実際の内容に置き換えます。

#### business-requirements.json

- プロジェクト名、概要、目的を記入
- スコープ（含まれる/含まれない）を明確にする
- 制約条件（技術、ビジネス、法的）を記入
- 成功指標（KPI）を定義

#### stakeholders.json

- 各ステークホルダーの ID、名前、役割を記入
- ニーズと成功基準を具体的に記述
- 優先度、影響力、関心度を評価

#### use-cases.json

- ユースケース ID、タイトル、アクターを記入
- 主フロー（mainFlow）をステップバイステップで記述
- 代替フロー（alternativeFlows）と例外フロー（exceptionFlows）を追加
- 事前条件・事後条件を明確にする

#### functional-requirements.json

- 機能要件 ID、タイトル、説明を記入
- 受入基準を測定可能な形で記述
- 依存関係と関連要件を記入
- 見積工数を記入

#### non-functional-requirements.json

- 非機能要件のカテゴリを選択（パフォーマンス、セキュリティなど）
- 受入基準を数値で記述（例: 応答時間 2 秒以内）
- メトリクス（目標値、単位）を設定
- 実装ノートに技術的アプローチを記入

### 3. バリデーション

作成した JSON ファイルがスキーマに準拠しているか検証します：

```bash
cd /home/akring/ukiyoue/tools
bun run validate ../examples/my-project/business-requirements.json
```

### 4. バージョン管理

Git で管理して、変更履歴を追跡します：

```bash
cd /home/akring/ukiyoue/examples/my-project
git add .
git commit -m "feat: Initial business requirements"
```

## 📝 記入のコツ

### ID 命名規則

- **ステークホルダー**: `SH-XXX`（例: `SH-CUSTOMER`, `SH-ADMIN`）
- **ユースケース**: `UC-XXX`（例: `UC-001`, `UC-LOGIN`）
- **機能要件**: `FR-XXX`（例: `FR-001`, `FR-001-01`）
- **非機能要件**: `NFR-XXX`（例: `NFR-001`, `NFR-PERF`）
- **リスク**: `RISK-XXX`（例: `RISK-001`）
- **メトリクス**: `METRIC-XXX`（例: `METRIC-001`）

### 優先度の基準

- **critical**: プロジェクトの成否を左右する、絶対に必要
- **high**: 重要だが、一時的に省略可能
- **medium**: あると良い、将来的に必要
- **low**: オプション、余裕があれば

### ステータスの遷移

1. **proposed**: 提案段階
2. **approved**: 承認済み
3. **implemented**: 実装完了
4. **tested**: テスト完了
5. **deployed**: デプロイ完了

### 見積工数の目安

- **簡単な画面**: 4-8 時間
- **中程度の機能**: 8-24 時間
- **複雑な機能**: 24-80 時間
- **非機能要件**: 20-60 時間

## 🎯 ベストプラクティス

### 1. モジュール化

- メイン文書（business-requirements.json）は概要のみ
- 詳細は個別ファイル（stakeholders.json 等）に分割
- `$IMPORT`構文で参照

### 2. トレーサビリティ

- 要件間の依存関係を明記（dependencies）
- 関連要件を記入（relatedRequirements）
- ステークホルダーと要件を紐づけ

### 3. 測定可能性

- 受入基準は具体的に（例: 「速い」→「2 秒以内」）
- 成功指標には数値目標を設定
- テストケース ID を記入

### 4. 完全性

- すべての項目を埋める（不明な場合は「TBD」）
- 配列は最低 1 つの要素を含める
- オプショナルな項目も積極的に使用

### 5. 一貫性

- ID 命名規則を統一
- 用語を統一（glossary に記載）
- 同じ内容を複数箇所に書かない

## 🔍 チェックリスト

### business-requirements.json

- [ ] プロジェクト名と ID が記入されている
- [ ] 目的が 3 つ以上記入されている
- [ ] スコープ（含まれる/含まれない）が明確
- [ ] 制約条件が記入されている
- [ ] 成功指標が 2 つ以上定義されている
- [ ] 用語集が記入されている
- [ ] リスクが識別されている

### stakeholders.json

- [ ] 主要なステークホルダーが 3 名以上定義されている
- [ ] 各ステークホルダーのニーズが記入されている
- [ ] 成功基準が記入されている
- [ ] 優先度、影響力、関心度が評価されている

### use-cases.json

- [ ] 主要なユースケースが定義されている
- [ ] 主フロー（mainFlow）が 3 ステップ以上
- [ ] 事前条件・事後条件が記入されている
- [ ] 関連要件が記入されている

### functional-requirements.json

- [ ] 機能要件が 5 つ以上定義されている
- [ ] 各要件に受入基準が 2 つ以上
- [ ] 見積工数が記入されている
- [ ] ステークホルダーが紐づいている

### non-functional-requirements.json

- [ ] 主要な非機能要件（パフォーマンス、セキュリティなど）が定義されている
- [ ] 受入基準が測定可能な形で記述されている
- [ ] メトリクスの目標値が設定されている

## 📚 参考サンプル

完成した業務要件定義書のサンプルは `/examples/reservation-system/` を参照してください。

## 🤝 サポート

質問や問題がある場合は、Ukiyoue フレームワークのリポジトリで Issue を作成してください。

---

**良い要件定義を作成して、プロジェクトを成功させましょう！**
