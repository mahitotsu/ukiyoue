# Ukiyoue Framework Tools

Ukiyoueフレームワーク用のCLIツール群 - バリデーション、リンクチェック、ドキュメント処理

## 📋 概要

**目的**: JSON形式のドキュメントの妥当性検証と品質管理を自動化

## 📁 構成

```
tools/
├── README.md              # このファイル
├── TOOLS_USAGE.md         # 詳細な使用方法
├── package.json           # プロジェクト定義
├── tsconfig.json          # TypeScript設定
├── bun.lock               # 依存関係ロック
└── src/
    ├── cli.ts             # CLIエントリポイント
    └── commands/
        ├── validate.ts    # バリデーションツール
        └── check-links.ts # リンクチェックツール
```

## 🛠️ 実装済みツール

### 1. Validation Tool (`validate`)

JSON Schema Draft-07による構造検証

**機能**:

- ✅ JSON Schemaによる厳密な検証（Ajv使用）
- ✅ スキーマの自動検出（`type`フィールド、ファイル名パターン）
- ✅ 配列データの自動検出と各要素の検証
- ✅ 依存スキーマの自動読み込み（`$ref`解決）
- ✅ 詳細なエラー出力（--verboseオプション）

**使用例**:

```bash
# 基本的な検証（スキーマ自動検出）
bun run src/cli.ts validate ../examples/reservation-system/stakeholders.json

# カスタムスキーマを指定
bun run src/cli.ts validate my-doc.json --schema ../schemas/custom.schema.json

# 詳細出力
bun run src/cli.ts validate my-doc.json --verbose
```

**スキーマ自動検出ルール**:

1. `type`または`@type`フィールドで判定
   - `BusinessRequirements` → `types/business-requirements.schema.json`
   - `Stakeholder` → `components/stakeholder.schema.json`
   - `Requirement` → `components/requirement.schema.json`
   - `UseCase` → `components/use-case.schema.json`
2. ファイル名パターンで判定
   - `stakeholders.json` → stakeholder schema
   - `use-cases.json` → use-case schema
   - `*requirements*.json` → requirement schema
3. フォールバック → `document-base.schema.json`

### 2. Link Checking Tool (`check-links`)

ドキュメント間のクロスリファレンス検証

**機能**:

- ✅ ID参照の存在確認（SH-_, UC-_, FR-_, NFR-_）
- ✅ 再帰的ディレクトリスキャン
- ✅ 複数の関連フィールドに対応
- ✅ 壊れたリンクの詳細レポート

**使用例**:

```bash
# ディレクトリ内の全リンクをチェック
bun run src/cli.ts check-links ../examples/reservation-system

# 詳細出力
bun run src/cli.ts check-links ../examples/reservation-system --verbose
```

**チェック対象フィールド**:

- `stakeholders`, `stakeholderIds`, `relatedStakeholders`
- `useCaseIds`, `relatedUseCases`
- `dependencies`, `relatedRequirements`
- `implements`, `dependsOn`, `relatedTo`, `conflicts`

**出力例**:

```
✓ All links are valid
```

または壊れたリンクがある場合:

```
✗ Found 3 broken links

/path/to/file.json
  stakeholderIds[0]: stakeholder "SH-INVALID" not found
  requirementIds[1]: requirement "FR-999" not found
```

## 🚀 セットアップ

### インストール

```bash
cd tools
bun install
```

### 動作確認

```bash
# Validation test
bun run src/cli.ts validate ../examples/reservation-system/stakeholders.json

# Link checking test
bun run src/cli.ts check-links ../examples/reservation-system
```

### ビルド（オプション）

```bash
bun run build
```

## 💻 技術スタック

```yaml
runtime: Bun v1.0+
language: TypeScript (strict mode)
dependencies:
  - ajv: "^8.17.1" # JSON Schema validation (Draft-07)
  - ajv-formats: "^3.0.1" # Format validation
  - commander: "^12.1.0" # CLI framework
  - chalk: "^5.6.2" # Terminal colors
devDependencies:
  - "@types/bun": latest
  - typescript: "^5.6.3"
```

## 📊 検証実績

**来店予約システム（Reservation System）の例**:

- ✅ stakeholders.json - 6件のステークホルダー
- ✅ use-cases.json - 8件のユースケース
- ✅ functional-requirements.json - 45件の機能要件
- ✅ non-functional-requirements.json - 8件の非機能要件
- ✅ クロスリファレンス - 137件の参照を検証

## � トラブルシューティング

### 検証エラー: "must be array"

**原因**: メインのbusiness-requirements.jsonは`$IMPORT(file.json)`構文を使用

**解決策**: 各モジュールファイルを個別に検証

```bash
# メインファイルではなく
# bun run src/cli.ts validate business-requirements.json

# 各モジュールを検証
bun run src/cli.ts validate stakeholders.json
bun run src/cli.ts validate use-cases.json
bun run src/cli.ts validate functional-requirements.json
```

### スキーマ解決エラー

**解決策**: ツールが自動的に`schemas/`ディレクトリから依存スキーマを読み込みます。以下を確認:

1. スキーマファイルが正しい場所にある（`schemas/components/`, `schemas/types/`）
2. `$id`フィールドが期待されるURIと一致
3. `$ref`パスが正しい

## 📚 詳細ドキュメント

詳しい使用方法は [TOOLS_USAGE.md](./TOOLS_USAGE.md) を参照してください。

## 🗺️ 今後の実装予定

**完了済み** (Phase 1):

- ✅ JSON Schema validator（Ajv使用、Draft-07対応）
- ✅ Link checker（クロスリファレンス検証）
- ✅ Basic CLI（Commander.js使用）

**次期実装** (Phase 2):

- ⏳ Statistics tool（ドキュメントメトリクス、要件数集計）
- ⏳ Markdown generator（JSON → Markdown変換）
- ⏳ Template generator（新規ドキュメントスカフォールド）
- ⏳ $IMPORT resolver（バリデーション時の動的解決）

**将来実装** (Phase 3):

- 📋 Quality analyzer（品質スコア算出）
- 📋 Impact analyzer（影響範囲分析）
- 📋 Semantic search（セマンティック検索）
- 📋 Dependency graph（依存関係可視化）

## 📝 変更履歴

### v0.1.0 (2025-10-17)

**実装**:

- Validation tool（JSON Schema検証）
- Link-checking tool（クロスリファレンス検証）
- CLI framework（Commander.js）

**修正**:

- スキーマの正規表現パターン修正（不要なエスケープ除去）
- スキーマ重複読み込み問題の修正
- リンクチェックのフィールド対応拡充（137件の参照を検証可能）

**ドキュメント**:

- TOOLS_USAGE.md追加（詳細な使用方法）
- README.md更新（実装状況反映）

## 🤝 貢献

このツールはUkiyoueフレームワークの一部です。

**開発ポリシー**:

- TypeScript strict mode必須
- Bunランタイム使用（Node.jsではない）
- JSON Schema Draft-07準拠
- JSON-LD 1.1対応
- Git履歴でバージョン管理（手動メタデータ不要）

## 📄 ライセンス

MIT
