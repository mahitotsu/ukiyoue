# ADR-019: Document Metadata Strategy

## Status

Accepted

## Context

Ukiyoue Frameworkでは、ドキュメントの作成日時、更新日時、作成者などのメタデータをどのように管理するかを決定する必要があります。これらの情報はGitが既に追跡しているため、ドキュメント内に冗長に含めるべきか判断が必要です。

**要求事項**:

- ✅ Single Source of Truth原則の遵守
- ✅ データの整合性を保証
- ✅ メンテナンス負荷の最小化
- ✅ Read-Only原則との整合性（フレームワークはユーザードキュメントを変更しない）

**制約条件**:

- すべてのドキュメントはGitで管理される前提
- AIエージェントがメタデータを必要とする場合がある
- ドキュメントの可搬性を損なわない

## Decision

**ドキュメント内にメタデータフィールドを含めず、Git履歴から動的に取得する**方針を採用します。

## Rationale

### 選択理由

1. **Single Source of Truth**
   - Git commit履歴が唯一の信頼できる情報源
   - 同じ情報を2箇所で管理すると不整合が発生しやすい

2. **整合性の保証**
   - ドキュメント更新時にメタデータの更新忘れを防止
   - `updatedAt`が実際の更新日時とずれるリスクを排除

3. **メンテナンス負荷の削減**
   - ドキュメント作成・更新時にメタデータを手動管理する必要がない
   - スキーマ定義もシンプルになる

4. **Read-Only原則との整合性**
   - フレームワークはドキュメントを読み取り専用で扱う
   - Gitコマンドでメタデータを取得すれば、ドキュメントを変更せずに情報提供可能

### Git履歴から取得する情報

```bash
# 作成日時 (最初のコミット)
git log --follow --format=%aI --reverse <file> | head -1

# 更新日時 (最新のコミット)
git log -1 --format=%aI <file>

# 作成者 (最初のコミット)
git log --follow --format=%an --reverse <file> | head -1

# 最終更新者 (最新のコミット)
git log -1 --format=%an <file>
```

### ビジネス的なメタデータは許可

Git管理外の、ビジネス的な意味を持つメタデータは引き続きドキュメントに含めることができます:

- `approvedBy` - 承認者（ビジネス上の承認プロセス）
- `reviewedAt` - レビュー完了日（スプリント計画など）
- `dueDate` - 期限（プロジェクトマイルストーン）
- `version` - ビジネスバージョン（v1.0, v2.0など）

これらはGitの技術的な履歴とは異なる、ビジネスロジック上の情報です。

## Options Considered

### Option A: Git履歴から動的取得（採用）

**Pros**:

- ✅ Single Source of Truth
- ✅ データの整合性が自動的に保証される
- ✅ メンテナンス負荷ゼロ
- ✅ Read-Only原則に適合

**Cons**:

- ❌ Git履歴へのアクセスが必要（パフォーマンス影響）
- ❌ Gitリポジトリ外では情報が取得できない

### Option B: ドキュメント内に含める

**Pros**:

- ✅ Gitなしでメタデータにアクセス可能
- ✅ ドキュメント単体で完結

**Cons**:

- ❌ 更新忘れによる不整合リスク
- ❌ メンテナンス負荷が高い
- ❌ Single Source of Truth違反

### Option C: 両方を併用

**Pros**:

- ✅ Gitなしでもメタデータ利用可能
- ✅ Git履歴でバリデーション可能

**Cons**:

- ❌ 複雑性が最も高い
- ❌ 不整合時の対応が不明確

## Comparison Matrix

| 評価基準                   | 重み | Option A: Git履歴 | Option B: ドキュメント内 | Option C: 両方併用 |
| -------------------------- | ---- | ----------------- | ------------------------ | ------------------ |
| **Single Source of Truth** | 5    | 5                 | 1                        | 2                  |
| **データ整合性**           | 5    | 5                 | 2                        | 3                  |
| **メンテナンス負荷**       | 4    | 5                 | 2                        | 1                  |
| **Read-Only原則適合**      | 4    | 5                 | 3                        | 3                  |
| **ドキュメント可搬性**     | 2    | 2                 | 5                        | 5                  |
| **実装複雑度**             | 3    | 4                 | 5                        | 2                  |
| **パフォーマンス**         | 3    | 3                 | 5                        | 3                  |
| **合計**                   | -    | **108**           | **78**                   | **72**             |
| **正規化スコア（/30）**    | -    | **27.7**          | **20.0**                 | **18.5**           |

