# ADR-009: Runtime Environment

## Status

Accepted

## Context

TypeScript（ADR-008）の実行環境を選定する必要があります。ランタイム選定は、開発効率、パフォーマンス、デプロイの簡便性、開発者体験に大きく影響します。

**要求事項**:

- ✅ TypeScript直接実行（tscビルド不要）
- ✅ 高速な起動・実行
- ✅ 統合されたツールチェーン（test, build, package manager）
- ✅ クロスプラットフォーム（Linux, macOS, Windows）
- ✅ Node.jsエコシステムとの互換性
- ✅ JSONパフォーマンス（大量ドキュメント処理）
- ✅ シンプルなインストール・セットアップ
- ✅ MCP SDK動作保証
- ✅ 軽量（CLI配布に適する）

**制約条件**:

- TypeScript 5.x対応（ADR-008）
- npm/pnpm パッケージが利用可能
- MCP SDK (`@modelcontextprotocol/sdk`)が動作

## Decision

**Bun 1.x** を採用します。

## Options Considered

### Option A: Bun 1.x (提案)

**概要**: モダンなJavaScript/TypeScriptランタイム＆ツールキット

**Pros**:

- ✅ TypeScript直接実行（`bun run app.ts`）
- ✅ 超高速（JavaScriptCore + Zigベース）
  - Node.jsの2〜3倍高速
  - 起動時間が極めて短い（ミリ秒レベル）
- ✅ オールインワン
  - パッケージマネージャ内蔵
  - テストランナー内蔵（`bun test`）
  - バンドラー内蔵（`bun build`）
  - tsc不要
- ✅ Node.js互換性が高い
  - npm パッケージが動作
  - Node.js API互換
- ✅ シングルバイナリ
  - インストール簡単（`curl -fsSL https://bun.sh/install | bash`）
  - 軽量（50MB程度）
- ✅ 開発体験が優れている
  - Hot Reload
  - Watch mode
  - Fast install（npmの10倍高速）
- ✅ JSON処理が最適化されている

**Cons**:

- ⚠️ 比較的新しい（2022年〜）
- ⚠️ エッジケースでNode.js完全互換でない場合がある
- ⚠️ Windowsサポートがベータ（ただし2024年から安定化）

**パフォーマンス例**:

```bash
# パッケージインストール
bun install     # ~0.5秒
npm install     # ~5秒
pnpm install    # ~2秒

# TypeScript実行
bun run app.ts  # 直接実行
node app.js     # tscビルド後に実行

# テスト実行
bun test        # 超高速
npm test        # 比較的遅い
```

### Option B: Node.js 20+ + pnpm + TypeScript (tsc)

**概要**: 伝統的なNode.jsスタック

**Pros**:

- ✅ 最も安定・成熟している
- ✅ 完全なNode.jsエコシステム
- ✅ 全てのnpmパッケージが動作保証
- ✅ 大規模プロダクション実績
- ✅ Windows完全サポート

**Cons**:

- ❌ TypeScript直接実行不可（tscビルド必要）
- ❌ パフォーマンスがBunより劣る
- ❌ ツールチェーンが分散
  - パッケージマネージャ: npm/pnpm/yarn
  - テスト: Jest/Vitest/Mocha
  - ビルド: tsc/esbuild/webpack
- ❌ 起動が遅い
- ❌ 開発体験がやや劣る

### Option C: Deno 1.x

**概要**: セキュアなJavaScript/TypeScriptランタイム

**Pros**:

- ✅ TypeScript直接実行
- ✅ セキュアデフォルト（権限システム）
- ✅ シングルバイナリ
- ✅ 標準ライブラリが充実

**Cons**:

- ❌ Node.js互換性が不完全
  - npmパッケージの一部が動作しない
  - MCP SDKの動作が不確実
- ❌ エコシステムがNode.jsより小さい
- ❌ パッケージマネージャが独自（npm.registryサポートはあるが）
- ❌ 学習コストがやや高い（権限システム等）

### Option D: ts-node + Node.js

**概要**: Node.js + TypeScript実行ツール

**Pros**:

- ✅ TypeScript直接実行可能
- ✅ Node.jsエコシステム利用

**Cons**:

- ❌ 遅い（JITコンパイル）
- ❌ プロダクションには不向き
- ❌ ツールチェーンが分散（Node.jsのCons継承）
- ❌ Bunが利用可能な今、選ぶ理由がない

### Option E: esbuild + Node.js

**概要**: 高速バンドラ + Node.js

**Pros**:

- ✅ 高速ビルド
- ✅ Node.jsエコシステム

**Cons**:

- ❌ ビルドステップが必要
- ❌ ツールチェーンが分散
- ❌ 開発時のフィードバックループが遅い
- ❌ Bunが全て統合しているので不要

## Comparison Matrix

