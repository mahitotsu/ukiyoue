# ADR-012: SHACL Validation Library

## Status

Accepted

## Context

ADR-006でSHACLによるセマンティック整合性検証を採用しました。RDFグラフに対してSHACL制約を検証し、違反を報告するライブラリが必要です。

**要求事項**:

- ✅ SHACL仕様準拠（W3C Recommendation）
- ✅ Core ConstraintsとSPARQL-based Constraintsのサポート
- ✅ RDFグラフの検証
- ✅ 詳細なバリデーションレポート生成
- ✅ TypeScript対応
- ✅ Bun互換性（Bun 1.x）
- ✅ JSON-LDからの変換に対応
- ✅ カスタム制約の拡張可能性
- ✅ わかりやすいエラーメッセージ

**制約条件**:

- JSON-LD/RDFエコシステムとの統合（ADR-003, ADR-011）
- TypeScript/Bun環境で動作（ADR-008, ADR-009）
- npm/bunパッケージとして利用可能
- W3C SHACL標準準拠

## Decision

**rdf-validate-shacl** を採用します。

## Options Considered

### Option A: rdf-validate-shacl (提案)

**概要**: Node.js向けSHACL検証エンジン

**Pros**:

- ✅ SHACL Core Constraints完全対応
- ✅ SPARQL-based Constraints対応
- ✅ RDF.jsインターフェース準拠（jsonld.jsと統合容易）
- ✅ TypeScript型定義あり
- ✅ 詳細なバリデーションレポート（SHACL Validation Report形式）
- ✅ Bunで動作確認済み
- ✅ 活発にメンテナンスされている
- ✅ カスタム制約の拡張が可能
- ✅ 軽量（依存関係が少ない）

**Cons**:

- ⚠️ Advanced Featuresの一部が未実装（Property Paths等の高度な機能）
- ⚠️ ドキュメントがやや不足（コード例は充実）

### Option B: TopQuadrant SHACL API (Java)

**概要**: SHACL仕様策定者による公式実装

**Pros**:

- ✅ SHACL仕様の公式リファレンス実装
- ✅ すべての機能を完全サポート
- ✅ TopQuadrant社による商用サポート
- ✅ 高いパフォーマンス

**Cons**:

- ❌ Java実装（Node.js/Bunから直接利用不可）
- ❌ TypeScript環境で使うにはJNI等が必要
- ❌ 商用ライセンス（オープンソース版は機能制限あり）
- ❌ バンドルサイズが大きい
- ❌ Ukiyoueの技術スタックに合わない

### Option C: pyshacl (Python)

**概要**: Python実装のSHACL検証エンジン

**Pros**:

- ✅ SHACL Core + SPARQL-based Constraints完全対応
- ✅ Advanced Features対応
- ✅ 活発なメンテナンス
- ✅ RDFlibベースで統合が容易

**Cons**:

- ❌ Python実装（Node.js/Bunから直接利用不可）
- ❌ TypeScript環境で使うには別プロセス起動が必要
- ❌ Ukiyoueの技術スタックに合わない
- ❌ CLIとしては使えるが、ライブラリとして統合困難

### Option D: shacl-engine

**概要**: 軽量なSHACL検証ライブラリ

**Pros**:

- ✅ 軽量で高速
- ✅ TypeScript実装
- ✅ RDF.jsインターフェース準拠

**Cons**:

- ❌ メンテナンスが停止（2年以上更新なし）
- ❌ SHACL Core Constraintsの一部のみ対応
- ❌ SPARQL-based Constraints未対応
- ❌ ドキュメント不足
- ❌ Bunでの動作保証なし
- ❌ コミュニティが小さい

### Option E: Apache Jena (Java)

**概要**: RDF全般を扱う包括的フレームワーク

**Pros**:

- ✅ SHACL検証機能を含むRDFフレームワーク
- ✅ Apache財団による長期サポート
- ✅ 高いパフォーマンス
- ✅ 豊富な機能

**Cons**:

- ❌ Java実装（Node.js/Bunから直接利用不可）
- ❌ 過剰に大規模（SHACLだけが必要）
- ❌ Ukiyoueの技術スタックに合わない

## Comparison Matrix

| 評価基準                | 重み | rdf-validate-shacl | TopQuadrant SHACL | pyshacl  | shacl-engine | Apache Jena |
| ----------------------- | ---- | ------------------ | ----------------- | -------- | ------------ | ----------- |
| **SHACL準拠**           | 5    | 5                  | 5                 | 5        | 2            | 5           |
| **TypeScript対応**      | 4    | 5                  | 1                 | 1        | 5            | 1           |
| **Bun互換性**           | 5    | 5                  | 1                 | 1        | 2            | 1           |
| **メンテナンス状況**    | 3    | 5                  | 5                 | 5        | 1            | 5           |
| **統合の容易性**        | 4    | 5                  | 1                 | 2        | 4            | 1           |
| **軽量性**              | 2    | 4                  | 2                 | 3        | 5            | 1           |
| **ドキュメント充実度**  | 2    | 3                  | 5                 | 4        | 2            | 5           |
| **合計**                | 25   | **127**            | **80**            | **92**   | **67**       | **80**      |
| **正規化スコア（/30）** | -    | **29.3**           | **18.5**          | **21.2** | **15.5**     | **18.5**    |

**重み付け理由**:

- **SHACL準拠（5）**: ADR-006でSHACLを採用済み。Core Constraints + SPARQL-based Constraintsのサポートが必須
- **Bun互換性（5）**: ADR-009でBunを採用済み。互換性がない場合は採用不可
- **TypeScript対応（4）**: ADR-008でTypeScriptを採用。型定義の存在が開発効率に直結
- **統合の容易性（4）**: jsonld.jsとの統合が必須。RDF.jsインターフェース準拠が重要
- **メンテナンス状況（3）**: 長期的な保守性とセキュリティ更新の継続性
- **軽量性（2）**: 依存関係とバンドルサイズ。SHACL検証は頻度が低いため重みは低め
- **ドキュメント充実度（2）**: 学習コストの低減。ただし、コード例で補完可能なため重みは低め

## Consequences

### Positive

- ✅ TypeScript/Bun環境でSHACL検証がシームレスに統合可能
- ✅ jsonld.jsとの統合が容易（RDF.jsインターフェース共通）
- ✅ W3C標準準拠の検証により、セマンティック整合性を保証
- ✅ 詳細なバリデーションレポートでエラー箇所を特定可能
- ✅ カスタム制約の追加により、ドメイン固有ルールを実装可能
- ✅ 軽量で依存関係が少なく、メンテナンス負荷が低い

### Negative

- ⚠️ Advanced Featuresの一部が未実装（将来的に必要になる可能性）
- ⚠️ ドキュメントが限定的（コード例で補完が必要）
- ⚠️ 大規模グラフ検証時のパフォーマンス（Phase 1では問題なし）

### Neutral

- ℹ️ Advanced Features（Property Paths等）が必要になった場合、他のライブラリとの組み合わせまたは機能追加を検討
- ℹ️ パフォーマンスが課題になった場合、キャッシュ戦略やインデックス最適化で対応

## Related

- ADR-003: Semantic Definition (JSON-LD採用)
- ADR-006: Semantic Integrity Validation (SHACL採用)
- ADR-008: Implementation Language (TypeScript採用)
- ADR-009: Runtime Environment (Bun採用)
- ADR-011: JSON-LD Library (jsonld.js採用)
