# SHACL Constraints

このディレクトリは、Ukiyoue フレームワークのセマンティック制約（SHACL形式）を格納します。

## 📋 概要

SHACL (Shapes Constraint Language) を使用して、JSON-LD ドキュメントのセマンティック制約を定義します。

## 🎯 目的

- JSON Schema では表現できないセマンティックレベルの制約
- RDF グラフ構造に対する高度なバリデーション
- オントロジーレベルの整合性チェック

## 📁 ディレクトリ構造（予定）

```text
shacl/
├── README.md                # このファイル
├── artifact-shapes.ttl      # 成果物の形状制約
├── traceability-shapes.ttl  # トレーサビリティ制約
└── vocabulary-shapes.ttl    # 語彙の制約
```

## 🔧 技術仕様

- **形式**: SHACL (W3C Recommendation)
- **シリアライゼーション**: Turtle (.ttl)
- **バリデーター**: Apache Jena SHACL, pySHACL 等

## 🚀 実装状況

**Status**: 未実装（将来実装予定）

## 📚 関連ドキュメント

- [SHACL Specification](https://www.w3.org/TR/shacl/)
- [Turtle Syntax](https://www.w3.org/TR/turtle/)
- [ADR-003: JSON-LD 1.1 選定](../../specs/architecture-decisions/003-json-ld-version.md)

## 💡 実装予定の制約例

### 1. トレーサビリティ制約

```turtle
# User Story は必ず Business Goal から派生する
ex:UserStoryShape
  a sh:NodeShape ;
  sh:targetClass ukiyoue:UserStory ;
  sh:property [
    sh:path ukiyoue:derivedFrom ;
    sh:class ukiyoue:BusinessGoal ;
    sh:minCount 1 ;
  ] .
```

### 2. カーディナリティ制約

```turtle
# Project Charter は derivedFrom を持たない
ex:ProjectCharterShape
  a sh:NodeShape ;
  sh:targetClass ukiyoue:ProjectCharter ;
  sh:property [
    sh:path ukiyoue:derivedFrom ;
    sh:maxCount 0 ;
  ] .
```

### 3. データ型制約

```turtle
# すべての成果物は id と title を持つ
ex:ArtifactShape
  a sh:NodeShape ;
  sh:targetClass ukiyoue:Artifact ;
  sh:property [
    sh:path dcterms:identifier ;
    sh:datatype xsd:string ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
  ] ;
  sh:property [
    sh:path dcterms:title ;
    sh:datatype xsd:string ;
    sh:minCount 1 ;
  ] .
```

## 🔍 JSON Schema vs Constraints vs SHACL

| 制約タイプ                | 実装場所                       | 形式           | 用途                               |
| ------------------------- | ------------------------------ | -------------- | ---------------------------------- |
| **構造制約**              | `schemas/layer*/*.json`        | JSON Schema    | フィールドの型、必須項目           |
| **参照タイプ制約**        | `schemas/constraints/*.json`   | 独自形式       | derivedFrom の参照先タイプ検証     |
| **セマンティック制約** ⬅ | `schemas/shacl/*.ttl` (未実装) | SHACL (Turtle) | RDF グラフ構造、オントロジー整合性 |

## ⚠️ 注意事項

- このディレクトリは現在空です（将来実装予定）
- SHACL 実装時には JSON-LD → RDF 変換が必要
- パフォーマンスへの影響を考慮して段階的に実装

## 🛠️ 今後の実装ステップ

1. [ ] SHACL バリデーターの選定（Apache Jena / pySHACL）
2. [ ] 基本的な形状定義（artifact-shapes.ttl）
3. [ ] トレーサビリティ制約（traceability-shapes.ttl）
4. [ ] CI/CD への統合
5. [ ] パフォーマンス最適化