| 評価基準                       | 重み | Bun     | Node.js+pnpm | Deno | ts-node | esbuild+Node |
| ------------------------------ | ---- | ------- | ------------ | ---- | ------- | ------------ |
| **TypeScript直接実行**         | 5    | 5       | 0            | 5    | 5       | 0            |
| **起動・実行速度**             | 5    | 5       | 3            | 4    | 2       | 3            |
| **統合ツールチェーン**         | 4    | 5       | 2            | 4    | 2       | 2            |
| **Node.js互換性**              | 5    | 4       | 5            | 2    | 5       | 5            |
| **エコシステム成熟度**         | 4    | 3       | 5            | 2    | 5       | 5            |
| **開発者体験**                 | 4    | 5       | 3            | 4    | 3       | 3            |
| **インストール簡便性**         | 3    | 5       | 3            | 5    | 3       | 3            |
| **Windows サポート**           | 3    | 3       | 5            | 5    | 5       | 5            |
| **JSON パフォーマンス**        | 3    | 5       | 3            | 3    | 3       | 3            |
| **学習コスト（低いほど良い）** | 2    | 4       | 3            | 2    | 4       | 3            |
| **合計**                       | 38   | **165** | 132          | 140  | 145     | 132          |
| **正規化スコア（/30）**        | -    | **26**  | 20.8         | 22   | 22.9    | 20.8         |

**重み付け理由**:

- **TypeScript直接実行（5）**: 開発効率の核心、ビルドステップ削減
- **起動・実行速度（5）**: CLIツール・MCPサーバーの応答性に直結
- **統合ツールチェーン（4）**: セットアップ・メンテナンスの簡便性
- **Node.js互換性（5）**: npm エコシステム活用が必須
- **エコシステム成熟度（4）**: 必要ライブラリの入手可能性と安定性
- **開発者体験（4）**: Hot Reload等の生産性機能
- **インストール簡便性（3）**: 参入障壁とCI/CD設定の複雑性
- **Windows サポート（3）**: クロスプラットフォーム対応
- **JSON パフォーマンス（3）**: コア機能の処理速度
- **学習コスト（2）**: 重要だが、既存知識で軽減可能

## Consequences

### Positive

- ✅ **開発速度**: TypeScript直接実行で即座にフィードバック
- ✅ **パフォーマンス**: 検証・処理の高速化（大量ドキュメント対応）
- ✅ **簡便性**: オールインワンで複雑な設定不要
- ✅ **軽量**: シングルバイナリで配布が容易
- ✅ **開発者体験**: Hot Reload, Watch mode等
- ✅ **統合**: テスト・ビルド・実行が統一
- ✅ **互換性**: npm パッケージが基本的に動作

### Negative

- ⚠️ **新しさ**: Node.jsほど成熟していない
- ⚠️ **エッジケース**: 一部Node.js APIで非互換の可能性
- ⚠️ **Windows**: ベータサポート（ただし改善中）
- ⚠️ **コミュニティ**: Node.jsより小さい

### Mitigation

- **新しさ・互換性**:
  - 主要ライブラリ（MCP SDK, Ajv, jsonld.js）の動作確認
  - 非互換が発覚した場合はNode.jsへのフォールバック準備
  - CI/CDで互換性テスト
- **Windows サポート**:
  - 現時点でベータだが、2024年後半から安定化傾向
  - CI/CDでWindows環境もテスト
  - ドキュメントにWindows制限事項を明記
- **コミュニティ**:
  - 問題発生時はNode.jsでも動作するように保つ
  - Bun Issues / DiscordでサポートFIRST

## Implementation Notes

### インストール

```bash
# Linux / macOS
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# Docker
FROM oven/bun:1
```

### package.json スクリプト

```json
{
  "scripts": {
    "dev": "bun run src/index.ts",
    "build": "bun build src/index.ts --outdir dist --target bun",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "lint": "bunx @biomejs/biome check src",
    "format": "bunx @biomejs/biome format --write src"
  }
}
```

### bunfig.toml（Bun設定）

```toml
[install]
# パッケージインストール設定
registry = "https://registry.npmjs.org"
production = false

[test]
# テスト設定
coverage = true
```

### TypeScript + Bun統合

```typescript
// TypeScriptをそのまま実行
import { serve } from "bun";

const server = serve({
  port: 3000,
  fetch(req) {
    return new Response("Hello from Bun!");
  },
});

console.log(`Listening on http://localhost:${server.port}`);
```

### CI/CD設定

```yaml
# .github/workflows/ci.yml
- uses: oven-sh/setup-bun@v1
  with:
    bun-version: latest

- run: bun install
- run: bun test
- run: bun run build
```

### フォールバック戦略

非互換が発覚した場合のNode.js実行:

```json
{
  "scripts": {
    "dev:node": "tsx src/index.ts",
    "build:node": "tsc",
    "test:node": "vitest"
  }
}
```

### バージョン戦略

- **最小サポートバージョン**: Bun 1.0+
- **推奨バージョン**: Bun 1.1+（安定版）
- **アップグレードポリシー**: マイナーバージョン積極的に追従

## Based on

- **ADR-008**: Implementation Language - TypeScriptを採用
