# Tools - Ukiyoue Framework Validation Tools

このディレクトリは、Ukiyoue フレームワークのバリデーションツールを格納します。

## 📋 概要

JSON Schema と JSON-LD の検証ツールを提供します。

## 🛠️ ツール一覧

### validate-minimal.ts

最小限の JSON Schema バリデーター。サンプルドキュメント作成時の即座の検証に使用。

**機能**:

- JSON Schema Draft-07 による厳密な検証
- 全エラーの詳細表示
- カラフルな出力

**使用方法**:

```bash
# プロジェクトルートから
bun tools/src/validate-minimal.ts \
  schemas/layer1/project-charter.json \
  examples/templates/project-charter.json

# tools ディレクトリから
cd tools
bun src/validate-minimal.ts \
  ../schemas/layer1/project-charter.json \
  ../examples/templates/project-charter.json
```

**出力例**:

```text
📋 Loading schema...
✅ Schema loaded: project-charter.json
📄 Loading document...
✅ Document loaded: project-charter.json
🔍 Validating...

✅ Valid
Document conforms to schema
```

**エラー例**:

```text
❌ Validation errors:

[Error 1]
  Path:     /title
  Message:  must be string
  Params:   {"type":"string"}
  Keyword:  type

Total errors: 1
```

## 📦 インストール

```bash
cd tools
bun install
```

## 🔧 技術仕様

- **ランタイム**: Bun
- **JSON Schema バリデーター**: ajv v8.17.1
- **設定**: `allErrors: true`, `strict: true`, `verbose: true`

## 📚 関連ドキュメント

- [schemas/README.md](../schemas/README.md) - JSON Schema 定義
- [ADR-002: JSON Schema Draft 版の選定](../specs/design-decisions/002-json-schema-draft-version.md)
- [ADR-004: ツール実装言語とランタイムの選定](../specs/design-decisions/004-tool-implementation-language.md)

## 🚀 今後の拡張

将来的には以下の機能を追加予定：

- [ ] JSON-LD 検証（jsonld.js）
- [ ] トレーサビリティ整合性チェック
- [ ] CLI インターフェース（commander）
- [ ] バッチ検証（複数ファイル）
- [ ] CI/CD 統合（GitHub Actions）
