# ADR-017: CI/CD Platform

## Status

Accepted

## Context

Ukiyoueフレームワークの継続的インテグレーション・継続的デリバリー（CI/CD）プラットフォームを選定する必要があります。オープンソースプロジェクトとして、透明性・アクセス性・コスト効率が重要です。

**要求事項**:

- ✅ GitHub統合（プロジェクトはGitHub上）
- ✅ 無料枠でOSSプロジェクト対応
- ✅ Linux/macOS/Windows対応（クロスプラットフォームテスト）
- ✅ Bun環境セットアップが容易
- ✅ 並列ジョブ実行（テスト高速化）
- ✅ キャッシュ機能（依存関係・ビルド成果物）
- ✅ アーティファクト保存（カバレッジレポート等）
- ✅ リリース自動化
- ✅ npm パッケージ公開自動化
- ✅ バッジ表示（README用）
- ✅ コミュニティ標準（採用実績）

**制約条件**:

- GitHubリポジトリ（github.com/mahitotsu/ukiyoue）
- Bun 1.x環境（ADR-009）
- TypeScript 5.x（ADR-008）
- テスト実行時間: 目標 < 5分
- 予算: 無料枠内

## Decision

**GitHub Actions** を採用します。

## Options Considered

### Option A: GitHub Actions (提案)

**概要**: GitHub統合の公式CI/CDサービス

**Pros**:

- ✅ GitHub完全統合
  - プルリクエスト自動実行
  - コミットステータス表示
  - リリース自動化
  - Issues/PRとの連携
- ✅ OSS無料枠が充実
  - パブリックリポジトリは無制限
  - 並列実行: Linux x20, macOS x5, Windows x5
- ✅ クロスプラットフォーム対応
  - ubuntu-latest, macos-latest, windows-latest
  - 複数バージョン同時テスト（matrix）
- ✅ Bunサポート公式
  - `oven-sh/setup-bun@v1` アクション
  - 簡単セットアップ
- ✅ 豊富なアクション
  - 10,000+ コミュニティアクション
  - codecov, release-please等
- ✅ キャッシュ機能強力
  - `actions/cache@v3`
  - 自動キャッシュキー生成
- ✅ アーティファクト保存
  - カバレッジレポート
  - ビルド成果物
- ✅ シークレット管理
  - npm トークン
  - GPG鍵
- ✅ バッジ自動生成
- ✅ 業界標準（最も広く使われている）
- ✅ YAMLベース設定（シンプル）

**Cons**:

- ⚠️ プライベートリポジトリは有料（OSS関係なし）
- ⚠️ 実行時間制限（6時間/ジョブ）
- ⚠️ YAMLデバッグがやや困難

**実装例**:

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      - run: bun install
      - run: bun test
```

### Option B: GitLab CI/CD

**概要**: GitLab統合のCI/CDサービス

**Pros**:

- ✅ 強力なCI/CD機能
- ✅ 無料枠あり
- ✅ セルフホスト可能
- ✅ YAMLベース設定

**Cons**:

- ❌ GitHubとの統合が間接的
  - ミラーリング必要
  - PR連携が複雑
- ❌ コミュニティアクションがGitHub比で少ない
- ❌ Bunサポートが公式でない
- ❌ OSSプロジェクトの標準ではない

### Option C: CircleCI

**概要**: クラウドCI/CDサービス

**Pros**:

- ✅ 高速実行
- ✅ 並列実行が強力
- ✅ GitHub統合可能

**Cons**:

- ❌ 無料枠が限定的（400分/月 → GitHub比で少ない）
- ❌ 設定が複雑（`.circleci/config.yml`）
- ❌ Bunサポートが公式でない
- ❌ GitHub Actionsより採用実績少ない（OSS）
- ❌ アクション/Orbsが少ない

### Option D: Travis CI

**概要**: 老舗のCI/CDサービス

**Pros**:

- ✅ 歴史的に広く使われた
- ✅ GitHub統合

**Cons**:

- ❌ 無料枠廃止（2021年）
- ❌ 有料プランのみ
- ❌ コミュニティ離れ
- ❌ 採用理由なし

### Option E: Jenkins（セルフホスト）

**概要**: オープンソースのCI/CDサーバー

**Pros**:

- ✅ 完全無料
- ✅ 高度なカスタマイズ可能
- ✅ 豊富なプラグイン

**Cons**:

- ❌ 運用コスト（サーバー管理）
- ❌ セットアップが複雑
- ❌ GitHub統合が間接的
- ❌ OSSプロジェクトには過剰
- ❌ クラウドCI/CDの利点を活かせない

## Comparison Matrix

| 評価基準                   | 重み | GitHub Actions | GitLab CI | CircleCI | Travis CI | Jenkins |
| -------------------------- | ---- | -------------- | --------- | -------- | --------- | ------- |
| **GitHub統合**             | 5    | 5              | 2         | 4        | 3         | 2       |
| **OSS無料枠**              | 5    | 5              | 4         | 2        | 0         | 5       |
| **クロスプラットフォーム** | 4    | 5              | 4         | 4        | 4         | 3       |
| **Bunサポート**            | 4    | 5              | 3         | 3        | 2         | 3       |
| **並列実行**               | 4    | 5              | 4         | 5        | 3         | 4       |
| **キャッシュ機能**         | 3    | 5              | 4         | 5        | 4         | 4       |
| **設定の簡便性**           | 3    | 5              | 4         | 3        | 4         | 2       |
| **アクション/プラグイン**  | 3    | 5              | 3         | 3        | 2         | 4       |
| **コミュニティ標準**       | 3    | 5              | 3         | 3        | 2         | 2       |
| **運用コスト（低い方）**   | 2    | 5              | 5         | 4        | 3         | 1       |
| **合計**                   | 36   | **180**        | 133       | 136      | 102       | 114     |
| **正規化スコア（/30）**    | -    | **30**         | 22.2      | 22.7     | 17        | 19      |

**重み付け理由**:

- **GitHub統合（5）**: プロジェクトの中心プラットフォーム
- **OSS無料枠（5）**: コスト制約、持続可能性
- **クロスプラットフォーム（4）**: Bunの検証、ユーザー環境対応
- **Bunサポート（4）**: セットアップの簡便性
- **並列実行（4）**: テスト高速化
- **キャッシュ機能（3）**: ビルド時間短縮
- **設定の簡便性（3）**: メンテナンス負荷
- **アクション/プラグイン（3）**: 機能拡張性
- **コミュニティ標準（3）**: 貢献者の参入障壁
- **運用コスト（2）**: 管理負荷

## Consequences

### Positive

- ✅ **完全統合**: GitHubとシームレス連携
- ✅ **無料**: OSSプロジェクトは無制限
- ✅ **簡単**: YAMLで直感的に設定
- ✅ **標準**: OSS開発者が慣れている
- ✅ **バッジ**: ステータスバッジでREADME充実
- ✅ **高速**: 並列実行で短時間完了
- ✅ **豊富**: 10,000+アクションで拡張性
- ✅ **透明性**: すべてのビルドログが公開

### Negative

- ⚠️ **GitHub依存**: プラットフォームロックイン
- ⚠️ **実行環境制限**: 提供されるランナーのみ
- ⚠️ **デバッグ**: ローカル再現が困難な場合がある

### Mitigation

- **GitHub依存**:
  - 他のCI/CDへの移行パスを文書化
  - 設定をシンプルに保つ（他CI/CDへの移植容易性）
- **実行環境制限**:
  - 標準ランナーで十分なケースがほとんど
  - 必要に応じてセルフホストランナー検討
- **デバッグ**:
  - `act`（GitHub Actions ローカル実行ツール）を活用
  - テストはローカルでも実行可能に

## Implementation Notes

### ワークフロー構成

```yaml
# .github/workflows/
├── ci.yml              # CI（テスト・Lint・ビルド）
├── release.yml         # リリース自動化
├── publish.yml         # npm パッケージ公開
└── codeql.yml          # セキュリティ分析
```

### ci.yml（メインCI）

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # Lint & Format
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      - run: bun install
      - name: Run Biome
        run: bun run ci:check

  # テスト（複数プラットフォーム）
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        bun-version: [latest, 1.0.0]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: ${{ matrix.bun-version }}

      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          path: ~/.bun/install/cache
          key: ${{ runner.os }}-bun-${{ hashFiles('bun.lockb') }}

      - run: bun install
      - run: bun test --coverage

      - name: Upload coverage
        if: matrix.os == 'ubuntu-latest'
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  # ビルド確認
  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: dist/
```

