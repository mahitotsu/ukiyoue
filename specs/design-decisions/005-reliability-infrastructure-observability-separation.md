# ADR-005: Reliability, Infrastructure, Observability Architecture の分離

## Status

**承認済み** (Accepted)

## Context

### Background

Ukiyoue フレームワークで扱う成果物の分類（タクソノミー）を設計する際、非機能要件（可用性、性能、運用性）に関連する成果物の責務分担と依存関係が課題となった。

当初の設計では、以下の成果物を Layer 3（設計レイヤー）に配置することを検討していた：

- **Infrastructure Design**: インフラストラクチャの構成設計
- **SRE Architecture**: 信頼性・監視・ログの設計

しかし、設計を進める中で以下の問題が明らかになった：

1. **依存関係の方向性が不明確**
   - SRE が可用性要件を定義 → Infrastructure がそれを実現するのか？
   - Infrastructure が基盤を定義 → SRE がそれを監視するのか？

2. **責務の重複**
   - 冗長化設計は Infrastructure か SRE か？
   - DR（災害復旧）設計はどちらに属するか？
   - 容量計画はどちらが扱うか？

3. **密結合の懸念**
   - 2つの成果物を並列に配置すると相互参照が必要になり、密結合する
   - どちらを先に作成すべきか不明確

4. **粒度の不統一**
   - "SRE Architecture" が監視・ログだけでなく、可用性戦略や容量計画まで含むと責務が大きすぎる
   - 一方で "Infrastructure Design" と名称が不統一（Design vs Architecture）

### Requirements

この決定は、以下のフレームワーク要件と設計原則を満たす必要がある：

| 要件・原則             | 説明                                            | 重要度      |
| ---------------------- | ----------------------------------------------- | ----------- |
| **明確な責務分担**     | 各成果物の役割と範囲が明確                      | 🔴 Critical |
| **単方向依存**         | 循環依存や相互参照を避ける                      | 🔴 Critical |
| **トレーサビリティ**   | 非機能要件から実装までの流れが明確              | 🟡 High     |
| **専門性の尊重**       | インフラエンジニア、SRE、運用チームの役割に対応 | 🟡 High     |
| **業界標準との整合性** | AWS Well-Architected、Google SRE Book との整合  | 🟢 Medium   |

### Decision Criteria

| 基準                 | 説明                       | 重要度      |
| -------------------- | -------------------------- | ----------- |
| **密結合の回避**     | 相互参照や循環依存がない   | 🔴 Critical |
| **依存関係の明確性** | 成果物の作成順序が明確     | 🔴 Critical |
| **責務の明確さ**     | 各成果物の役割が一義的     | 🔴 Critical |
| **分業のしやすさ**   | 各専門家が独立して作業可能 | 🟡 High     |
| **成果物数の適切さ** | 過度に増やさない           | 🟢 Medium   |

## Options

### Option 1: SRE → Infrastructure（要件駆動）

#### Description

SRE Architecture を上位に配置し、Infrastructure Architecture がそれを実現する構造：

```text
Non-Functional Requirements → SRE Architecture → Infrastructure Architecture
```

**SRE Architecture の責務**:

- SLO/SLI/SLA 定義
- 可用性戦略（冗長化、フェイルオーバー）
- 容量計画（トラフィック予測、リソース見積もり）
- 監視・アラート戦略
- DR要件（RPO/RTO）

**Infrastructure Architecture の責務**:

- SRE の要求を満たすインフラ構成
- Multi-AZ構成、バックアップ構成
- ネットワーク、サーバー、データストア

#### Pros

- ✅ **要件駆動**: 非機能要件 → 信頼性戦略 → インフラ実装の流れが論理的
- ✅ **トレーサビリティ**: 「なぜこのインフラ構成なのか」が明確
- ✅ **責務明確**: SRE が「何が必要か」、Infrastructure が「どう実現するか」

#### Cons

- ❌ **技術制約の考慮不足**: インフラの技術的制約（クラウドプロバイダーの制限等）を SRE 段階で考慮できない
- ❌ **SRE の責務過大**: 可用性戦略が技術詳細に踏み込みすぎる可能性
- ❌ **現実との乖離**: 実際の開発では Infrastructure の技術選定が先行することが多い

