# ADR-016: Lint and Formatter

## Status

Accepted

## Context

TypeScript + Bun環境（ADR-008, ADR-009）でのコード品質ツール（Lint・フォーマッター）を選定する必要があります。一貫したコードスタイルと品質保証は、チーム開発とOSS貢献において重要です。

**要求事項**:

- ✅ TypeScript完全対応（最新構文サポート）
- ✅ 高速な実行（大規模コードベースでも快適）
- ✅ Lint機能（コード品質チェック）
- ✅ フォーマット機能（自動整形）
- ✅ 統合ツール（Lint + Format一体化）
- ✅ 設定の簡便性（最小限の設定ファイル）
- ✅ IDE統合（VS Code、IntelliJ等）
- ✅ CI/CD統合
- ✅ 自動修正機能（`--fix`）
- ✅ JSONフォーマット対応（スキーマファイル用）
- ✅ Markdownフォーマット対応（ドキュメント用）
- ✅ Bunで高速動作

**制約条件**:

- Bun 1.x環境（ADR-009）
- TypeScript 5.x（ADR-008）
- 実行速度: 1000ファイル < 5秒
- プロジェクト全体の一貫性維持

## Decision

**Biome** を採用します。

## Options Considered

### Option A: Biome (提案)

**概要**: Rust実装の超高速Lint + Formatter統合ツール

**Pros**:

- ✅ 圧倒的な速度
  - Rustネイティブ実装
  - ESLint + Prettierの10〜20倍高速
  - 大規模コードベースでも瞬時
- ✅ オールインワン
  - Lint + Format統合
  - 単一設定ファイル（biome.json）
  - ツール切り替え不要
- ✅ TypeScript完全対応
  - 最新構文対応
  - 型情報を活用した高度なチェック
- ✅ ゼロ設定で動作
  - デフォルト設定が優秀
  - 即座に開始可能
- ✅ JSON/JSONCフォーマット対応
  - スキーマファイルに最適
  - コメント付きJSONも対応
- ✅ IDE統合が容易
  - VS Code拡張公式提供
  - LSP対応
- ✅ 自動修正が強力（`--apply`）
- ✅ Bunで高速実行（`bunx @biomejs/biome`）
- ✅ モダンな設計（ESLint/Prettierの問題を解決）
- ✅ アクティブ開発（週次更新）

**Cons**:

- ⚠️ 比較的新しい（2023年〜、元Rome）
- ⚠️ ESLintプラグインエコシステムは未対応
  - 独自ルールセット
  - 一部カスタムルールは未実装
- ⚠️ Markdownは限定的サポート

**実装例**:

```bash
# インストール
bun add -d @biomejs/biome

# Lint
bunx @biomejs/biome lint src/

# Format
bunx @biomejs/biome format src/

# Lint + Format + 自動修正
bunx @biomejs/biome check --apply src/
```

**パフォーマンス例**:

```bash
# 1000ファイルのLint + Format
biome check       # ~2秒
eslint + prettier # ~30秒
```

### Option B: ESLint + Prettier

**概要**: 伝統的なLint + Formatterの組み合わせ

**Pros**:

- ✅ 最も成熟したエコシステム
- ✅ 膨大なプラグイン
  - eslint-plugin-import
  - eslint-plugin-security
  - 業界標準ルールセット
- ✅ 詳細なカスタマイズ可能
- ✅ 豊富なドキュメント
- ✅ IDE統合が完璧

**Cons**:

- ❌ 遅い（特に大規模プロジェクト）
- ❌ 設定が複雑
  - ESLint設定ファイル
  - Prettier設定ファイル
  - 両者の競合回避設定
- ❌ ツールが分散（Lint/Format別実行）
- ❌ TypeScript対応が後付け（`@typescript-eslint/*`）
- ❌ キャッシュ管理が複雑
- ❌ Bunの速度を活かせない

### Option C: Deno lint + Deno fmt