**重み付け理由**:

- **Single Source of Truth（5）**: データの信頼性と一貫性の基礎
- **データ整合性（5）**: メタデータと実際の履歴の不一致を防ぐために最重要
- **メンテナンス負荷（4）**: 開発者の生産性と長期的な保守性に直結
- **Read-Only原則適合（4）**: フレームワークの基本設計方針に影響
- **ドキュメント可搬性（2）**: Git管理が前提のため優先度は低い
- **実装複雑度（3）**: フレームワークの開発速度と保守性に影響
- **パフォーマンス（3）**: 通常の用途では問題にならないレベル

## Consequences

### Positive

- ✅ **データの一貫性**: Git履歴が唯一の情報源となり、不整合が発生しない
- ✅ **メンテナンスフリー**: ドキュメント更新時にメタデータの手動管理が不要
- ✅ **スキーマのシンプル化**: ドキュメント構造がビジネスロジックに集中できる
- ✅ **標準準拠**: Gitのbest practiceに沿った設計

### Negative

- ⚠️ Git操作の実装が必要（MCPツール、CLI）
- ⚠️ Git管理外のドキュメントでは利用不可

### Mitigation

- **Git操作の実装**: 既存のライブラリ（simple-git等）を活用し、実装負荷を最小化
- **Git管理外のドキュメント**: エラーハンドリングでグレースフルに対応（nullまたは現在時刻を返す）

## Implementation Notes

```yaml
実装が必要な箇所:
  - tools/mcp-server/: Git履歴取得機能の追加
  - tools/cli/: メタデータ表示コマンドの実装

使用するライブラリ:
  - simple-git: Node.js用Gitクライアント
  - または直接 execSync でgitコマンド実行

エラーハンドリング:
  - Git未初期化: エラーメッセージまたはnullを返す
  - 未コミットファイル: 現在時刻とシステムユーザーを使用
  - .gitignore: 通常のファイルと同様に扱う（コミット済みなら履歴取得可能）
```

### MCPツール側の実装例

```typescript
async function getDocumentMetadata(filePath: string): Promise<Metadata> {
  const createdAt = await execGit(
    `log --follow --format=%aI --reverse ${filePath} | head -1`
  );
  const updatedAt = await execGit(`log -1 --format=%aI ${filePath}`);
  const author = await execGit(
    `log --follow --format=%an --reverse ${filePath} | head -1`
  );

  return { createdAt, updatedAt, author };
}
```

### 成功基準

- [ ] Git履歴からメタデータを正確に取得できる
- [ ] 未コミットファイルでも適切にフォールバック処理される
- [ ] パフォーマンスが実用的なレベル（1ファイルあたり100ms以内）
- [ ] MCPツールとCLIの両方で利用可能

### リスクと軽減策

| リスク                          | 影響度 | 発生確率 | 軽減策                                 |
| ------------------------------- | ------ | -------- | -------------------------------------- |
| Git操作のパフォーマンス問題     | 中     | 低       | キャッシング、並列処理の実装           |
| Git管理外のファイルでのエラー   | 低     | 中       | グレースフルなエラーハンドリング       |
| Gitヒストリーの書き換え時の問題 | 低     | 低       | 警告メッセージ、ドキュメントに注意事項 |
| 大量ファイルの一括処理時の遅延  | 中     | 中       | バッチ処理、進捗表示、キャッシング     |

## References

- [ADR-001: Document Format](./001-document-format.md) - JSONフォーマット採用の根拠
- [Git log documentation](https://git-scm.com/docs/git-log) - Gitコマンドリファレンス
- [Single Source of Truth principle](https://en.wikipedia.org/wiki/Single_source_of_truth) - データ管理の基本原則

## Based on

- ADR-001: Document Format
