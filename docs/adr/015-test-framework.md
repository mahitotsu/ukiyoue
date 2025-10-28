# ADR-015: Test Framework

## Status

Accepted

## Context

TypeScript + Bun環境（ADR-008, ADR-009）でのテストフレームワークを選定する必要があります。Ukiyoueは複雑な検証ロジックとセマンティック処理を持つため、包括的なテスト戦略が不可欠です。

**要求事項**:

- ✅ ユニットテスト・統合テストの実行
- ✅ TypeScript直接実行（トランスパイル不要）
- ✅ 高速なテスト実行（CI/CDボトルネック回避）
- ✅ Watch modeサポート（開発時の即座フィードバック）
- ✅ カバレッジレポート生成
- ✅ モック・スパイ機能
- ✅ 並列実行サポート
- ✅ スナップショットテスト
- ✅ 非同期テスト対応
- ✅ 明確なエラーメッセージ
- ✅ Bun環境で最適動作

**制約条件**:

- Bun 1.x環境（ADR-009）
- TypeScript 5.x（ADR-008）
- CI/CDで高速実行（目標: 1000テスト < 30秒）

## Decision

**Bun test（ネイティブテストランナー）** を採用します。

## Options Considered

### Option A: Bun test (提案)

**概要**: Bunに統合されたネイティブテストランナー

**Pros**:

- ✅ Bunに内蔵（追加インストール不要）
- ✅ 超高速実行
  - JavaScriptCore + Zigベースの最適化
  - 並列実行がデフォルト
  - Jest/Vitestの3〜5倍高速
- ✅ TypeScript直接実行（トランスパイル不要）
- ✅ Jest互換API
  - `describe`, `it`, `expect`が同じ
  - 学習コスト最小
  - Jestからの移行が容易
- ✅ Watch mode内蔵（`bun test --watch`）
- ✅ カバレッジレポート（`--coverage`）
- ✅ スナップショットテスト対応
- ✅ モック機能（`mock()`）
- ✅ 非同期テスト完全対応
- ✅ 統合が簡単（設定ほぼ不要）
- ✅ Bunエコシステムと完全統合

**Cons**:

- ⚠️ 比較的新しい（2023年〜）
- ⚠️ Jestの全機能は未実装
  - 一部高度なモック機能が制限的
  - カスタムマッチャーが少ない
- ⚠️ プラグインエコシステムが小さい

**実装例**:

```typescript
// math.test.ts
import { describe, it, expect } from "bun:test";
import { add } from "./math";

describe("Math utilities", () => {
  it("should add two numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("should handle async operations", async () => {
    const result = await fetchData();
    expect(result).toHaveProperty("status", 200);
  });
});
```

**パフォーマンス例**:

```bash
# 1000テスト実行
bun test      # ~3秒
jest          # ~15秒
vitest        # ~8秒
```

### Option B: Vitest

**概要**: Viteベースの高速テストフレームワーク

**Pros**:

- ✅ 高速（Viteの恩恵）
- ✅ Jest互換API
- ✅ Watch mode優秀
- ✅ モダンなUI
- ✅ カバレッジツールが充実
- ✅ 成熟したエコシステム

**Cons**:

- ❌ Bunより遅い
- ❌ 追加インストール必要
- ❌ 設定が複雑（vite.config.ts）
- ❌ TypeScript実行にトランスパイル必要（内部的に）
- ❌ Bunネイティブの利点を活かせない

### Option C: Jest

**概要**: 最も広く使われているJavaScriptテストフレームワーク

**Pros**:

- ✅ 最も成熟している
- ✅ 膨大なエコシステム
- ✅ 豊富なプラグイン
- ✅ 詳細なドキュメント
- ✅ 大規模プロダクション実績

**Cons**:

- ❌ 遅い（Bunの5倍以上）
- ❌ TypeScript実行に`ts-jest`が必要
- ❌ 設定が複雑
- ❌ Watch modeが遅い
- ❌ Bunの速度を活かせない
- ❌ レガシーな設計（ESM対応が後付け）

### Option D: Node.js native test runner

**概要**: Node.js 18+の組み込みテストランナー

**Pros**:

- ✅ 追加インストール不要（Node.js使用時）
- ✅ シンプル
- ✅ 公式サポート

**Cons**:

- ❌ 機能が限定的
- ❌ カバレッジツールなし
- ❌ スナップショットなし
- ❌ モック機能が貧弱
- ❌ Bunでの優位性なし
- ❌ エコシステムが小さい

### Option E: Mocha + Chai

**概要**: 伝統的なテストフレームワーク

**Pros**:

- ✅ 成熟している
- ✅ 柔軟性が高い

**Cons**:

- ❌ 遅い
- ❌ 設定が分散（Mocha + Chai + Sinon等）
- ❌ モダンな機能が不足
- ❌ TypeScript対応が後付け
- ❌ Bunの利点を活かせない

## Comparison Matrix

