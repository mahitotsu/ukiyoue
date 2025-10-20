# Specifications

このディレクトリには、Ukiyoue フレームワーク自体の**仕様書**が含まれます。

## 📋 概要

**目的**: フレームワークの設計思想、要件、アーキテクチャを文書化する

## 📁 構成

```text
specs/
├── README.md                    # このファイル
├── concept.md                   # コンセプトと背景
├── requirements.md              # 要件定義
├── architecture.md              # アーキテクチャ設計
├── artifact-overview.md         # 成果物分類の全体像
├── artifact-definitions.md      # 成果物詳細定義（40種類）
├── artifact-relationships.md    # 成果物間の依存関係
└── design-decisions/            # 設計判断記録（ADR）
    ├── README.md
    ├── 001-data-format-and-schema.md
    ├── 002-json-schema-draft-version.md
    ├── 003-json-ld-version.md
    ├── 004-tool-implementation-language.md
    ├── 005-executable-code-representation.md
    ├── 006-reliability-infrastructure-observability-separation.md
    └── 007-json-artifact-traceability.md
```

## 📝 主要ドキュメント

### concept.md

- **内容**: プロジェクトのコンセプトと背景
- **読者**: 全メンバー、ステークホルダー
- **重要度**: 🔴 Critical

### requirements.md

- **内容**: フレームワークの要件定義
- **読者**: 開発者、AI Agent
- **重要度**: 🔴 Critical

### architecture.md

- **内容**: システムアーキテクチャ設計
- **読者**: 開発者
- **重要度**: 🟡 High

### artifact-overview.md

- **内容**: 成果物分類の全体像（レイヤー構造、サマリー）
- **読者**: スキーマ設計者、開発者
- **重要度**: 🟡 High

### artifact-definitions.md

- **内容**: 40種類の成果物詳細定義（識別子、目的、内容、入力、読者等）
- **読者**: スキーマ設計者、開発者
- **重要度**: 🟡 High

### artifact-relationships.md

- **内容**: 成果物間の依存関係、データフロー、詳細化チェーン
- **読者**: スキーマ設計者、開発者
- **重要度**: 🟡 High

### design-decisions/

- **内容**: 技術選定の意思決定記録（ADR）
- **読者**: 開発者、アーキテクト
- **重要度**: 🟡 High

#### 主要な ADR

- **ADR-001**: データフォーマット選定（JSON + JSON Schema + JSON-LD）
- **ADR-002**: JSON Schema Draft-07 選定
- **ADR-003**: JSON-LD 1.1 選定
- **ADR-004**: TypeScript + Bun 選定
- **ADR-005**: 実行可能コードのJSON化適用範囲
- **ADR-006**: Reliability, Infrastructure, Observability Architecture の分離
- **ADR-007**: JSON成果物のトレーサビリティ実現方式

## 🎯 このドキュメント群の役割

### 1. プロジェクトの羅針盤

開発の方向性を示し、判断の基準を提供します。

### 2. コンテキストの共有

なぜこのフレームワークが必要なのか、何を目指しているのかを共有します。

### 3. 実装のガイド

具体的な実装の指針を提供します。

## 読む順序

**初めての方**:

1. `concept.md` - なぜこのフレームワークが必要か
2. `requirements.md` - 何を実現するのか
3. `architecture.md` - どう実現するのか
4. `artifact-overview.md` - どんな成果物を扱うのか

**開発者**:

1. `requirements.md` - 要件の確認
2. `architecture.md` - アーキテクチャの理解
3. `artifact-definitions.md` - 成果物の詳細理解
4. `design-decisions/` - 設計判断の背景理解

**スキーマ設計者**:

1. `artifact-overview.md` - 全体構造の把握
2. `artifact-definitions.md` - 各成果物の詳細仕様
3. `artifact-relationships.md` - 依存関係とトレーサビリティ
4. `design-decisions/005-` および `007-` - データ表現方式の理解