### release.yml（リリース自動化）

```yaml
name: Release

on:
  push:
    tags:
      - "v*"

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build

      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false

      - name: Upload Release Asset
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: ${{ steps.create_release.outputs.upload_url }}
          asset_path: ./dist/ukiyoue.tar.gz
          asset_name: ukiyoue.tar.gz
          asset_content_type: application/gzip
```

### publish.yml（npm公開）

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build

      - name: Publish to npm
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### codeql.yml（セキュリティ分析）

```yaml
name: CodeQL

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 0 * * 1" # 週次

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v2
        with:
          languages: javascript
      - uses: github/codeql-action/autobuild@v2
      - uses: github/codeql-action/analyze@v2
```

### バッジ設定

README.mdに追加:

```markdown
[![CI](https://github.com/mahitotsu/ukiyoue/workflows/CI/badge.svg)](https://github.com/mahitotsu/ukiyoue/actions)
[![codecov](https://codecov.io/gh/mahitotsu/ukiyoue/branch/main/graph/badge.svg)](https://codecov.io/gh/mahitotsu/ukiyoue)
[![npm version](https://badge.fury.io/js/%40ukiyoue%2Fcore.svg)](https://www.npmjs.com/package/@ukiyoue/core)
```

### シークレット管理

GitHub Secrets設定:

```yaml
Settings > Secrets and variables > Actions
  - CODECOV_TOKEN: Codecovアップロード用
  - NPM_TOKEN: npm公開用
  - GPG_PRIVATE_KEY: リリース署名用（将来）
```

### ローカルデバッグ（act）

```bash
# actインストール
brew install act  # macOS
sudo apt install act  # Ubuntu

# ローカルでGitHub Actions実行
act push
act pull_request
```

### パフォーマンス最適化

```yaml
# キャッシュ戦略
- uses: actions/cache@v3
  with:
    path: |
      ~/.bun/install/cache
      node_modules
    key: ${{ runner.os }}-bun-${{ hashFiles('bun.lockb') }}
    restore-keys: |
      ${{ runner.os }}-bun-

# 並列実行
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest, windows-latest]
  max-parallel: 3
```

### 開発ワークフロー

```yaml
開発ブランチ:
  - PR作成 → CI実行（lint, test, build）
  - すべてPass → マージ可能

mainブランチ:
  - マージ → CI実行
  - Pass → canary版公開（npm @canary）

リリース:
  - タグプッシュ（v1.0.0） → Release workflow
  - 成功 → GitHub Release作成 + npm安定版公開
```

## Based on

- **ADR-008**: Implementation Language - TypeScriptを採用
- **ADR-009**: Runtime Environment - Bunを採用
- **ADR-015**: Test Framework - Bun testを実行
- **ADR-016**: Lint/Formatter - Biomeを実行
