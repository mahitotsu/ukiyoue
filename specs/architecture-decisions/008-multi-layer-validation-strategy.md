# ADR-008: 多層検証戦略

## Status

**承認済み** (Accepted)

## Context

### Background

Ukiyoue フレームワークでは、JSON 形式の成果物に対して複数の検証が必要となる：

1. **フィールドレベルの構造**: 型、必須項目、フォーマット
2. **参照の整合性**: derivedFrom の参照先 ID が存在するか、型が正しいか
3. **グラフ全体の整合性**: トレーサビリティパスの完全性、複雑な依存関係
4. **セマンティック制約**: オントロジーレベルの整合性、推論結果の検証

これらをどのように実現するかは、フレームワークの使いやすさと AI 機能の実現可能性に直接影響する。

### Requirements

この決定は、specs/requirements.md で定義された以下のフレームワーク要件に関連する：

| 要件 ID          | 要件名                   | 関連性                                   |
| ---------------- | ------------------------ | ---------------------------------------- |
| **FR-AUTO-002**  | 自動バリデーション       | 🔴 Critical - 検証の自動化と整合性保証   |
| **FR-CONV-001**  | セマンティック検索       | 🔴 Critical - RDF グラフでの検索・推論   |
| **FR-REUSE-002** | セマンティック検索と推奨 | 🟡 High - AI による自動提案機能の基盤    |
| **FR-CONV-002**  | 動的な情報再構成         | 🟡 High - トレース関係に基づく情報再構成 |
| **FR-AUTO-001**  | 生成と検証のサイクル     | 🟡 High - 編集→検証→自動生成のサイクル   |

### Decision Criteria

| 基準                   | 説明                             | 重要度      |
| ---------------------- | -------------------------------- | ----------- |
| **検証の完全性**       | すべての制約を検証できるか       | 🔴 Critical |
| **個別検証の高速性**   | 日常的な開発で高速に動作するか   | 🔴 Critical |
| **グラフ検証の深さ**   | 複雑な依存関係を検証できるか     | 🔴 Critical |
| **AI 機能の基盤**      | セマンティック推論・検索が可能か | 🔴 Critical |
| **役割の明確性**       | 各検証の責任範囲が明確か         | 🟡 High     |
| **ツールの標準準拠性** | 既存の標準技術を活用できるか     | 🟡 High     |
| **開発効率**           | 開発者が混乱せず使えるか         | 🟡 High     |

## Options

### Option 1: 単一検証システム

#### Description

すべての検証を1つのツールで実現する（例: JSON Schema のみ、または SHACL のみ）。

#### Pros

- ✅ **シンプル**: 1つのツールを学習すればよい
- ✅ **統一性**: すべての制約が同じ形式で定義される

#### Cons

- ❌ **JSON Schema の限界**: 参照先の型チェック、グラフ検証ができない
- ❌ **SHACL のみの課題**: 個別ドキュメント検証が遅い（全ファイル読み込み必要）
- ❌ **柔軟性の欠如**: 用途に応じた最適化ができない

### Option 2: 多層検証システム（補完的）

#### Description

複数の検証ツールを**役割分担**させ、補完的に使用する：

1. **JSON Schema**: フィールドレベルの構造検証
2. **Reference Validator**: 参照の型整合性検証（artifact-input-rules.json）
3. **JSON-LD Validator**: セマンティック構文検証
4. **SHACL Validator**: グラフ全体の整合性検証

#### Pros

- ✅ **最適化**: 各検証が得意な領域に特化
- ✅ **高速な個別検証**: JSON Schema + Reference Validator で日常開発をカバー
- ✅ **深いグラフ検証**: SHACL で複雑な依存関係を検証
- ✅ **AI 機能の基盤**: SHACL + SPARQL でセマンティック検索・推論が可能
- ✅ **標準準拠**: 各領域で確立された標準技術を活用

#### Cons

- ⚠️ **学習コスト**: 複数のツールを理解する必要がある
- ⚠️ **設定の複雑さ**: 各検証ツールの設定が必要
- ⚠️ **重複検証の可能性**: 一部の制約が複数のツールで検証される

### Option 3: 段階的検証システム

#### Description

検証を段階的に実行し、エラーがあれば早期に停止する。

```bash
# Phase 1: 構造検証（高速）
JSON Schema → 失敗なら停止

# Phase 2: 参照検証（中速）
Reference Validator → 失敗なら停止

# Phase 3: グラフ検証（低速、オプション）
SHACL Validator → CI/CD や明示的リクエストのみ
```

#### Pros

- ✅ **Option 2 の利点を継承**
- ✅ **早期失敗**: 基本エラーで早期に停止、時間節約
- ✅ **選択的実行**: 用途に応じて検証レベルを選択可能

#### Cons

- ⚠️ **CLI の複雑さ**: オプションフラグの設定が必要

## Decision

**Option 3: 段階的多層検証システム**を採用する。

### Rationale

#### 主要な決定理由