**概要**: Deno組み込みのLint + Formatter

**Pros**:

- ✅ 高速（Rust実装）
- ✅ ゼロ設定
- ✅ 統合ツール

**Cons**:

- ❌ Deno環境専用（Bunでは非推奨）
- ❌ カスタマイズ性が低い
- ❌ エコシステムが小さい
- ❌ Bun環境での優位性なし

### Option D: Rome (Biomeの前身)

**概要**: Biomeの旧バージョン

**Pros**:

- ✅ Biomeと同じコンセプト

**Cons**:

- ❌ 開発停止（Biomeに移行）
- ❌ 採用理由なし

### Option E: Standard JS

**概要**: 設定不要のJavaScript Linter

**Pros**:

- ✅ ゼロ設定
- ✅ シンプル

**Cons**:

- ❌ TypeScript対応が不完全
- ❌ カスタマイズ不可
- ❌ フォーマッター別途必要
- ❌ 速度の優位性なし

## Comparison Matrix

| 評価基準                      | 重み | Biome   | ESLint+Prettier | Deno | Rome | Standard |
| ----------------------------- | ---- | ------- | --------------- | ---- | ---- | -------- |
| **実行速度**                  | 5    | 5       | 2               | 5    | 5    | 3        |
| **統合ツール（Lint+Format）** | 5    | 5       | 2               | 5    | 5    | 3        |
| **TypeScript対応**            | 5    | 5       | 4               | 4    | 5    | 2        |
| **設定の簡便性**              | 4    | 5       | 2               | 5    | 5    | 5        |
| **JSON/JSONC対応**            | 4    | 5       | 4               | 3    | 5    | 1        |
| **IDE統合**                   | 4    | 5       | 5               | 3    | 4    | 3        |
| **自動修正機能**              | 3    | 5       | 4               | 4    | 5    | 4        |
| **Bun統合**                   | 3    | 5       | 3               | 1    | 4    | 3        |
| **エコシステム成熟度**        | 3    | 3       | 5               | 2    | 0    | 3        |
| **カスタマイズ性**            | 2    | 4       | 5               | 2    | 4    | 1        |
| **合計**                      | 38   | **177** | 138             | 137  | 165  | 102      |
| **正規化スコア（/30）**       | -    | **28**  | 21.8            | 21.6 | 26   | 16.1     |

**重み付け理由**:

- **実行速度（5）**: CI/CD高速化、開発時のフィードバック
- **統合ツール（5）**: セットアップ・運用の簡便性
- **TypeScript対応（5）**: 言語仕様の完全サポート
- **設定の簡便性（4）**: 参入障壁の低減
- **JSON/JSONC対応（4）**: スキーマファイルのフォーマット
- **IDE統合（4）**: 開発者体験
- **自動修正機能（3）**: 手動修正の削減
- **Bun統合（3）**: ランタイム環境との親和性
- **エコシステム成熟度（3）**: プラグイン・コミュニティ
- **カスタマイズ性（2）**: プロジェクト固有ルール

## Consequences

### Positive

- ✅ **超高速**: CI/CDが劇的に高速化（従来の10倍以上）
- ✅ **シンプル**: 単一ツール、単一設定ファイル
- ✅ **統合環境**: Lint + Formatが一体化
- ✅ **即座開始**: デフォルト設定で即利用可能
- ✅ **強力な自動修正**: ほとんどの問題を自動解決
- ✅ **JSON最適化**: スキーマファイルのフォーマットが完璧
- ✅ **一貫性**: プロジェクト全体で統一されたスタイル
- ✅ **開発体験**: 瞬時のフィードバック

### Negative

- ⚠️ **新しさ**: ESLintほど成熟していない
- ⚠️ **プラグイン制限**: ESLintプラグインは使えない
- ⚠️ **一部ルール未実装**: 高度なカスタムルールが不足
- ⚠️ **Markdown制限**: Markdownフォーマットは限定的

