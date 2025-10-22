# Tools - Ukiyoue Framework Validation Tools

このディレクトリは、Ukiyoue フレームワークのバリデーションツールを格納します。

## 📋 概要

Ukiyoue JSON ドキュメントの包括的な検証ツールを提供します:

1. **JSON Schema 検証** (ADR-002: Draft-07)
2. **トレーサビリティ参照整合性チェック** (FR-AUTO-002: link-checker)
3. **JSON-LD セマンティック検証** (ADR-003: JSON-LD 1.1)

## 🛠️ ツール一覧

### validate.ts

**包括的バリデーター** - 全ての検証機能を統合した CLI ツール

**機能**:

- JSON Schema Draft-07 による厳密な検証
- トレーサビリティ参照の整合性チェック（derivedFrom, satisfies, relatedDocuments 等）
- 循環参照の検出
- JSON-LD 1.1 コンプライアンス検証
- @context の展開可能性チェック
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

# 詳細出力
bun tools/src/validate.ts examples/ --verbose

# npm scripts経由
bun run validate examples/
```

**オプション**:

- `--skip-schema`: JSON Schema 検証をスキップ
- `--skip-references`: 参照整合性チェックをスキップ
- `--skip-jsonld`: JSON-LD 検証をスキップ
- `--allow-remote`: リモート @context の読み込みを許可（セキュリティ警告）
- `--schema <path>`: 明示的にスキーマファイルを指定
- `--verbose`: 詳細な検証結果を表示

**出力例**:

```text
🎨 Ukiyoue Framework Validator

📁 Found 3 JSON file(s)

🔨 Building document index...
✅ Indexed 3 document(s)

📄 Validating: project-charter.json
  🔍 JSON Schema validation...
  ✅ Schema validation passed
  🔗 Reference integrity validation...
  ✅ Reference validation passed
  🌐 JSON-LD validation...
  ✅ JSON-LD validation passed

============================================================
✅ All 3 file(s) validated successfully
```

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

**テストカバレッジ**: 60 tests (全て通過)

- **CLI統合テスト** (`validate.test.ts`): 26 tests
  - 引数解析、ファイル収集、検証オーケストレーション、出力フォーマット、エラーハンドリング
- **JSON Schema 検証** (`schema-validator.test.ts`): 9 tests
- **JSON-LD 検証** (`jsonld-validator.test.ts`): 16 tests
- **参照整合性チェック** (`reference-validator.test.ts`): 9 tests

**コードカバレッジ**:

| ファイル                                | 関数    | 行     | カバーされていない行 |
| --------------------------------------- | ------- | ------ | -------------------- |
| `src/validators/jsonld-validator.ts`    | 100.00% | 85.94% | 96-106, 156-161      |
| `src/validators/reference-validator.ts` | 100.00% | 94.70% | 42, 71, 73-78        |
| `src/validators/schema-validator.ts`    | 100.00% | 90.41% | 79, 125, 127-131     |
| **全体**                                | 100.00% | 90.35% | -                    |

カバーされていない行は主にエラーハンドリングや例外的なケースです。

**注**: `src/validate.ts` (CLIエントリーポイント) はサブプロセスとして実行されるため、
カバレッジレポートには含まれませんが、26個の統合テスト (`validate.test.ts`) で
間接的にテストされています。

## 🔧 技術仕様

- **ランタイム**: Bun (ADR-004)
- **言語**: TypeScript (strict mode)
- **JSON Schema**: ajv v8+ (Draft-07, ADR-002)
- **JSON-LD**: jsonld v8+ (JSON-LD 1.1, ADR-003)
- **フォーマット**: ajv-formats (uri, date-time 等)
- **出力**: chalk (カラフルな CLI 出力)

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
