# Tools - Ukiyoue Framework Validation Tools

このディレクトリは、Ukiyoue フレームワークのバリデーションツールを格納します。

## 📋 概要

Ukiyoue JSON ドキュメントの包括的な検証ツールを提供します:

1. **JSON Schema 検証** (ADR-002: Draft-07) - フィールド構造の検証
2. **トレーサビリティ参照整合性チェック** (FR-AUTO-002: link-checker) - 参照IDの存在と型の検証
3. **JSON-LD セマンティック検証** (ADR-003: JSON-LD 1.1) - セマンティック構文の検証
4. **SHACL 検証** (ADR-008: 多層検証戦略) - グラフ全体の整合性と型制約の検証（オプション）

## 🛠️ ツール一覧

### validate.ts

**包括的バリデーター** - 全ての検証機能を統合した CLI ツール

**機能**:

- JSON Schema Draft-07 による厳密な検証
- トレーサビリティ参照の整合性チェック（derivedFrom, satisfies, relatedDocuments, affectedArtifacts, relatedDecisions 等）
- 参照される成果物の型チェック（artifact-input-rules.json）
- 循環参照の検出
- JSON-LD 1.1 コンプライアンス検証
- @context の展開可能性チェック
- **SHACL 検証**（オプション、--full-validation）: RDF グラフ全体の整合性と型制約の検証
- セキュリティ: リモートコンテキストの読み込みをデフォルトで無効化

**使用方法**:

```bash
# 単一ドキュメントの検証（全チェック）
bun tools/src/validate.ts examples/project-charter.json

# ディレクトリ内の全ドキュメントを検証
bun tools/src/validate.ts examples/

# JSON Schema 検証のみ（他をスキップ）
bun tools/src/validate.ts examples/project-charter.json --skip-references --skip-jsonld

# 明示的にスキーマを指定
bun tools/src/validate.ts examples/project-charter.json --schema schemas/layer1/project-charter.json

# JSON-LD 検証をスキップ
bun tools/src/validate.ts examples/ --skip-jsonld

# フル検証（SHACL含む、CI/CD推奨）
bun tools/src/validate.ts examples/ --full-validation

# 詳細出力
bun tools/src/validate.ts examples/ --verbose

# npm scripts経由
bun run validate examples/
```

**オプション**:

- `--skip-schema`: JSON Schema 検証をスキップ
- `--skip-references`: 参照整合性チェックをスキップ
- `--skip-jsonld`: JSON-LD 検証をスキップ
- `--skip-shacl`: SHACL 検証をスキップ（--full-validation 使用時）
- `--full-validation`: 全ての検証を有効化（SHACL含む、遅いがCI/CD推奨）
- `--allow-remote`: リモート @context の読み込みを許可（セキュリティ警告）
- `--schema <path>`: 明示的にスキーマファイルを指定
- `--verbose`: 詳細な検証結果を表示

**出力例**:

```text
🎨 Ukiyoue Framework Validator

📁 Found 3 JSON file(s)

🔨 Building document index...
✅ Indexed 3 document(s)

⚠️  Full validation mode: SHACL validation enabled (slower, graph-wide integrity)
   Project root: /path/to/examples

📄 Validating: project-charter.json
  🔍 JSON Schema validation...
  ✅ Schema validation passed
  🔗 Reference integrity validation...
  ✅ Reference validation passed
  🌐 JSON-LD validation...
  ✅ JSON-LD validation passed
  📊 SHACL validation...
  ✅ SHACL validation passed

============================================================
✅ All 3 file(s) validated successfully
```

**検証戦略の推奨**:

- **ファイル保存時**: Stage 1-2（Schema + Reference）- 高速
- **コミット前**: Stage 1-3（Schema + Reference + JSON-LD）- 標準
- **CI/CD**: Stage 1-4（--full-validation でSHACL含む）- 完全

## 📦 インストール

```bash
cd tools
bun install
```

## 🧪 テスト