### Option 2: Infrastructure → SRE（実装駆動）

#### Description

Infrastructure Architecture を基盤として、SRE Architecture が運用設計を行う構造：

```text
Non-Functional Requirements → Infrastructure Architecture → SRE Architecture
```

**Infrastructure Architecture の責務**:

- クラウドプロバイダー選定
- ネットワーク構成
- コンピューティングリソース
- データストア
- 冗長化構成

**SRE Architecture の責務**:

- インフラを踏まえた監視設計
- アラート設計
- インシデント対応フロー

#### Pros

- ✅ **現実的**: インフラの技術制約を最初から考慮できる
- ✅ **SRE の焦点明確**: 運用・監視に集中できる

#### Cons

- ❌ **非機能要件の反映不足**: 可用性要件が Infrastructure に直接流れ込み、SRE の戦略が反映されにくい
- ❌ **トレーサビリティ低下**: 「なぜこの冗長化設計なのか」の根拠が不明確
- ❌ **責務の混乱**: Infrastructure が可用性設計も担うと責務が肥大化

### Option 3: 並列配置 + 相互参照

#### Description

SRE Architecture と Infrastructure Architecture を並列に配置し、相互に参照する構造：

```text
Non-Functional Requirements
  ├→ Infrastructure Architecture ⇄ SRE Architecture
  └→ (相互参照)
```

#### Pros

- ✅ **両方の視点を尊重**: インフラと SRE の両方の専門性を活かせる
- ✅ **現実の開発に近い**: 実際には並行して議論される

#### Cons

- ❌ **密結合**: 相互参照により強い結合が生じる
- ❌ **作成順序不明**: どちらを先に作るべきか不明確
- ❌ **循環依存リスク**: 依存関係グラフが複雑化
- ❌ **責務重複**: 冗長化、DR、容量計画をどちらに書くか曖昧

### Option 4: 統合（1つの成果物）

#### Description

Infrastructure & Reliability Architecture として1つの成果物に統合：

- インフラ構成 + 可用性設計 + 監視戦略 + 容量計画

#### Pros

- ✅ **密結合の回避**: 1つの成果物なので依存関係が単純
- ✅ **完結性**: 関連情報がすべて1箇所に集約

#### Cons

- ❌ **責務過大**: 1つの成果物が扱う範囲が広すぎる
- ❌ **分業困難**: インフラエンジニアと SRE が同じ成果物を編集すると衝突
- ❌ **成果物の肥大化**: 管理が困難になる
- ❌ **再利用性低下**: 一部だけを参照したい場合に不便

### Option 5: 3層分割（Reliability → Infrastructure → Observability）

#### Description

非機能要件に関連する成果物を以下の3つに分割し、階層的な依存関係を持たせる：

```text
Non-Functional Requirements
  ↓
Reliability Architecture（抽象的な信頼性要件）
  ↓
Infrastructure Architecture（具体的なインフラ構成）
  ↓
Observability Architecture（監視・運用設計）
```

**Reliability Architecture の責務**:

- SLO/SLI/SLA 定義
- 可用性レベル（99.9%等）
- 冗長化レベル（Multi-AZ必要、等の抽象要件）
- DR要件（RPO/RTO）
- 容量要件（想定トラフィック、成長予測）

**Infrastructure Architecture の責務**:

- Reliability の要求を満たす具体的なインフラ構成
- ネットワーク構成
- コンピューティングリソース
- Multi-AZ構成（Reliability要件の実現）
- バックアップ構成（DR要件の実現）
- Auto Scaling 設計（容量要件の実現）

**Observability Architecture の責務**:

- Infrastructure を踏まえた監視設計
- メトリクス定義
- ログフォーマット・ログレベル
- トレース設計
- アラート設計・閾値
- インシデント対応フロー

#### Pros

