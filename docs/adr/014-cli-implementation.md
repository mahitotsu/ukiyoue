# ADR-014: CLI Implementation

## Status

Accepted

## Context

architecture.mdで定義したように、CLIツールはUkiyoueのセカンダリーインターフェースです。人間による手動操作とCI/CD統合を目的とし、MCPサーバーと同じコアロジックを共有します。

**要求事項**:

- ✅ 使いやすいコマンド体系
- ✅ POSIXスタイルのオプション（--flag, -f等）
- ✅ カラフルな出力（エラー・警告・成功の視覚的区別）
- ✅ プログレスバー（大量ドキュメント処理時）
- ✅ JSON出力オプション（CI/CD統合用）
- ✅ TypeScript対応
- ✅ Bun互換性（Bun 1.x）
- ✅ クロスプラットフォーム（Linux、macOS、Windows）
- ✅ サブコマンド構造
- ✅ ヘルプメッセージの充実
- ✅ エラーメッセージの明確性

**制約条件**:

- MCPサーバーと同じコアエンジンを使用
- TypeScript/Bun環境で動作（ADR-008, ADR-009）
- npm/bunでグローバルインストール可能
- CI/CDパイプラインで利用可能

## Decision

**Commander.js** を採用します。

## Options Considered

### Option A: Commander.js (提案)

**概要**: Node.js向けのCLIフレームワーク（最も普及）

**Pros**:

- ✅ 最も普及したNode.js CLIフレームワーク
- ✅ シンプルで直感的なAPI
- ✅ TypeScript完全対応（型定義が公式提供）
- ✅ サブコマンド、オプション、引数の柔軟な定義
- ✅ 自動ヘルプ生成
- ✅ Bunで動作確認済み
- ✅ 軽量（依存関係なし、約50KB）
- ✅ 活発なメンテナンス
- ✅ 豊富なドキュメントと事例
- ✅ Git、npm等の主要ツールで採用実績

**Cons**:

- ⚠️ カラー出力やプログレスバーは別ライブラリが必要
- ⚠️ バリデーション機能は手動実装が必要

### Option B: oclif

**概要**: Heroku/Salesforce製のエンタープライズグレードCLIフレームワーク

**Pros**:

- ✅ TypeScript完全対応（TypeScriptファースト設計）
- ✅ プラグインシステム（拡張性が高い）
- ✅ 自動ドキュメント生成
- ✅ テストユーティリティ充実
- ✅ Heroku CLI、Salesforce CLI等で採用実績
- ✅ フックシステム（ライフサイクル管理）

**Cons**:

- ❌ 重い（多数の依存関係、約5MB）
- ❌ 学習コストが高い（機能が多すぎる）
- ❌ セットアップが複雑（ボイラープレートが多い）
- ❌ Bunでの動作が不安定（一部の依存関係に問題）
- ❌ UkiyoueにはオーバースペックPhase 1では不要な機能が多い）

### Option C: yargs

**概要**: 強力なオプション解析ライブラリ

**Pros**:

- ✅ 非常に柔軟なオプション定義
- ✅ バリデーション機能が組み込み
- ✅ TypeScript型定義あり
- ✅ Bunで動作
- ✅ 活発なメンテナンス

**Cons**:

- ⚠️ APIがやや複雑（学習コストあり）
- ⚠️ サブコマンドの定義が冗長
- ⚠️ ヘルプメッセージのカスタマイズが面倒
- ⚠️ 依存関係が多い（約200KB）

### Option D: Bun Native (process.argv直接処理)

**概要**: Bunの標準機能のみでCLI実装

**Pros**:

- ✅ 依存関係ゼロ
- ✅ 最軽量
- ✅ 完全なコントロール

**Cons**:

- ❌ すべてを手動実装（オプション解析、ヘルプ生成等）
- ❌ 開発コストが非常に高い
- ❌ メンテナンス負荷が高い
- ❌ バグのリスク
- ❌ 車輪の再発明

### Option E: cac

**概要**: 軽量でシンプルなCLIフレームワーク

**Pros**:

- ✅ 非常に軽量（約10KB）
- ✅ シンプルなAPI
- ✅ TypeScript対応
- ✅ Bunで動作

**Cons**:

- ⚠️ コミュニティが小さい
- ⚠️ ドキュメントが限定的
- ⚠️ 事例が少ない
- ⚠️ 長期サポートへの懸念

## Comparison Matrix

| 評価基準                | 重み | Commander.js | oclif    | yargs    | Bun Native | cac      |
| ----------------------- | ---- | ------------ | -------- | -------- | ---------- | -------- |
| **使いやすさ**          | 5    | 5            | 3        | 3        | 1          | 4        |
| **軽量性**              | 5    | 5            | 1        | 3        | 5          | 5        |
| **TypeScript対応**      | 4    | 5            | 5        | 4        | 5          | 4        |
| **Bun互換性**           | 4    | 5            | 2        | 4        | 5          | 5        |
| **機能性**              | 3    | 4            | 5        | 5        | 2          | 3        |
| **メンテナンス状況**    | 2    | 5            | 5        | 5        | 5          | 3        |
| **ドキュメント充実度**  | 2    | 5            | 5        | 4        | 3          | 2        |
| **合計**                | 25   | **148**      | **107**  | **120**  | **105**    | **103**  |
| **正規化スコア（/30）** | -    | **30.0**     | **21.7** | **24.3** | **21.3**   | **20.9** |

**重み付け理由**:

