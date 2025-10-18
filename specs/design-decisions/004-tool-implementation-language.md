# ADR-004: ツール実装言語とランタイムの選定

## Status

**承認済み** (Accepted)

## Context

### Background

ADR-001〜003 で、データフォーマット（JSON + JSON Schema + JSON-LD）と各仕様バージョンが決定した。次に、これらを処理するツール（バリデータ、変換ツール、CLI など）の実装言語とランタイムを選定する必要がある。

### Requirements

この決定は、specs/requirements.md より以下のフレームワーク要件に影響する：

| 要件 ID         | 要件名             | 関連性                             |
| --------------- | ------------------ | ---------------------------------- |
| **FR-AUTO-002** | 自動バリデーション | 🔴 Critical - バリデータ実装が必須 |
| **FR-AUTO-003** | Markdown 自動生成  | 🔴 Critical - 変換ツール実装が必須 |
| **FR-CONV-003** | エディタ統合       | 🟡 High - エディタ拡張の実装が必要 |

### Decision Criteria

| 基準                  | 説明                                  | 重要度      |
| --------------------- | ------------------------------------- | ----------- |
| **JSON エコシステム** | JSON Schema, JSON-LD ライブラリの充実 | 🔴 Critical |
| **実行速度**          | バリデーション・変換の処理速度        | 🔴 Critical |
| **学習コスト**        | 開発者の習得容易性                    | 🟡 High     |
| **配布容易性**        | ツールのインストール・配布の簡単さ    | 🟡 High     |
| **保守性**            | コードの可読性・型安全性              | 🟡 High     |

## Options

### Option 1: TypeScript + Bun

#### Description

- **言語**: TypeScript（静的型付け JavaScript）
- **ランタイム**: Bun（高速 JavaScript ランタイム）
- **主要ライブラリ**: ajv (JSON Schema Draft-07), jsonld.js (JSON-LD 1.1)

#### Pros

- ✅ **最高の JSON エコシステム**: ajv, jsonld.js など成熟したライブラリが豊富
- ✅ **圧倒的な実行速度**: Bun は Node.js より 3〜4 倍高速（特に I/O 処理）
- ✅ **型安全性**: TypeScript により、コンパイル時型チェックで品質向上
- ✅ **学習コスト低**: JavaScript/TypeScript は開発者人口が多く情報豊富
- ✅ **配布容易**: `bun build --compile` で単一バイナリ生成可能
- ✅ **エディタ統合**: VSCode 拡張を TypeScript で容易に実装可能

#### Cons

- ❌ **Bun の成熟度**: Node.js より新しく、エッジケースで不具合の可能性
- ❌ **エコシステム移行**: 一部 npm パッケージが Bun で未対応の場合がある

### Option 2: TypeScript + Node.js

#### Description

- **言語**: TypeScript
- **ランタイム**: Node.js（安定した JavaScript ランタイム）
- **主要ライブラリ**: ajv (JSON Schema Draft-07), jsonld.js (JSON-LD 1.1)

#### Pros

- ✅ **最高の JSON エコシステム**: ajv, jsonld.js など成熟したライブラリが豊富
- ✅ **安定性**: Node.js は実績があり、エッジケースの問題が少ない
- ✅ **エコシステム成熟**: npm パッケージが最も充実
- ✅ **型安全性**: TypeScript により品質向上
- ✅ **学習コスト低**: JavaScript/TypeScript は開発者人口が多い

#### Cons

- ❌ **実行速度**: Bun より 3〜4 倍遅い（特に I/O 処理）
- ❌ **起動時間**: Bun より起動が遅く、CLI としてのレスポンスが劣る
- ❌ **バイナリ化**: pkg や nexe が必要で、Bun ほど簡単ではない

### Option 3: Python

#### Description

- **言語**: Python
- **主要ライブラリ**: jsonschema (JSON Schema), PyLD (JSON-LD)

#### Pros

- ✅ **AI/NLP 統合**: 将来的な AI 機能拡張に有利
- ✅ **学習コスト低**: Python は人気が高く情報豊富
- ✅ **ライブラリ充実**: データ処理系のライブラリが豊富

#### Cons

- ❌ **JSON Schema サポート弱い**: jsonschema は ajv ほど高機能・高速ではない
- ❌ **実行速度**: TypeScript (Bun/Node.js) より大幅に遅い
- ❌ **型安全性**: 動的型付けでコンパイル時チェックがない
- ❌ **配布困難**: PyInstaller などが必要で、バイナリサイズが大きい
- ❌ **エディタ統合**: VSCode 拡張は TypeScript が前提

## Decision

**Option 1 (TypeScript + Bun) を採用する**

### Rationale

Decision Criteria の Critical 項目（JSON エコシステム、実行速度）を最も満たすのは TypeScript + Bun：

1. **JSON エコシステム** (Critical): ajv (JSON Schema Draft-07)、jsonld.js (JSON-LD 1.1) という最高品質のライブラリを使用可能
2. **実行速度** (Critical): Bun は Node.js より 3〜4 倍高速で、大量のドキュメント処理に有利

Option 2 (TypeScript + Node.js) は安定性があるが、実行速度の差が大きい。Bun のエコシステム成熟度の懸念は、主要ライブラリ（ajv, jsonld.js）が問題なく動作することを確認済みであり、リスクは許容範囲内。

Option 3 (Python) は AI/NLP 統合で有利だが、JSON Schema サポートの弱さと実行速度の遅さが Critical 項目を満たさない。AI 機能が必要になった場合は、Python をプラグインとして追加する戦略を取る。

また、Bun は `bun build --compile` で単一バイナリを生成でき、配布容易性も高い。VSCode 拡張も TypeScript で実装可能。

## Consequences

### Positive

- ✅ **高速バリデーション**: ajv + Bun により、大量ドキュメントを高速処理可能
- ✅ **最高品質のライブラリ**: ajv, jsonld.js という業界標準ツールを活用
- ✅ **型安全性**: TypeScript により、バグを早期発見
- ✅ **配布容易**: 単一バイナリで配布可能（`bun build --compile`）
- ✅ **開発効率**: JavaScript/TypeScript の豊富な情報と開発者人口
- ✅ **エディタ統合**: VSCode 拡張を TypeScript で容易に実装

### Negative

- ❌ **Bun の新しさ**: Node.js より新しく、エッジケースで不具合の可能性
- ❌ **AI 機能**: Python ほど AI/NLP ライブラリが充実していない

### Risks

- ⚠️ **Bun のエコシステム**: 一部 npm パッケージが Bun で動作しない可能性
- ⚠️ **Bun のサポート**: Node.js ほど長期サポートが保証されていない

### Mitigation

- 💡 **Node.js フォールバック**: Bun で問題が発生した場合、Node.js に切り替え可能（コードは共通）
- 💡 **主要ライブラリ確認**: ajv, jsonld.js など Critical なライブラリの動作を事前検証
- 💡 **Python プラグイン戦略**: AI/NLP 機能が必要になった場合、Python を別プロセスで実行
- 💡 **Bun バージョン固定**: 安定版 Bun を使用し、頻繁なアップデートを避ける

## Prerequisites

- ADR-001: データフォーマット・スキーマ定義・セマンティック定義の選定
- ADR-002: JSON Schema Draft 版の選定
- ADR-003: JSON-LD バージョンの選定