- ✅ **階層的依存で密結合回避**: 単方向の依存関係（Non-Functional Req → Reliability → Infrastructure → Observability）
- ✅ **責務の明確化**: Reliability（何が必要か）、Infrastructure（どう実現するか）、Observability（どう確認するか）
- ✅ **ロールの明確化**: 各成果物が専門家の役割に対応（アーキテクト/SRE、インフラエンジニア、SRE/運用チーム）
- ✅ **トレーサビリティ**: 非機能要件 → 信頼性戦略 → インフラ実装 → 監視設計の流れが明確
- ✅ **業界標準との整合**: AWS Well-Architected の Reliability Pillar、Google SRE Book の SLO駆動設計と整合
- ✅ **分業しやすい**: 各成果物を独立して作成可能

#### Cons

- ❌ **成果物の増加**: Layer 3 が 9種類 → 11種類に増加（管理コスト）
- ❌ **階層の増加**: 依存関係が長くなり、複雑に見える可能性
- ❌ **実際の開発との乖離**: 現実には並行して議論されることが多い

## Decision

### 選定結果

Option 5（3層分割: Reliability → Infrastructure → Observability）を採用する

### Rationale

Decision Criteria の Critical 項目をすべて満たすのは Option 5 のみ：

1. **密結合の回避** (Critical): 階層的な単方向依存により、相互参照や循環依存が発生しない
2. **依存関係の明確性** (Critical): Reliability → Infrastructure → Observability の順序が明確
3. **責務の明確さ** (Critical): 各成果物の役割が一義的
   - Reliability: 「何が必要か」（抽象）
   - Infrastructure: 「どう実現するか」（具体）
   - Observability: 「どう確認するか」（運用）

Option 1 と Option 2 は2択で一方を選ぶ必要があり、どちらも欠点がある。Option 3 は密結合を招き、Option 4 は責務が過大になる。

Option 5 は成果物が増えるというデメリットがあるが、以下の理由から許容可能：

- **品質向上**: 責務が明確になり、各成果物の品質が向上
- **並行作業可能**: 実際の開発では Reliability と Infrastructure を並行して作業し、相互レビューで整合性を確保すればよい
- **業界標準**: AWS Well-Architected Framework の Reliability Pillar、Google SRE Book の SLO駆動設計と整合しており、理解しやすい

また、Context で示した要件（明確な責務分担、単方向依存、トレーサビリティ、専門性の尊重、業界標準との整合性）のすべてを満たすには、抽象と具体を分離し、階層的に整理する必要がある。

### 用語の統一

同時に、Layer 3 の成果物名を "Architecture" に統一する：

| 旧名称                      | 新名称                               |
| --------------------------- | ------------------------------------ |
| System Architecture         | Runtime Architecture                 |
| Infrastructure Design       | Infrastructure Architecture          |
| Security Design             | Security Architecture                |
| Monitoring & Logging Design | → Reliability + Observability に分割 |

これにより、Layer 3 = "Architecture Layer" として一貫性が高まり、ADR（Architecture Decision Record）とも整合する。

## Consequences

### Positive

- ✅ **明確な責務分担**: 各成果物の役割が一義的で、重複や曖昧さがない
- ✅ **トレーサビリティ向上**: 非機能要件 → 信頼性戦略 → インフラ実装 → 監視設計の流れを追跡可能
- ✅ **専門家の分業促進**: アーキテクト、インフラエンジニア、SRE、運用チームの役割が明確
- ✅ **業界標準との整合**: AWS Well-Architected、Google SRE Book との対応が明確
- ✅ **自動生成しやすい**: 階層的依存により、上位から下位への自動生成が容易（Ukiyoue の目標に合致）
- ✅ **検証しやすい**: 依存関係が単方向なので、整合性チェックが容易
- ✅ **用語の統一**: Layer 3 がすべて "Architecture" で統一され、一貫性が向上

### Negative

- ❌ **成果物数の増加**: Layer 3 が 9種類 → 11種類に増加（管理コスト）
- ❌ **学習コスト**: 3つの成果物の違いを理解する必要がある
- ❌ **階層の長さ**: 依存関係が長くなり、全体像の把握がやや複雑

### Risks

