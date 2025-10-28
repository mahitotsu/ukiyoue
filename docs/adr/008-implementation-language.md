# ADR-008: Implementation Language

## Status

Accepted

## Context

Ukiyoue Frameworkの実装言語を選定する必要があります。この決定は、開発効率、保守性、エコシステム、採用可能性に大きく影響します。

**要求事項**:

- ✅ 型安全性（大規模開発での保守性）
- ✅ JSON/JSON-LD処理の容易さ
- ✅ 豊富なライブラリエコシステム
- ✅ MCP (Model Context Protocol) SDK対応
- ✅ クロスプラットフォーム（Linux, macOS, Windows）
- ✅ パフォーマンス（大量ドキュメント処理）
- ✅ 開発者の採用可能性
- ✅ AI生成コードとの親和性
- ✅ IDE サポート（補完、リファクタリング等）

**制約条件**:

- MCP SDK公式サポート言語
- JSON処理が標準ライブラリまたは一般的なライブラリで可能
- OSSエコシステムが成熟している

## Decision

**TypeScript 5.x** を採用します。

## Options Considered

### Option A: TypeScript 5.x (提案)

**概要**: 型付きJavaScriptスーパーセット

**Pros**:

- ✅ 強力な型システム（型安全性、IDE補完）
- ✅ JavaScriptエコシステム全体にアクセス可能
- ✅ JSON処理がネイティブかつ簡単
- ✅ MCP SDK公式サポート（`@modelcontextprotocol/sdk`）
- ✅ クロスプラットフォーム
- ✅ JSON Schema → TypeScript型生成ツールが充実
- ✅ 開発者人口が多い（採用容易）
- ✅ AI生成コードとの親和性が高い
- ✅ VS Code等のIDE サポートが最高レベル
- ✅ Bunで高速実行可能（ADR-009）
- ✅ jsonld.js, Ajv等の必要ライブラリが全て揃う

**Cons**:

- ⚠️ コンパイルが必要（ただしBunで高速化）
- ⚠️ ランタイム型チェックは別途必要（JSON Schema等で対応）

**エコシステム例**:

```typescript
// JSON Schema検証
import Ajv from "ajv";

// JSON-LD処理
import * as jsonld from "jsonld";

// MCP SDK
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// CLI
import { Command } from "commander";

// テスト
import { describe, it, expect } from "bun:test";
```

### Option B: Python 3.12+

**概要**: 汎用プログラミング言語

**Pros**:

- ✅ JSON処理が簡単
- ✅ データ処理ライブラリが豊富
- ✅ AI/ML エコシステムが強力
- ✅ 開発者人口が多い

**Cons**:

- ❌ MCP SDK公式サポートが限定的（TypeScriptが主）
- ❌ 型システムが弱い（Type Hintsはあるが強制力なし）
- ❌ パフォーマンスがやや劣る
- ❌ JSON Schema → Python型生成ツールが少ない
- ❌ パッケージ管理が複雑（pip, poetry, conda等）

### Option C: Go 1.21+

**概要**: Google開発の静的型付け言語

**Pros**:

- ✅ 高速（コンパイル済みバイナリ）
- ✅ 静的型付け
- ✅ シングルバイナリ配布可能
- ✅ クロスプラットフォーム

**Cons**:

- ❌ MCP SDK公式サポートなし
- ❌ JSON処理が冗長（構造体定義が必要）
- ❌ JSON-LD/RDFライブラリが少ない
- ❌ 開発速度がやや遅い（ボイラープレート多）
- ❌ ジェネリクスが未成熟

### Option D: Rust 1.70+

**概要**: システムプログラミング言語

**Pros**:

- ✅ 最高レベルのパフォーマンス
- ✅ 強力な型システム
- ✅ メモリ安全性

**Cons**:

- ❌ MCP SDK公式サポートなし
- ❌ 学習曲線が急
- ❌ 開発速度が遅い（所有権システム等）
- ❌ JSON処理がやや冗長（serde等必要）
- ❌ 開発者人口が少ない（採用困難）
- ❌ プロジェクトの要求に対してオーバースペック

### Option E: Java/Kotlin

**概要**: JVM言語

**Pros**:

- ✅ 成熟したエコシステム
- ✅ 静的型付け
- ✅ 大規模開発実績

**Cons**:

- ❌ MCP SDK公式サポートなし
- ❌ JSON処理がやや冗長
- ❌ 起動が遅い（JVM）
- ❌ CLIツールには重すぎる
- ❌ 開発者体験がモダンでない

### Option F: JavaScript (Node.js)

**概要**: 型なしJavaScript

**Pros**:

- ✅ JSON処理がネイティブ
- ✅ MCP SDK対応
- ✅ エコシステムが豊富

**Cons**:

- ❌ 型安全性ゼロ（大規模開発で問題）
- ❌ IDEサポートが限定的
- ❌ リファクタリングが困難
- ❌ バグ混入リスクが高い
- ❌ TypeScriptが利用可能なのに選ぶ理由がない