```bash
cd tools
bun test

# カバレッジ付きテスト実行
bun test --coverage

# カバレッジレポート生成（LCOV形式）
bun run test:coverage:report

# 特定のテストファイルのみ実行
bun test test/validators/reference-validator.test.ts
```

**テストカバレッジ**: 137 tests (全て通過)

- **CLI統合テスト** (`validate.test.ts`): 39 tests
  - 引数解析、ファイル収集、検証オーケストレーション、出力フォーマット
  - エラーハンドリング、複数ファイル処理、パフォーマンステスト
- **JSON Schema 検証** (`schema-validator.test.ts`): 23 tests
  - 基本検証、フォーマット検証（uri, date-time, email）
  - $ref解決、検証オプション、複雑なネストスキーマ、エラーハンドリング
- **JSON-LD 検証** (`jsonld-validator.test.ts`): 29 tests
  - 基本検証、コンテキスト配列、複数@type、@id/@type組み合わせ
  - コンテキスト検証、展開検証、@protected、@language
- **参照整合性チェック** (`reference-validator.test.ts`): 22 tests
  - 基本参照検証、循環参照検出、自己参照、空配列/null/undefined処理
  - 深い循環参照、複数経路循環、全参照フィールドタイプ、ドキュメントインデックス
- **参照型チェック** (`reference-validator-types.test.ts`): 13 tests
  - 成果物間の型制約検証（artifact-input-rules.json）
  - User Story → Business Goal、Risk Register affectedArtifacts、ADR relatedDecisions
- **SHACL 検証** (`shacl-validator.test.ts`): 11 tests
  - RDF グラフ生成、型制約、derivedFrom 制約
  - Risk Register/ADR の特殊ケース（derivedFrom不要）

**コードカバレッジ**:

| ファイル                                | 関数    | 行     | カバーされていない行 |
| --------------------------------------- | ------- | ------ | -------------------- |
| `src/validators/jsonld-validator.ts`    | 100.00% | 85.94% | 96-106, 156-161      |
| `src/validators/reference-validator.ts` | 100.00% | 99.34% | -                    |
| `src/validators/schema-validator.ts`    | 100.00% | 98.63% | -                    |
| **全体**                                | 100.00% | 94.64% | -                    |

カバーされていない行は主にエラーハンドリングや例外的なケースです。

**注**: `src/validate.ts` (CLIエントリーポイント) はサブプロセスとして実行されるため、
カバレッジレポートには含まれませんが、39個の統合テスト (`validate.test.ts`) で
間接的にテストされています。

**テストの網羅性**:

- ✅ FR-AUTO-002 (自動バリデーション): 全ての検証機能をテスト
- ✅ ADR-002 (JSON Schema Draft-07): フォーマット検証、$ref解決、オプション
- ✅ ADR-003 (JSON-LD 1.1): コンテキスト、展開、1.1機能
- ✅ ADR-008 (多層検証戦略): SHACL検証、型制約、グラフ整合性
- ✅ 参照整合性: 循環検出、欠落検出、全参照フィールドタイプ、型チェック
- ✅ エラーハンドリング: 不正入力、ファイルエラー、パースエラー
- ✅ エッジケース: null/undefined、空配列、自己参照、深いネスト
- ✅ 特殊成果物: Risk Register/ADR（derivedFrom不要、個別フィールド検証）

## 🔧 技術仕様

- **ランタイム**: Bun (ADR-004)
- **言語**: TypeScript (strict mode)
- **JSON Schema**: ajv v8+ (Draft-07, ADR-002)
- **JSON-LD**: jsonld v8+ (1.1, ADR-003)
- **SHACL**: rdf-validate-shacl v0.6+ (W3C SHACL, ADR-008)
- **RDF処理**: N3.js v1.26+ (Turtle/RDF)
- **JSON-LD**: jsonld v8+ (JSON-LD 1.1, ADR-003)
- **フォーマット**: ajv-formats (uri, date-time 等)
- **出力**: chalk (カラフルな CLI 出力)
- **Linter**: ESLint 9.38+ with typescript-eslint 8.46+
- **Formatter**: Prettier 3.3+

