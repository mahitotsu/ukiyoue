# Specifications

このディレクトリには、Ukiyoue フレームワーク自体の**仕様書**が含まれます。

## 📋 概要

**目的**: フレームワークの設計思想、要件、アーキテクチャを文書化する

## 📁 構成

```
specs/
├── README.md                    # このファイル
├── concept.md                   # コンセプトと背景
├── requirements.md              # 要件定義
├── architecture.md              # アーキテクチャ設計
└── design-decisions/            # 設計判断の記録(ADR)
    ├── README.md                # ADRインデックス
    ├── 001-data-format-and-schema.md
    ├── 002-json-schema-draft-version.md
    ├── 003-json-ld-version.md
    └── 004-tool-implementation-language.md
```

## 📝 主要ドキュメント

### concept.md

**内容**: プロジェクトのコンセプトと背景  
**読者**: 全メンバー、ステークホルダー  
**重要度**: 🔴 Critical

### requirements.md

**内容**: フレームワークの要件定義  
**読者**: 開発者、AI Agent  
**重要度**: 🔴 Critical

### architecture.md

**内容**: システムアーキテクチャ設計  
**読者**: 開発者  
**重要度**: 🟡 High

### design-decisions/

**内容**: 技術選定の意思決定記録（ADR）  
**読者**: 開発者、アーキテクト  
**重要度**: 🟡 High

**主要な ADR**:

- ADR-001: データフォーマット選定（JSON + JSON Schema + JSON-LD）
- ADR-002: JSON Schema Draft-07 選定
- ADR-003: JSON-LD 1.1 選定
- ADR-004: TypeScript + Bun 選定

## 🎯 このドキュメント群の役割

### 1. プロジェクトの羅針盤

開発の方向性を示し、判断の基準を提供します。

### 2. コンテキストの共有

なぜこのフレームワークが必要なのか、何を目指しているのかを共有します。

### 3. 実装のガイド

具体的な実装の指針を提供します。

## 🔄 既存ドキュメントの移行

以下のドキュメントを `docs/` から `specs/` に再構成しました：

```yaml
migration_completed:
  docs/background.md → specs/concept.md:
    status: ✅ 完了
    description: フレームワークのコンセプトと背景として整理

  docs/requirements.md → specs/requirements.md:
    status: ✅ 完了
    description: フレームワークの要件（FR-CONV/AUTO/REUSE）として整理

  新規作成:
    specs/architecture.md:
      status: ✅ 完了
      description: 4層アーキテクチャ設計を定義

    specs/design-decisions/:
      status: ✅ 完了
      description: 全技術選定をADRとして文書化（4件）
```

## 📚 読む順序

**初めての方**:

1. `concept.md` - なぜこのフレームワークが必要か
2. `requirements.md` - 何を実現するのか
3. `architecture.md` - どう実現するのか

**開発者**:

1. `requirements.md` - 要件の確認
2. `architecture.md` - アーキテクチャの理解
3. `specifications/` - 詳細仕様の参照
4. `design-decisions/` - 設計判断の背景理解