- ⚠️ **実際の開発プロセスとの乖離**: 現実には Reliability と Infrastructure を並行して議論することが多く、厳密な階層に従わない可能性
- ⚠️ **責務の境界が曖昧になる可能性**: 「Multi-AZ は Reliability か Infrastructure か」など、境界線が曖昧になるケース
- ⚠️ **成果物の粒度調整**: 将来、さらに細分化や統合が必要になる可能性

### Mitigation

- 💡 **並行作業を許容**: 成果物は分離するが、作成プロセスでは並行して作業し、相互レビューで整合性を確保
- 💡 **明確なガイドライン**: 各成果物の責務を詳細に定義し、境界線を明確化（artifact-taxonomy.md で詳述）
- 💡 **依存関係の可視化**: Mermaid グラフで依存関係を可視化し、全体像を把握しやすくする
- 💡 **テンプレート提供**: 各成果物のテンプレートを用意し、何を書くべきかを明確化
- 💡 **段階的導入**: 最初は Reliability と Infrastructure を統合し、後から Observability を分離する段階的導入も可能

## Prerequisites

- [ADR-001](001-data-format-and-schema.md): JSON + JSON Schema + JSON-LD による成果物の構造化が前提

## 影響を受ける成果物

### Layer 3: 設計（9種類 → 11種類）

| #   | 成果物名                       | 変更                              |
| --- | ------------------------------ | --------------------------------- |
| 1   | Architecture Decision Record   | 変更なし                          |
| 2   | Runtime Architecture           | 旧 System Architecture から改名   |
| 3   | Data Model                     | 変更なし                          |
| 4   | UI/UX Specification            | 変更なし                          |
| 5   | API Specification              | 変更なし                          |
| 6   | Database Schema                | 変更なし                          |
| 7   | Security Architecture          | 旧 Security Design から改名       |
| 8   | **Reliability Architecture**   | **新規**                          |
| 9   | Infrastructure Architecture    | 旧 Infrastructure Design から改名 |
| 10  | **Observability Architecture** | **新規**                          |
| 11  | DevOps Architecture            | **新規**                          |

### Layer 4: 実装・テスト（8種類 → 11種類）

| #   | 成果物名                               | 変更                                          |
| --- | -------------------------------------- | --------------------------------------------- |
| 1   | Implementation Guide                   | 変更なし                                      |
| 2   | Infrastructure as Code                 | 変更なし                                      |
| 3   | **CI/CD Pipeline Definition**          | **新規**（DevOps Architecture の実装）        |
| 4   | **Repository Configuration**           | **新規**（DevOps Architecture の実装）        |
| 5   | **Monitoring & Logging Configuration** | **新規**（Observability Architecture の実装） |
| 6   | Test Plan                              | 変更なし                                      |
| 7   | Test Specification                     | 変更なし                                      |
| 8   | Source Code                            | 変更なし                                      |
| 9   | Test Code                              | 変更なし                                      |
| 10  | Test Results                           | 変更なし                                      |
| 11  | Source Code Documentation              | 変更なし                                      |

### Layer 5: 運用（4種類、変更なし）

- Deployment Guide
- Operations Manual
- Incident Response Guide
- Troubleshooting Guide

### 依存関係の変更

**新しい依存関係**:

```text
Non-Functional Requirements → Reliability Architecture
Reliability Architecture → Infrastructure Architecture
Infrastructure Architecture → Observability Architecture
Observability Architecture → Monitoring & Logging Configuration
Monitoring & Logging Configuration → Operations Manual
Monitoring & Logging Configuration → Troubleshooting Guide
```

### 合計成果物数

- Layer 1: 2種類
- Layer 2: 3種類
- Layer 3: **11種類**（+2）
- Layer 4: **11種類**（+3）
- Layer 5: 4種類
- **合計: 31種類**（旧 25種類 → +6）

## 参考資料

- [AWS Well-Architected Framework - Reliability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/)
- [Google SRE Book - Service Level Objectives](https://sre.google/sre-book/service-level-objectives/)
- [ISO/IEC 25010 (SQuaRE) - 品質特性モデル](https://www.iso.org/standard/35733.html)
- [NIST SP 800-53 - Security and Privacy Controls](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final)
