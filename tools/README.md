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
   - `Actor` → `components/actor.schema.json`
2. ファイル名パターンで判定
   - `stakeholders.json` → stakeholder schema
   - `actors.json` → actor schema
   - `use-cases.json` → use-case schema
   - `*requirements*.json` → requirement schema
3. フォールバック → `document-base.schema.json`

---

### 2. Link Checking Tool (`check-links`)

ドキュメント間のクロスリファレンス検証

**機能**:

- ✅ ID参照の存在確認（SH-xxx, ACT-xxx, UC-xxx, FR-xxx, NFR-xxx）
- ✅ 再帰的ディレクトリスキャン
- ✅ 複数の関連フィールドに対応
- ✅ $REF形式の参照検証
- ✅ 壊れたリンクの詳細レポート

**使用例**:

```bash
# ディレクトリ内の全リンクをチェック
bun run src/cli.ts check-links ../examples/reservation-system

# 詳細出力
bun run src/cli.ts check-links ../examples/reservation-system --verbose
```

**チェック対象フィールド**:

- `stakeholders`, `stakeholderIds`, `actors`, `relatedStakeholders`
- `actor`, `useCaseIds`, `relatedUseCases`
- `dependencies`, `relatedRequirements`
- `preconditions` (with $REF support)
- `implements`, `dependsOn`, `relatedTo`, `conflicts`

**出力例**:

```
Found 6 stakeholders
Found 4 actors
Found 11 use cases
Found 53 requirements
Found 194 references

✓ All links are valid
```

または壊れたリンクがある場合:

```
✗ Found 3 broken links

/path/to/file.json
  stakeholderIds[0]: stakeholder "SH-INVALID" not found
  requirementIds[1]: requirement "FR-999" not found
```

---

## 3. Consistency Checking Tool (`consistency-check`) 🆕

Phase 1 implementation providing automated content quality validation beyond structural JSON Schema validation.

**Pre-commit Integration**: This tool is automatically run as part of the pre-commit hook to ensure content quality before each commit.

**機能**:

- ✅ **完全性チェック**:
  - ユースケースにrelatedRequirementsがあるか
  - 要件にacceptanceCriteriaがあるか（info）
  - Critical要件にtestCasesがあるか（warning）
- ✅ **命名規則チェック**:
  - 用語の統一性（「予約登録」vs「予約作成」など）
  - タイトル・説明の長さ（短すぎる場合warning）
  - 曖昧な表現の検出（「なるべく」「適切に」など）
- ✅ **メトリクス妥当性チェック**:
  - 数値基準がある要件にmetricsフィールドがあるか
  - 単位の一貫性（秒 vs ミリ秒）
  - 見積工数と受入基準数の妥当性
  - 優先度とメトリクスの厳しさの整合性
- ✅ **未使用エンティティ検出**:
  - アクターが使われていない
  - ステークホルダーにアクターがない（info）
- ✅ **循環依存検出**:
  - ユースケースの前提条件の循環参照

**使用例**:

```bash
# ディレクトリ内の整合性チェック
bun run src/cli.ts consistency-check ../examples/reservation-system

# 詳細出力（情報レベルのメッセージも表示）
bun run src/cli.ts consistency-check ../examples/reservation-system --verbose
```

**出力例**:

```
Checking consistency in: /path/to/project

Found 6 stakeholders
Found 4 actors
Found 11 use cases
Found 53 requirements

⚠ Found 19 warnings

Completeness
  ⚠ Critical requirement "FR-001-01" has no test cases (file.json)
  ⚠ Critical requirement "FR-007" has no test cases (file.json)

Naming Convention
  ⚠ Requirement "NFR-002" has a very short title (3 chars) (file.json)
  ⚠ Requirement "NFR-005" has vague term "適切に" in acceptance criteria (file.json)

Metrics Validity
  ⚠ Requirement "FR-001-06" has numeric criteria but no metrics field (file.json)

ℹ Found 2 informational items

Stakeholder Without Actor Role
  ℹ Stakeholder "SH-DEVELOPER" has no actor roles (does not directly interact with the system) (file.json)

These are warnings only. Commit is allowed.
```

**Issue Levels**:

- `error`: コミット阻止（exit code 1）
- `warning`: 警告表示、コミット許可（exit code 0）
- `info`: 情報表示、`--verbose`で表示

---

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

## 📚 詳細ドキュメント

詳しい使用方法は [TOOLS_USAGE.md](./TOOLS_USAGE.md) を参照してください。