| 評価基準                 | 重み | Bun test | Vitest | Jest | Node test | Mocha+Chai |
| ------------------------ | ---- | -------- | ------ | ---- | --------- | ---------- |
| **実行速度**             | 5    | 5        | 4      | 2    | 3         | 2          |
| **TypeScript直接実行**   | 5    | 5        | 4      | 2    | 3         | 2          |
| **統合の簡便性**         | 4    | 5        | 3      | 3    | 4         | 2          |
| **Watch mode品質**       | 4    | 5        | 5      | 3    | 3         | 2          |
| **機能の充実度**         | 4    | 4        | 5      | 5    | 2         | 4          |
| **Jest互換性**           | 3    | 5        | 5      | 5    | 1         | 1          |
| **カバレッジレポート**   | 3    | 4        | 5      | 5    | 1         | 3          |
| **モック機能**           | 3    | 4        | 5      | 5    | 2         | 4          |
| **エコシステム成熟度**   | 3    | 3        | 4      | 5    | 2         | 4          |
| **学習コスト（低い方）** | 2    | 5        | 4      | 4    | 3         | 3          |
| **合計**                 | 36   | **162**  | 156    | 139  | 89        | 99         |
| **正規化スコア（/30）**  | -    | **27**   | 26     | 23.2 | 14.8      | 16.5       |

**重み付け理由**:

- **実行速度（5）**: CI/CDボトルネック回避、開発時のフィードバック速度
- **TypeScript直接実行（5）**: Bun環境の利点を最大化
- **統合の簡便性（4）**: セットアップ時間の削減
- **Watch mode品質（4）**: 開発時の生産性に直結
- **機能の充実度（4）**: テストケース実装の柔軟性
- **Jest互換性（3）**: 学習コスト削減、移行容易性
- **カバレッジレポート（3）**: 品質保証の可視化
- **モック機能（3）**: ユニットテストの独立性
- **エコシステム成熟度（3）**: 問題解決の容易さ
- **学習コスト（2）**: チーム参入障壁

## Consequences

### Positive

- ✅ **超高速実行**: 開発時のフィードバックループが極めて短い
- ✅ **ゼロ設定**: `bun test`だけで開始可能
- ✅ **統合環境**: Bunエコシステム内で完結
- ✅ **シンプルな設定**: bunfig.tomlで簡単に設定
- ✅ **Jest互換**: 既存知識を活用可能
- ✅ **並列実行**: デフォルトで高速化
- ✅ **TypeScript最適化**: トランスパイル不要で高速

### Negative

- ⚠️ **新しさ**: Jest/Vitestほど成熟していない
- ⚠️ **エッジケース**: 一部高度な機能が未実装の可能性
- ⚠️ **コミュニティ**: Jest/Vitestより小さい

### Mitigation

- **新しさ・機能制限**:
  - 主要機能（describe, it, expect, mock）は完全実装
  - 不足機能はBun Issuesで報告・貢献
  - 必要に応じてVitestへの移行パスを準備（Jest互換なので容易）
- **コミュニティ**:
  - Bunコミュニティは急成長中
  - 問題発生時はBun Discord / GitHubで迅速サポート
  - 重大な問題があればVitestへの切り替えも検討

## Implementation Notes

### 基本的なテスト構造

```typescript
// src/engines/validation-engine.test.ts
import { describe, it, expect, beforeEach, mock } from "bun:test";
import { ValidationEngine } from "./validation-engine";

describe("ValidationEngine", () => {
  let engine: ValidationEngine;

  beforeEach(() => {
    engine = new ValidationEngine();
  });

  describe("validateStructure", () => {
    it("should pass valid document", () => {
      const doc = { type: "object", required: ["name"] };
      const result = engine.validateStructure(doc);
      expect(result.valid).toBe(true);
    });

    it("should fail invalid document", () => {
      const doc = { type: "invalid" };
      const result = engine.validateStructure(doc);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it("should handle async validation", async () => {
      const doc = await loadDocument("test.json");
      const result = engine.validateStructure(doc);
      expect(result.valid).toBe(true);
    });
  });
});
```

### モック機能

```typescript
import { mock } from "bun:test";

it("should call external service", async () => {
  const mockFetch = mock(() => Promise.resolve({ status: 200 }));
  global.fetch = mockFetch;

  const result = await fetchData();
  expect(mockFetch).toHaveBeenCalledTimes(1);
  expect(result.status).toBe(200);
});
```

### スナップショットテスト

```typescript
import { expect } from "bun:test";

it("should match snapshot", () => {
  const result = generateReport();
  expect(result).toMatchSnapshot();
});
```

### カバレッジレポート

```bash
# カバレッジ付きでテスト実行
bun test --coverage

# 出力: coverage/lcov-report/index.html
```

### bunfig.toml設定

```toml
[test]
# テスト設定
coverage = true
coverageThreshold = 80
preload = ["./test/setup.ts"]
```

### CI/CD統合

```yaml
# .github/workflows/test.yml
name: Test

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
      - run: bun test --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### テスト戦略

```yaml
ユニットテスト:
  対象: 各エンジン、ユーティリティ関数
  実行頻度: Watch mode（開発中常時）
  カバレッジ目標: 80%以上

統合テスト:
  対象: エンジン間連携、MCPツール
  実行頻度: コミット時
  カバレッジ目標: 70%以上

E2Eテスト:
  対象: 実際のドキュメント生成→検証フロー
  実行頻度: PRマージ前
  カバレッジ目標: 主要シナリオ100%
```

### パフォーマンスベンチマーク

```typescript
// benchmark.test.ts
import { bench, group } from "bun:test";

group("Validation Performance", () => {
  bench("validate 1000 documents", () => {
    for (let i = 0; i < 1000; i++) {
      engine.validate(sampleDoc);
    }
  });

  bench("validate with cache", () => {
    for (let i = 0; i < 1000; i++) {
      engine.validateWithCache(sampleDoc);
    }
  });
});
```

## Based on

- **ADR-008**: Implementation Language - TypeScriptを採用
- **ADR-009**: Runtime Environment - Bunを採用