1. **検証の完全性** (Critical)
   - JSON Schema: フィールド構造
   - Reference Validator: 参照の型整合性（artifact-input-rules.json で定義）
   - SHACL: グラフパターン、複雑な依存関係
   - すべてのレベルで制約を検証可能

2. **個別検証の高速性** (Critical)
   - JSON Schema + Reference Validator は**単一ドキュメント**で完結
   - SHACL はオプション（`--full-validation` フラグ）で実行
   - 日常開発では高速検証のみ実行

3. **グラフ検証の深さ** (Critical)
   - SHACL で**プロジェクト全体のトレーサビリティ**を検証
   - 例: "BG → US → UC → FR のパスが途切れていないか"
   - 例: "ADR が参照する NFR が実際に存在するか（孤立参照の検出）"

4. **AI 機能の基盤** (Critical)
   - SHACL + SPARQL でセマンティック検索が可能
   - 影響範囲分析: "BG-001 を変更すると何に影響するか"
   - 自動提案: "この FR に対応する Use Case がありません"
   - トレーサビリティの可視化と推論

5. **役割の明確性** (High)
   - 各検証ツールの責任範囲が明確
   - 重複は最小限（基本的な存在チェックのみ）

#### Option 1 を採用しなかった理由

- JSON Schema だけでは参照の型チェック、グラフ検証ができない
- SHACL だけでは個別ドキュメント検証が遅い（全ファイル読み込み必要）
- 単一ツールでは柔軟性が不足

#### Option 2（段階なし）を採用しなかった理由

- すべての検証を常に実行すると遅い
- 基本的な構造エラーでも SHACL まで実行してしまう
- 開発効率が低下

### 各検証の役割と責任範囲

#### 1. JSON Schema Validator

**対象**: 単一ドキュメント
**検証内容**: フィールドレベルの構造

```json
// 検証例
{
  "id": "us-001", // ✓ string型、パターン一致
  "title": "", // ✗ 空文字列（minLength: 1 違反）
  "derivedFrom": ["bg-001"] // ✓ 配列型
}
```

**実装**: ajv + JSON Schema Draft-07

#### 2. Reference Validator

**対象**: 単一ドキュメント + 参照先の存在・型確認
**検証内容**:

- 参照先 ID が存在するか（ファイルシステムまたはインデックス）
- **参照先の型が正しいか**（artifact-input-rules.json で定義）
- 循環参照の検出

```json
// 検証例
{
  "id": "us-001",
  "type": "user-story",
  "derivedFrom": ["bg-001"] // ✓ bg-001 が business-goal であることを確認
}
```

**実装**: TypeScript + artifact-input-rules.json

**artifact-input-rules.json** (schemas/constraints/):

- 39 成果物タイプの入力制約を定義
- 例: `"user-story": { "inputs": ["business-goal"] }`
- JSON Schema では表現できない「参照先ドキュメントの型」制約を定義

#### 3. JSON-LD Validator

**対象**: 単一ドキュメント
**検証内容**: JSON-LD 1.1 の構文、@context の妥当性

```json
// 検証例
{
  "@context": {
    "@version": 1.1,
    "@protected": true
  },
  "@type": "UserStory"
}
```

**実装**: jsonld.js

#### 4. SHACL Validator

**対象**: 複数ドキュメント（プロジェクト全体のグラフ）
**検証内容**:

- **グラフパターン検証**: トレーサビリティパスの完全性
- **関係の整合性**: 複数ドキュメントをまたぐ依存関係
- **オントロジー制約**: クラス階層、プロパティの定義域・値域

```turtle
# 検証例: User Story は Business Goal を経由して Project Charter に到達可能か
ukiyoue:UserStoryCompletenessShape
  a sh:NodeShape ;
  sh:targetClass ukiyoue:UserStory ;
  sh:sparql [
    sh:message "User Story must trace back to Project Charter via Business Goal" ;
    sh:select """
      SELECT $this WHERE {
        $this a ukiyoue:UserStory .
        $this ukiyoue:derivedFrom ?bg .
        ?bg a ukiyoue:BusinessGoal .
        ?bg ukiyoue:derivedFrom ?pc .
        ?pc a ukiyoue:ProjectCharter .
      }
    """ ;
  ] .
```

**実装**: rdf-validate-shacl + N3.js

**SHACL 定義** (schemas/shacl/artifact-constraints.ttl):

- 基本構造制約（minCount/maxCount）
- グラフパターン制約（SPARQL ベース）
- オントロジー制約（クラス階層、プロパティ制約）

### CLI インターフェース

#### デフォルト（高速検証）

```bash
bun src/validate.ts examples/us-001.json

# 実行される検証:
# ✓ JSON Schema Validator
# ✓ Reference Validator
# ✓ JSON-LD Validator
# (SHACL はスキップ)
```

#### 完全検証（グラフ検証を含む）

```bash
bun src/validate.ts examples/table-order-system/ --full-validation

# 実行される検証:
# ✓ JSON Schema Validator (各ファイル)
# ✓ Reference Validator (各ファイル)
# ✓ JSON-LD Validator (各ファイル)
# ✓ SHACL Validator (グラフ全体) ← 追加
```

