# 来店予約システム - 業務要件定義書サンプル

このディレクトリには、Ukiyoueフレームワークを使用した業務要件定義書の完全なサンプルが含まれています。
レストラン、美容院、クリニックなどの来店予約システムを題材に、実際のプロジェクトで使用できるレベルの要件定義を示しています。

## 📋 概要

### プロジェクト概要
- **システム名**: 来店予約システム
- **目的**: 顧客の利便性向上と店舗運営の効率化
- **対象業種**: レストラン、美容院、クリニック等の予約が必要な店舗
- **主要機能**: 
  - 24時間オンライン予約
  - 予約変更・キャンセル
  - 店舗スタッフ向け予約管理
  - 予約枠設定
  - レポート機能

### スコープ
- **含まれる**: 予約登録、変更、キャンセル、一覧表示、予約枠設定、レポート
- **含まれない**: 通知機能（メール、SMS）、決済処理、会員管理、在庫管理、POS連携

## 📁 ファイル構成

このサンプルは、保守性と再利用性を考慮して複数のJSONファイルに分割されています。

```
reservation-system/
├── README.md                           # このファイル
├── business-requirements.json          # メイン文書（プロジェクト概要、制約、目標など）
├── stakeholders.json                   # ステークホルダー定義（6名）
├── use-cases.json                      # ユースケース定義（7件、フロー詳細含む）
├── functional-requirements.json        # 機能要件（25件の詳細要件）
└── non-functional-requirements.json    # 非機能要件（8件）
```

### ファイルの関係

`business-requirements.json`がメイン文書で、他のファイルを`$IMPORT`構文で参照しています：

```json
{
  "stakeholders": "$IMPORT(stakeholders.json)",
  "useCases": "$IMPORT(use-cases.json)",
  "requirements": {
    "functional": "$IMPORT(functional-requirements.json)",
    "nonFunctional": "$IMPORT(non-functional-requirements.json)"
  }
}
```

この構造により、以下のメリットがあります：
- 各ファイルが独立して編集可能
- 再利用性が高い（他のプロジェクトでステークホルダーのみ流用、など）
- GitHubでのレビューがしやすい（変更差分が明確）
- IDEでの編集がスムーズ（ファイルサイズが適切）

## 🎯 各ファイルの詳細

### business-requirements.json（148行）
メイン文書。プロジェクト全体の概要を記述します。

**主要セクション**:
- `@context`: JSON-LD 1.1コンテキスト（セマンティック情報）
- `projectOverview`: プロジェクトの背景、目的、スコープ
- `constraints`: 技術的制約、ビジネス制約、法的制約
- `successMetrics`: 成功指標（7つのKPI）
- `glossary`: 用語集（6用語）
- `assumptions`: 前提条件（4項目）
- `risks`: リスク（4項目、確率・影響度・対策含む）

### stakeholders.json（162行）
ステークホルダー定義。6つの役割を完全に定義しています。

**含まれるステークホルダー**:
1. **SH-CUSTOMER** - 顧客（エンドユーザー）
2. **SH-STAFF** - 店舗スタッフ
3. **SH-MANAGER** - 店舗管理者
4. **SH-SYSADMIN** - システム管理者
5. **SH-DEVELOPER** - 開発チーム
6. **SH-EXECUTIVE** - 経営層

各ステークホルダーには以下の情報が含まれます：
- ニーズ（needs）
- 成功基準（successCriteria）
- 優先度（priority）
- 影響力（influence）
- 関心度（interest）

### use-cases.json（485行）
ユースケース定義。7つのユースケースを完全なフロー付きで記述しています。

**含まれるユースケース**:
1. **UC-001** - 予約登録（12ステップ + 代替フロー2 + 例外フロー1）
2. **UC-002** - 予約変更（12ステップ + 代替フロー2）
3. **UC-003** - 予約キャンセル（10ステップ + 代替フロー1）
4. **UC-004** - 予約一覧確認（8ステップ + 代替フロー2）
5. **UC-005** - 予約ステータス更新（7ステップ）
6. **UC-006** - 予約枠設定（12ステップ + 代替フロー1）
7. **UC-007** - 予約レポート確認（9ステップ + 例外フロー1）

各ユースケースには以下が含まれます：
- 主フロー（mainFlow）：ステップバイステップの詳細
- 代替フロー（alternativeFlows）：分岐シナリオ
- 例外フロー（exceptionFlows）：エラー処理
- 事前条件・事後条件
- 関連要件へのリンク

### functional-requirements.json（1,365行）
機能要件定義。5つの主要機能と25の詳細要件を記述しています。

**含まれる機能要件**:
1. **FR-001** - 予約登録機能（6サブ要件、40時間）
2. **FR-002** - 予約変更・キャンセル機能（5サブ要件、30時間）
3. **FR-003** - 予約一覧表示機能（5サブ要件、35時間）
4. **FR-004** - 予約枠設定機能（5サブ要件、45時間）
5. **FR-005** - レポート機能（5サブ要件、40時間）

**合計見積もり工数**: 190時間

各要件には以下が含まれます：
- 受入基準（acceptanceCriteria）
- 依存関係（dependencies）
- 関連要件（relatedRequirements）
- ステークホルダー
- メトリクス
- 実装ノート
- テストケースID
- 見積工数