## Comparison Matrix

| 評価基準                           | 重み | TypeScript | Python | Go  | Rust | Java/Kotlin | JavaScript |
| ---------------------------------- | ---- | ---------- | ------ | --- | ---- | ----------- | ---------- |
| **型安全性**                       | 5    | 5          | 2      | 5   | 5    | 5           | 0          |
| **MCP SDK対応**                    | 5    | 5          | 3      | 0   | 0    | 0           | 5          |
| **JSON処理容易性**                 | 5    | 5          | 5      | 3   | 3    | 3           | 5          |
| **エコシステム（必要ライブラリ）** | 4    | 5          | 4      | 2   | 2    | 3           | 5          |
| **IDE サポート**                   | 4    | 5          | 4      | 4   | 4    | 5           | 3          |
| **開発速度**                       | 4    | 5          | 5      | 3   | 2    | 3           | 5          |
| **パフォーマンス**                 | 3    | 4          | 2      | 5   | 5    | 3           | 4          |
| **採用可能性（開発者人口）**       | 3    | 5          | 5      | 3   | 2    | 4           | 5          |
| **AI生成コード親和性**             | 3    | 5          | 5      | 3   | 2    | 3           | 5          |
| **学習コスト（低いほど良い）**     | 2    | 4          | 5      | 3   | 1    | 3           | 5          |
| **合計**                           | 38   | **182**    | 151    | 116 | 102  | 126         | 165        |
| **正規化スコア（/30）**            | -    | **28.7**   | 23.8   | 18  | 16   | 19.9        | 26         |

**重み付け理由**:

- **型安全性（5）**: 大規模開発での保守性と品質保証に直結
- **MCP SDK対応（5）**: 主要インターフェース（ADR-013）、公式サポートが必須
- **JSON処理容易性（5）**: コア機能（ADR-001）の実装効率に直結
- **エコシステム（4）**: 必要ライブラリの入手可能性と品質
- **IDE サポート（4）**: 開発効率と開発者体験に直結
- **開発速度（4）**: プロトタイピングと反復開発の速度
- **パフォーマンス（3）**: 重要だが、最適化で改善可能
- **採用可能性（3）**: 開発者の確保と参入障壁
- **AI生成コード親和性（3）**: AI支援開発の効率性
- **学習コスト（2）**: 重要だが、ドキュメントで軽減可能

## Consequences

### Positive

- ✅ **型安全性**: コンパイル時にバグを検出
- ✅ **MCP対応**: 公式SDKで確実に動作
- ✅ **JSON処理**: ネイティブサポートで高速・簡潔
- ✅ **エコシステム**: 必要なライブラリが全て揃う
- ✅ **開発効率**: IDE補完、リファクタリング等が強力
- ✅ **AI生成対応**: AIが生成しやすい構文
- ✅ **Bun統合**: 高速実行・テスト可能（ADR-009）
- ✅ **採用容易**: 開発者の確保が容易

### Negative

- ⚠️ **コンパイル必要**: ビルドステップが増える
- ⚠️ **ランタイム型チェックなし**: JSON入力の検証は別途必要

### Mitigation

- **コンパイル**:
  - Bunで高速コンパイル（ミリ秒レベル）
  - Watch modeで自動再コンパイル
  - `tsc`不要（Bun直接実行）
- **ランタイム検証**:
  - JSON Schemaで入力検証（ADR-002）
  - Ajvによる高速バリデーション（ADR-004）

## Implementation Notes

### TypeScript設定

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["bun-types"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### プロジェクト構造

```text
src/
├── engines/           # コアエンジン
│   ├── validation-engine.ts
│   ├── semantic-engine.ts
│   └── ...
├── tools/             # MCPツール
│   ├── validate.ts
│   └── ...
├── types/             # 型定義
│   ├── generated/     # JSON Schemaから自動生成
│   └── manual/        # 手動定義
└── utils/             # ユーティリティ
```

### 型生成ワークフロー

```bash
# JSON Schemaから型定義を生成
bun run json-schema-to-typescript schemas/*.schema.json --output src/types/generated/
```

### Strict モード

全ての`strict`オプションを有効化：

- `strictNullChecks`: null/undefinedを厳密に扱う
- `strictFunctionTypes`: 関数型の厳密性
- `strictBindCallApply`: bind/call/applyの型チェック
- `strictPropertyInitialization`: プロパティ初期化チェック
- `noImplicitAny`: 暗黙的anyを禁止
- `noImplicitThis`: 暗黙的thisを禁止

### バージョン戦略

- **最小サポートバージョン**: TypeScript 5.0+
- **推奨バージョン**: TypeScript 5.3+（最新の型システム機能）
- **アップグレードポリシー**: マイナーバージョンは積極的に追従

## Based on

なし（基礎となるADR）
