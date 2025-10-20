# ADR-002: JSON Schema Draft 版の選定

## Status

**承認済み** (Accepted)

## Context

### Background

ADR-001 で JSON Schema をスキーマ定義に使用することが決定した。しかし、JSON Schema には複数の Draft（仕様バージョン）が存在し、どの版を採用するかを決定する必要がある。

### Requirements

この決定は、specs/requirements.md より以下のフレームワーク要件に直接影響する：

| 要件 ID         | 要件名                 | 関連性                               |
| --------------- | ---------------------- | ------------------------------------ |
| **FR-AUTO-001** | 構造化された形式の定義 | 🔴 Critical - スキーマの表現力に影響 |
| **FR-AUTO-002** | 自動バリデーション     | 🔴 Critical - バリデータの性能・精度 |
| **FR-CONV-002** | 動的な情報再構成       | 🟡 High - スキーマベースの変換・生成 |

### Decision Criteria

| 基準               | 説明                                   | 重要度      |
| ------------------ | -------------------------------------- | ----------- |
| **ツールサポート** | バリデータ、エディタ、コード生成の充実 | �� Critical |
| **安定性**         | 仕様の成熟度、後方互換性               | 🔴 Critical |
| **機能性**         | 必要な機能が揃っているか               | 🟡 High     |
| **情報量**         | ドキュメント、事例、Q&A の豊富さ       | 🟡 High     |
| **将来性**         | 長期サポートの見込み                   | 🟢 Medium   |

## Options

### Option 1: Draft-07

#### Description

- **リリース**: 2018年
- **仕様**: IETF Internet-Draft (draft-handrews-json-schema-01)
- **状態**: 広く普及、事実上の標準

#### Pros

- ✅ **最大のツールサポート**: ajv, VSCode, JetBrains など主要ツールが完全対応
- ✅ **圧倒的な情報量**: Stack Overflow、ブログ、書籍が豊富
- ✅ **高い安定性**: 6年以上の実績、大規模プロジェクトで実証済み
- ✅ **パフォーマンス**: ajv の最適化が進んでおり、バリデーション速度が速い
- ✅ **エディタ支援**: VSCode の JSON Schema サポートは Draft-07 が最も安定

#### Cons

- ❌ **古い仕様**: 2018年リリースで、新機能がない
- ❌ **一部機能不足**: `unevaluatedProperties`, `dependentSchemas` などが未サポート
- ❌ **モジュール化なし**: スキーマの再利用性が 2019-09 より劣る

### Option 2: Draft 2019-09

#### Description

- **リリース**: 2019年
- **仕様**: IETF Internet-Draft (draft-handrews-json-schema-02)
- **状態**: Draft-07 の後継、モジュール化

#### Pros

- ✅ **モジュール化**: 仕様が Core, Validation, Hyper-Schema に分離
- ✅ **新機能**: `unevaluatedProperties`, `dependentSchemas`, `$recursiveRef`
- ✅ **スキーマ再利用**: `$defs` による定義の整理が改善
- ✅ **部分的ツール対応**: ajv 8+ でサポート

#### Cons

- ❌ **ツールサポート不完全**: VSCode, JetBrains の対応が限定的
- ❌ **情報量不足**: ドキュメント、事例が Draft-07 より少ない
- ❌ **パフォーマンス**: ajv での最適化が Draft-07 ほど進んでいない
- ❌ **移行コスト**: Draft-07 からの移行に調整が必要

### Option 3: Draft 2020-12

#### Description

- **リリース**: 2020年
- **仕様**: IETF Internet-Draft (draft-bhutton-json-schema-01)
- **状態**: 最新安定版

#### Pros

- ✅ **最新仕様**: 2020年の最新機能を含む
- ✅ **機能改善**: `prefixItems`, `$dynamicRef` などの新機能
- ✅ **仕様の洗練**: 2019-09 の問題点を修正
- ✅ **将来性**: 今後の標準となる可能性

#### Cons

- ❌ **ツールサポート最小**: ajv は部分対応のみ、他ツールは非対応が多い
- ❌ **情報量最小**: ドキュメント、事例がほとんどない
- ❌ **不安定性**: 実装経験が少なく、エッジケースが未検証
- ❌ **エディタ非対応**: VSCode などのスキーマ検証が機能しない場合がある

## Decision

### 選定結果

Option 1 (Draft-07) を採用する

### Rationale

Decision Criteria の Critical 項目（ツールサポート、安定性）を最も満たすのは Draft-07：

1. **ツールサポート** (Critical): ajv, VSCode, JetBrains など主要ツールが完全対応
2. **安定性** (Critical): 6年以上の実績、大規模プロジェクトで実証済み

Draft 2019-09 と 2020-12 は新機能があるが、ツールサポートと情報量の不足により、実用上のリスクが高い。

また、Draft-07 で不足する機能（`unevaluatedProperties` など）は、スキーマ設計の工夫で回避可能。Ukiyoue フレームワークの現在の要件（FR-AUTO-001, FR-AUTO-002, FR-CONV-002）は Draft-07 の機能で十分満たせる。

将来的に Draft 2019-09/2020-12 の機能が必要になった場合、JSON Schema は基本的に後方互換性があるため、段階的な移行が可能。

## Consequences

### Positive

- ✅ **即座の生産性**: 豊富な情報源により、学習・トラブルシュート時間を短縮
- ✅ **エディタ支援**: VSCode でのスキーマ補完、検証が完全に機能
- ✅ **バリデーション性能**: ajv の Draft-07 実装は最も最適化されており高速
- ✅ **安定性**: 実績のある仕様により、予期しない問題を回避
- ✅ **採用事例豊富**: 既存プロジェクトのスキーマを参考にできる

### Negative

- ❌ **新機能なし**: `unevaluatedProperties`, `dependentSchemas` などが使えない
- ❌ **モジュール化弱い**: スキーマの再利用性が 2019-09 より劣る
- ❌ **将来的な移行**: いずれ新 Draft への移行が必要になる可能性

### Risks

- ⚠️ **Draft-07 のサポート終了**: 将来的に IETF が Draft-07 を非推奨にする可能性
- ⚠️ **エコシステムの移行**: ツールが新 Draft に移行し、Draft-07 サポートが低下する可能性

### Mitigation

- 💡 **段階的移行**: 将来的に Draft 2019-09/2020-12 への移行パスを確保
- 💡 **機能の工夫**: Draft-07 の範囲内で最大限の表現力を追求
- 💡 **ハイブリッド戦略**: 基本は Draft-07、必要に応じて新 Draft の機能を部分的に使用
- 💡 **監視**: ツールエコシステムの動向を監視し、適切なタイミングで移行判断

## Prerequisites

- ADR-001: データフォーマット・スキーマ定義・セマンティック定義の選定