#### 選択的スキップ

```bash
# SHACL のみスキップ（デフォルト）
bun src/validate.ts file.json --skip-shacl

# 参照チェックをスキップ（構文チェックのみ）
bun src/validate.ts file.json --skip-references

# JSON-LD をスキップ（高速化）
bun src/validate.ts file.json --skip-jsonld
```

### 検証タイミングの推奨

| タイミング         | 検証レベル                        | 理由                         |
| ------------------ | --------------------------------- | ---------------------------- |
| **ファイル保存時** | JSON Schema + Reference           | 即座のフィードバック         |
| **コミット前**     | JSON Schema + Reference + JSON-LD | 基本的な整合性確認           |
| **CI/CD (PR)**     | 完全検証（SHACL 含む）            | プロジェクト全体の整合性確認 |
| **定期チェック**   | 完全検証（SHACL 含む）            | トレーサビリティの健全性確認 |
| **リリース前**     | 完全検証（SHACL 含む）            | 最終的な品質保証             |

## Consequences

### Positive

1. **開発効率の向上**
   - 日常開発では高速な検証のみ実行（JSON Schema + Reference Validator）
   - 基本エラーで早期に失敗、時間節約

2. **品質の保証**
   - SHACL でプロジェクト全体の整合性を検証
   - トレーサビリティの断絶、孤立参照を検出

3. **AI 機能の実現**
   - SHACL + SPARQL でセマンティック検索・推論が可能
   - 影響範囲分析、自動提案機能の基盤

4. **柔軟性**
   - 用途に応じて検証レベルを選択可能
   - CI/CD では完全検証、ローカルでは高速検証

5. **標準準拠**
   - JSON Schema Draft-07（IETF 標準）
   - JSON-LD 1.1（W3C 勧告）
   - SHACL（W3C 勧告）
   - 確立された技術を活用

### Negative

1. **学習コスト**
   - 複数のツールと形式を理解する必要がある
   - artifact-input-rules.json（独自形式）
   - SHACL（Turtle/RDF 形式）

2. **設定の複雑さ**
   - 各検証ツールの設定が必要
   - CLI オプションの理解が必要

3. **SHACL の実装コスト**
   - ドキュメントインデックスの構築
   - RDF グラフの生成
   - SHACL 制約の定義

### Mitigation

#### 1. ドキュメント整備

- **schemas/README.md**: 各制約タイプの説明と使い分け
- **tools/README.md**: CLI オプションと検証レベルの説明
- **examples/**: 実例で使い方を示す

#### 2. デフォルトの最適化

- デフォルトは高速検証（SHACL スキップ）
- CI/CD で自動的に完全検証を実行

#### 3. エラーメッセージの改善

各検証ツールで明確なエラーメッセージを提供：

```text
❌ JSON Schema エラー: 'title' は必須フィールドです
❌ Reference エラー: 'us-001' が参照する 'bg-999' は存在しません
❌ Type エラー: User Story は Business Goal のみから派生可能です (参照: roadmap)
❌ SHACL エラー: User Story 'us-001' から Project Charter へのトレースパスが存在しません
```

#### 4. 段階的実装

Phase 1（既存）:

- ✅ JSON Schema Validator
- ✅ Reference Validator（型チェック含む）
- ✅ JSON-LD Validator

Phase 2（実装中）:

- 🔄 SHACL Validator（基本構造）
- 🔄 ドキュメントインデックス
- 🔄 RDF グラフ構築

Phase 3（将来）:

- ⏳ SPARQL クエリ API
- ⏳ 影響範囲分析ツール
- ⏳ AI 自動提案機能

## Related Decisions

- **ADR-001**: データフォーマット・スキーマ定義の選定
  - JSON + JSON Schema を採用 → JSON Schema Validator の基盤
- **ADR-002**: JSON Schema バージョンの選定
  - Draft-07 を採用 → ツールサポートが豊富
- **ADR-003**: JSON-LD バージョンの選定
  - JSON-LD 1.1 を採用 → SHACL + RDF の基盤
- **ADR-007**: JSON 成果物のトレーサビリティ実現方式
  - 埋め込み + 自動生成マトリクス → Reference Validator + SHACL で検証

## References

### 標準仕様

- **JSON Schema Draft-07**: <https://json-schema.org/specification-links.html#draft-7>
- **JSON-LD 1.1**: <https://www.w3.org/TR/json-ld11/>
- **SHACL (Shapes Constraint Language)**: <https://www.w3.org/TR/shacl/>
- **SPARQL 1.1**: <https://www.w3.org/TR/sparql11-query/>

### 実装ライブラリ

- **ajv**: JSON Schema validator for JavaScript
- **jsonld.js**: JSON-LD processor for JavaScript
- **rdf-validate-shacl**: SHACL validator for JavaScript
- **N3.js**: RDF library for JavaScript

### 類似アプローチ

- **Apache Jena**: Java での多層検証（RDF + SHACL）
- **Stardog**: RDF データベースでの推論 + SHACL 検証
- **TopBraid**: SHACL ベースのデータガバナンス