### non-functional-requirements.json
非機能要件定義。8つのカテゴリで品質要件を記述しています。

**含まれる非機能要件**:
1. **NFR-001** - パフォーマンス（応答時間、スループット）
2. **NFR-002** - 可用性（稼働率99.9%、バックアップ）
3. **NFR-003** - セキュリティ（暗号化、認証、ログ）
4. **NFR-004** - ユーザビリティ（レスポンシブ、アクセシビリティ、多言語）
5. **NFR-005** - 保守性（コード品質、テストカバレッジ80%）
6. **NFR-006** - 拡張性（マイクロサービス、API設計）
7. **NFR-007** - 信頼性（トランザクション、エラーハンドリング）
8. **NFR-008** - 互換性（既存システム連携、データ移行）

**合計見積もり工数**: 275時間

## 🔍 使い方

### 1. 閲覧

各JSONファイルはそのまま閲覧可能です。VS Codeなどのエディタで開くと、シンタックスハイライトとフォールディングで読みやすくなります。

### 2. バリデーション

Ukiyoueフレームワークのバリデーターで、スキーマ準拠を検証できます：

```bash
# バリデーターの実行（開発中）
cd /home/akring/ukiyoue/tools
bun run validate ../examples/reservation-system/business-requirements.json
```

### 3. セマンティック処理

JSON-LDコンテキストが含まれているため、セマンティック処理が可能です：

```typescript
import * as jsonld from 'jsonld';

// JSON-LDドキュメントの展開
const doc = await jsonld.expand(businessRequirements);

// トリプル化
const triples = await jsonld.toRDF(businessRequirements, {format: 'application/n-quads'});
```

### 4. カスタマイズ

このサンプルをベースに、自分のプロジェクト用にカスタマイズできます：

1. **ファイルをコピー**: `cp -r reservation-system my-project`
2. **内容を編集**: プロジェクト固有の情報に書き換え
3. **バリデーション**: スキーマに準拠しているか確認
4. **バージョン管理**: Gitで管理

## 📊 スキーマとの対応

各JSONファイルは、以下のスキーマに準拠しています：

| ファイル | スキーマ |
|---------|---------|
| business-requirements.json | `/schemas/types/business-requirements.schema.json` |
| stakeholders.json | `/schemas/components/stakeholder.schema.json` (配列) |
| use-cases.json | `/schemas/components/use-case.schema.json` (配列) |
| functional-requirements.json | `/schemas/components/requirement.schema.json` (配列) |
| non-functional-requirements.json | `/schemas/components/requirement.schema.json` (配列) |

すべてのスキーマは**JSON Schema Draft-07**形式で定義されています。

## 🌐 セマンティクスとの対応

すべてのJSONファイルは、以下のセマンティック定義を使用しています：

| セマンティック定義 | パス |
|------------------|------|
| Base Context | `/semantics/context.jsonld` |
| Document Vocabulary | `/semantics/vocabularies/document.jsonld` |
| Relationships Ontology | `/semantics/ontologies/relationships.jsonld` |

**JSON-LD 1.1**を使用しており、以下の機能を活用しています：
- `@version: 1.1`
- `@protected: true`
- `@import` (Schema.org、Dublin Core)

## 🎓 学習ポイント

このサンプルから学べること：

### 1. モジュール化設計
- メイン文書と詳細文書の分離
- `$IMPORT`構文による参照
- 各ファイルが独立して編集可能

### 2. 完全性
- 抜粋や省略なし、実務で使えるレベルの詳細度
- すべての要件に受入基準とテストケース
- ステークホルダーのニーズと成功基準を明記

### 3. トレーサビリティ
- 要件間の依存関係を明記
- ユースケースと要件の紐づけ
- ステークホルダーと要件の関連

### 4. 見積もり
- 各要件に工数見積もり（時間単位）
- 合計190時間（機能要件）+ 275時間（非機能要件）
- プロジェクト計画の基礎データ

### 5. リスク管理
- リスクの識別（4項目）
- 確率・影響度・対策の明記
- ステークホルダーへの影響分析

## 🔧 技術スタック（サンプルの想定）

このサンプルでは、以下の技術スタックを想定しています：

- **フロントエンド**: React、TypeScript、Tailwind CSS
- **バックエンド**: Bun、TypeScript、RESTful API
- **データベース**: PostgreSQL
- **インフラ**: AWS (EC2, RDS, S3)
- **認証**: bcrypt、セッション管理
- **セキュリティ**: HTTPS (TLS 1.3)、AES-256暗号化

## 📝 ライセンス

このサンプルはUkiyoueフレームワークの一部として提供されており、MITライセンスの下で自由に使用・改変できます。

## 🤝 貢献

このサンプルへのフィードバックや改善提案は、Ukiyoueフレームワークのリポジトリで受け付けています。

## 📚 関連ドキュメント

- [Ukiyoueフレームワーク仕様](/specs/concept.md)
- [スキーマ定義](/schemas/README.md)
- [セマンティクス定義](/semantics/README.md)
- [従来のMarkdown版要件定義](/specs/business-requirements/reservation-system.md)

---

**このサンプルが、あなたのプロジェクトの要件定義作業の助けになれば幸いです！**