- **使いやすさ（5）**: CLIは人間が直接使うツールのため、直感的なAPIとシンプルな設計が最重要
- **軽量性（5）**: 起動速度に直結。CLIツールは頻繁に起動されるため、軽量であることが重要
- **TypeScript対応（4）**: ADR-008でTypeScriptを採用。型安全性が開発効率に影響
- **Bun互換性（4）**: ADR-009でBunを採用済み。互換性がない場合は採用困難
- **機能性（3）**: サブコマンド、オプション解析等の基本機能は必須だが、過剰な機能は不要
- **メンテナンス状況（2）**: 長期的な保守性。ただし、CLIフレームワークは成熟しており、頻繁な更新は不要
- **ドキュメント充実度（2）**: 学習コストの低減。豊富な事例があればドキュメントの不足は補える

## Consequences

### Positive

- ✅ シンプルで直感的なAPIにより開発速度が向上
- ✅ 広く普及したライブラリによる安定性と長期サポート
- ✅ 自動ヘルプ生成により、ドキュメントメンテナンス負荷が低減
- ✅ 軽量でBunとの相性が良く、高速起動
- ✅ 豊富な事例により、実装時の参考情報が充実
- ✅ MCPサーバーと同じコアロジックを共有し、一貫性を保証

### Negative

- ⚠️ カラー出力にはchalk、プログレスバーにはora等の追加ライブラリが必要
- ⚠️ 入力バリデーションは手動実装が必要（ただし、既存のValidation Engineを活用可能）

### Neutral

- ℹ️ 将来的により高度な機能（プラグインシステム等）が必要になった場合、oclifへの移行を検討可能
- ℹ️ カラー出力やプログレスバー等のUI機能は、chalk、ora等の小さなライブラリで補完

## Implementation Notes

### 補助ライブラリ

Commander.js単体では不足する機能を補うため、以下のライブラリを併用します：

| 用途           | ライブラリ | 理由                           |
| -------------- | ---------- | ------------------------------ |
| カラー出力     | chalk      | 最も普及、TypeScript対応、軽量 |
| プログレスバー | ora        | シンプル、Bunで動作            |
| 表形式出力     | cli-table3 | 検証結果の表示に便利           |

### コマンド構造例

```typescript
import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";

const program = new Command();

program
  .name("ukiyoue")
  .description("AI-first documentation framework")
  .version("0.1.0");

// ukiyoue validate
program
  .command("validate")
  .description("Validate Ukiyoue documents")
  .argument("<path>", "File or directory to validate")
  .option("-l, --level <level>", "Validation level", "semantic")
  .option("-a, --actionable", "Include action suggestions", true)
  .option("-j, --json", "Output in JSON format", false)
  .action(async (path, options) => {
    const spinner = ora("Validating documents...").start();

    try {
      const result = await validationEngine.validate(path, options);

      spinner.succeed("Validation complete");

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        // カラフルな出力
        console.log(chalk.green("✓ Passed:"), result.passed);
        console.log(chalk.red("✗ Failed:"), result.failed);

        if (options.actionable && result.actions) {
          console.log(chalk.blue("\n💡 Suggested Actions:"));
          result.actions.forEach((action) => {
            console.log(`  - ${action}`);
          });
        }
      }
    } catch (error) {
      spinner.fail("Validation failed");
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// ukiyoue component
const component = program.command("component").description("Manage components");

component
  .command("search")
  .description("Search for components")
  .argument("<query>", "Search query")
  .option("-c, --category <category>", "Filter by category")
  .option("-l, --limit <number>", "Limit results", "10")
  .action(async (query, options) => {
    const results = await componentManager.search(query, options);
    console.table(results);
  });

component
  .command("get")
  .description("Get component details")
  .argument("<name>", "Component name")
  .option("-v, --variation <variation>", "Variation name")
  .action(async (name, options) => {
    const component = await componentManager.get(name, options.variation);
    console.log(JSON.stringify(component, null, 2));
  });

// ukiyoue analyze
program
  .command("analyze")
  .description("Analyze project structure")
  .argument("<path>", "Project directory")
  .option("-o, --output <file>", "Output report file")
  .action(async (path, options) => {
    const spinner = ora("Analyzing project...").start();
    const analysis = await projectAnalyzer.analyze(path);
    spinner.succeed("Analysis complete");

    if (options.output) {
      await Bun.write(options.output, JSON.stringify(analysis, null, 2));
      console.log(chalk.green(`Report saved to ${options.output}`));
    } else {
      console.log(analysis);
    }
  });

// ukiyoue init
program
  .command("init")
  .description("Initialize a new Ukiyoue project")
  .argument("<name>", "Project name")
  .action(async (name) => {
    const spinner = ora("Initializing project...").start();
    await projectInitializer.init(name);
    spinner.succeed(`Project ${name} created`);

    console.log(chalk.blue("\nNext steps:"));
    console.log(`  cd ${name}`);
    console.log("  ukiyoue generate --template api-spec");
    console.log("  ukiyoue validate");
  });

program.parse();
```

### CI/CD統合例

```yaml
# GitHub Actions
- name: Validate Ukiyoue Documents
  run: |
    bunx @ukiyoue/cli validate ./docs --json > validation-report.json

- name: Upload Validation Report
  uses: actions/upload-artifact@v3
  with:
    name: validation-report
    path: validation-report.json
```

## Based on

- **ADR-008**: Implementation Language - TypeScriptを採用
- **ADR-009**: Runtime Environment - Bunを採用