## 🧪 開発ワークフロー

### テスト実行

```bash
# 全テストを実行
bun run test

# カバレッジレポート付きで実行
bun run test:coverage:report

# 現在の統計:
# - 113 tests (226 expect() calls)
# - 94.64% line coverage
# - 100% function coverage
```

### コード品質チェック

```bash
# TypeScript型チェック
bun run typecheck

# ESLintでコードチェック（警告許容）
bun run lint

# ESLintで自動修正
bun run lint:fix

# Prettierでフォーマット
bun run format

# フォーマットチェック（CI用）
bun run format:check

# 全チェックを一括実行（typecheck + lint + format + test）
bun run check
```

### プリコミットフック

lint-staged と Husky により、コミット前に自動的に以下を実行:

- TypeScript 型チェック
- ESLint による静的解析
- Prettier による自動整形

### テストカバレッジ詳細

| ファイル                      | 行カバレッジ | 関数カバレッジ | 分岐カバレッジ |
| ----------------------------- | ------------ | -------------- | -------------- |
| schema-validator.ts           | 98.63%       | 100%           | 100%           |
| reference-validator.ts        | 99.34%       | 100%           | 97.56%         |
| jsonld-validator.ts           | 85.94%       | 100%           | 75.00%         |
| **全体**                      | **94.64%**   | **100%**       | **91.07%**     |
| validate.ts (CLI, 統合テスト) | (実測対象外) | -              | -              |

**注**: validate.ts は CLI エントリポイントのためサブプロセスで実行され、カバレッジ計測対象外。代わりに 39 件の統合テストでエンドツーエンドの動作を保証。

## 📁 ディレクトリ構造

```text
tools/
├── src/
│   ├── validate.ts              # 統合バリデーター CLI
│   ├── validators/
│   │   ├── schema-validator.ts     # JSON Schema 検証
│   │   ├── reference-validator.ts  # 参照整合性チェック
│   │   └── jsonld-validator.ts     # JSON-LD 検証
│   └── types/
│       └── jsonld.d.ts          # jsonld 型定義
├── test/
│   ├── validators/
│   │   ├── schema-validator.test.ts
│   │   ├── reference-validator.test.ts
│   │   └── jsonld-validator.test.ts
│   └── fixtures/
│       ├── project-charter.json
│       └── invalid.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 要件対応

| 要件 ID     | コンポーネント       | 実装状況 |
| ----------- | -------------------- | -------- |
| FR-AUTO-002 | schema-validator     | ✅ 完了  |
| FR-AUTO-002 | link-checker         | ✅ 完了  |
| FR-AUTO-002 | metadata-validator   | ✅ 完了  |
| ADR-002     | JSON Schema Draft-07 | ✅ 完了  |
| ADR-003     | JSON-LD 1.1          | ✅ 完了  |
| ADR-004     | TypeScript + Bun     | ✅ 完了  |

## 📚 関連ドキュメント

- [specs/requirements.md](../specs/requirements.md) - FR-AUTO-002 自動バリデーション
- [schemas/README.md](../schemas/README.md) - JSON Schema 定義
- [semantics/README.md](../semantics/README.md) - JSON-LD コンテキスト
- [ADR-002](../specs/architecture-decisions/002-json-schema-draft-version.md) - JSON Schema Draft 版
- [ADR-003](../specs/architecture-decisions/003-json-ld-version.md) - JSON-LD 1.1 採用
- [ADR-004](../specs/architecture-decisions/004-tool-implementation-language.md) - TypeScript + Bun

## � 未実装機能（Phase 2+）

- [ ] consistency-checker: 用語の一貫性チェック
- [ ] CI/CD 統合サンプル（GitHub Actions）
- [ ] バッチレポート生成（JSON/HTML）
- [ ] VS Code Extension による統合