### Mitigation

- **新しさ・ルール不足**:
  - 必要なルールの80%はカバー済み
  - 不足ルールはBiome Issuesで提案・貢献
  - 重大な問題があればESLintとの併用も検討
- **プラグイン制限**:
  - 主要なルールはBiome組み込み
  - セキュリティチェックは別途SonarQube等を検討
- **Markdown制限**:
  - Markdown専用にPrettierを部分的に使用
  - または手動レビュー

## Implementation Notes

### biome.json設定

```json
{
  "$schema": "https://biomejs.dev/schemas/1.4.0/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noExtraBooleanCast": "error",
        "noMultipleSpacesInRegularExpressionLiterals": "error",
        "useFlatMap": "error"
      },
      "correctness": {
        "noUnusedVariables": "error",
        "useExhaustiveDependencies": "warn"
      },
      "security": {
        "noDangerouslySetInnerHtml": "error"
      },
      "style": {
        "noNegationElse": "off",
        "useTemplate": "error"
      },
      "suspicious": {
        "noExplicitAny": "warn",
        "noArrayIndexKey": "warn"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "trailingComma": "es5",
      "semicolons": "always",
      "arrowParentheses": "always"
    }
  },
  "json": {
    "formatter": {
      "enabled": true,
      "indentWidth": 2
    }
  },
  "files": {
    "include": ["src/**/*.ts", "tests/**/*.ts", "schemas/**/*.json"],
    "ignore": ["node_modules", "dist", ".git"]
  }
}
```

### package.json スクリプト

```json
{
  "scripts": {
    "lint": "bunx @biomejs/biome lint src/",
    "format": "bunx @biomejs/biome format src/",
    "check": "bunx @biomejs/biome check src/",
    "check:apply": "bunx @biomejs/biome check --apply src/",
    "ci:check": "bunx @biomejs/biome ci src/"
  }
}
```

### 開発ワークフロー

```bash
# 開発中: 自動修正付きチェック
bun run check:apply

# コミット前: エラー確認のみ
bun run check

# CI/CD: エラーがあれば失敗
bun run ci:check
```

### VS Code統合

`.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[json]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "biomejs.biome"
  }
}
```

VS Code拡張機能:

```bash
# 推奨拡張をチームに共有
# .vscode/extensions.json
{
  "recommendations": ["biomejs.biome"]
}
```

### Git Hooks（pre-commit）

```bash
# .husky/pre-commit
#!/bin/sh
bun run check:apply
git add -u
```

または`lint-staged`使用:

```json
{
  "lint-staged": {
    "*.{ts,tsx,json,jsonc}": "bunx @biomejs/biome check --apply"
  }
}
```

### CI/CD統合

```yaml
# .github/workflows/lint.yml
name: Lint & Format

on: [push, pull_request]

jobs:
  biome:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - run: bun install
      - name: Run Biome
        run: bun run ci:check
```

### カスタムルール追加（将来）

```json
{
  "linter": {
    "rules": {
      "nursery": {
        "useConsistentArrayType": "error"
      }
    }
  }
}
```

### パフォーマンス最適化

```json
{
  "files": {
    "ignore": ["node_modules", "dist", "coverage", "*.min.js", "vendor/**"]
  }
}
```

### エラー無視（特定ケース）

```typescript
// biome-ignore lint/suspicious/noExplicitAny: Legacy code
const data: any = legacyFunction();
```

### JSON Schemaフォーマット例

Biomeは標準JSON Schemaを美しくフォーマット:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://ukiyoue.dev/schemas/document.schema.json",
  "type": "object",
  "required": ["@context", "metadata"],
  "properties": {
    "@context": {
      "type": "string"
    },
    "metadata": {
      "$ref": "#/$defs/metadata"
    }
  }
}
```

## Based on

- **ADR-008**: Implementation Language - TypeScriptを採用
- **ADR-009**: Runtime Environment - Bunを採用
