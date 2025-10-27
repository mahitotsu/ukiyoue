# ADR-013: MCP Implementation

## Status

Accepted

## Context

architecture.mdで定義したように、UkiyoueのメインインターフェースはMCP (Model Context Protocol) Serverです。AIエージェント（Claude Desktop、Cursor、GitHub Copilot等）との統合により、リアルタイムな検証フィードバックとAI作業精度の向上を実現します。

**要求事項**:

- ✅ MCP (Model Context Protocol) 準拠
- ✅ AIエージェントとのシームレスな統合
- ✅ ツール定義の容易性
- ✅ TypeScript対応
- ✅ Bun互換性（Bun 1.x）
- ✅ 構造化されたレスポンス（JSON形式）
- ✅ エラーハンドリング
- ✅ ストリーミングサポート（大規模ドキュメント対応）
- ✅ テスト容易性

**制約条件**:

- Model Context Protocolに準拠
- TypeScript/Bun環境で動作（ADR-008, ADR-009）
- AIエージェントが直接呼び出せる形式
- 低レイテンシ（< 500ms目標）
- npm/bunパッケージとして配布

## Decision

**@modelcontextprotocol/sdk (TypeScript)** を採用します。

## Options Considered

### Option A: @modelcontextprotocol/sdk (TypeScript) (提案)

**概要**: Anthropic公式のTypeScript SDK

**Pros**:

- ✅ MCP仕様の公式SDK（Anthropic開発）
- ✅ TypeScript完全対応（型安全なツール定義）
- ✅ Server/Client両方のサポート
- ✅ ストリーミングサポート
- ✅ Bunで動作確認済み
- ✅ 活発なメンテナンス
- ✅ 豊富なドキュメントとサンプル
- ✅ Claude Desktop、Cursor等の主要AIツールで採用実績
- ✅ エラーハンドリングが組み込み済み
- ✅ テストユーティリティ提供

**Cons**:

- ⚠️ まだ比較的新しいプロトコル（仕様が進化中）
- ⚠️ パッケージサイズがやや大きい（約100KB）

### Option B: @modelcontextprotocol/sdk (Python)

**概要**: Anthropic公式のPython SDK

**Pros**:

- ✅ MCP仕様の公式SDK
- ✅ 型ヒント完全対応
- ✅ asyncioベースの非同期処理
- ✅ Claude Desktopとの統合実績

**Cons**:

- ❌ Python実装（Ukiyoueの技術スタックに合わない）
- ❌ TypeScript/Bunから直接利用不可
- ❌ Node.jsエコシステムとの統合が困難
- ❌ 別プロセス起動のオーバーヘッド

### Option C: カスタムMCP実装

**概要**: MCP仕様に基づいて独自実装

**Pros**:

- ✅ 完全なカスタマイズが可能
- ✅ 最小限の依存関係
- ✅ パフォーマンス最適化の余地

**Cons**:

- ❌ 仕様準拠の保証が困難
- ❌ メンテナンス負荷が高い
- ❌ プロトコル更新への追従が大変
- ❌ 既存AIツールとの互換性リスク
- ❌ テストコストが高い
- ❌ ドキュメント整備が必要
- ❌ コミュニティサポートなし

### Option D: gRPC

**概要**: Google製のRPCフレームワーク

**Pros**:

- ✅ 高いパフォーマンス
- ✅ TypeScript対応
- ✅ ストリーミングサポート
- ✅ 成熟した技術

**Cons**:

- ❌ MCPプロトコルではない（AIツールとの直接統合不可）
- ❌ Claude Desktop、Cursor等が未対応
- ❌ .protoファイルの管理が必要
- ❌ 学習コストが高い
- ❌ オーバースペック（UkiyoueにはMCPで十分）

### Option E: REST API

**概要**: 従来型のHTTP REST API

**Pros**:

- ✅ 広く普及した技術
- ✅ 多くのツール・ライブラリが利用可能
- ✅ デバッグが容易

**Cons**:

- ❌ MCPプロトコルではない（AIツールとの直接統合不可）
- ❌ Claude Desktop、Cursor等が未対応
- ❌ リアルタイム双方向通信が困難
- ❌ AIエージェントのワークフローに組み込みづらい
- ❌ Ukiyoueのメイン用途（AI作業支援）に不適

## Comparison Matrix

| 評価基準                | 重み | MCP SDK (TS) | MCP SDK (Py) | カスタムMCP | gRPC     | REST API |
| ----------------------- | ---- | ------------ | ------------ | ----------- | -------- | -------- |
| **MCP準拠**             | 5    | 5            | 5            | 2           | 1        | 1        |
| **AI統合の容易性**      | 5    | 5            | 5            | 3           | 1        | 1        |
| **Bun互換性**           | 4    | 5            | 1            | 5           | 4        | 5        |
| **TypeScript対応**      | 3    | 5            | 1            | 5           | 4        | 4        |
| **メンテナンス性**      | 3    | 5            | 5            | 2           | 4        | 4        |
| **実装コスト**          | 2    | 5            | 4            | 1           | 3        | 4        |
| **ドキュメント充実度**  | 2    | 5            | 5            | 1           | 4        | 5        |
| **合計**                | 24   | **145**      | **100**      | **76**      | **80**   | **92**   |
| **正規化スコア（/30）** | -    | **30.0**     | **20.7**     | **15.7**    | **16.6** | **19.0** |

**重み付け理由**:

- **MCP準拠（5）**: MCPプロトコルへの準拠が必須。非準拠の場合、AIツールとの直接統合が不可
- **AI統合の容易性（5）**: Ukiyoueのメイン用途がAI作業支援のため、Claude Desktop等との統合が最重要
- **Bun互換性（4）**: ADR-009でBunを採用済み。互換性がない場合は採用困難
- **TypeScript対応（3）**: ADR-008でTypeScriptを採用。型安全性が開発効率に影響
- **メンテナンス性（3）**: 公式SDKによる仕様追従の容易さ、長期的な保守性
- **実装コスト（2）**: 初期開発の負荷。MCPの複雑性を考慮すると重要だが、長期的な価値がより重要
- **ドキュメント充実度（2）**: 学習コストの低減。公式ドキュメントの有無が影響

## Consequences

### Positive

- ✅ AIエージェントとのネイティブな統合が可能（Claude Desktop、Cursor等）
- ✅ TypeScript型安全性によりツール定義のミスを防止
- ✅ 公式SDKによる仕様準拠の保証
- ✅ プロトコル更新への自動追従（SDK更新で対応）
- ✅ リアルタイム双方向通信によるフィードバックループの実現
- ✅ AIワークフローへのシームレスな組み込み
- ✅ ストリーミングサポートで大規模ドキュメントにも対応
- ✅ テストユーティリティによる品質保証

### Negative

- ⚠️ MCPプロトコル自体が新しく、仕様変更のリスク（公式SDKで緩和）
- ⚠️ パッケージサイズがやや大きい（約100KB、Phase 1では問題なし）

### Neutral

- ℹ️ MCP以外の連携（REST API等）が必要になった場合、別途実装可能
- ℹ️ SDKのアップデートに継続的に追従する必要がある

## Implementation Notes

### ツール定義例

```typescript
import { MCPServer } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new MCPServer({
  name: "ukiyoue-mcp-server",
  version: "0.1.0",
});

// ukiyoue_validate ツール
server.tool(
  "ukiyoue_validate",
  "Validate Ukiyoue documents with actionable feedback",
  {
    path: {
      type: "string",
      description: "File or directory path to validate",
    },
    level: {
      type: "string",
      enum: ["structure", "semantic", "content"],
      description: "Validation level",
      default: "semantic",
    },
    actionable: {
      type: "boolean",
      description: "Include action suggestions",
      default: true,
    },
  },
  async ({ path, level, actionable }) => {
    // Validation Engine呼び出し
    const result = await validationEngine.validate(path, { level, actionable });
    return result;
  }
);

// Server起動
const transport = new StdioServerTransport();
await server.connect(transport);
```

### AIエージェントからの利用例

```typescript
// Claude Desktop config.json
{
  "mcpServers": {
    "ukiyoue": {
      "command": "bun",
      "args": ["run", "/path/to/ukiyoue-mcp-server/index.ts"],
      "env": {
        "UKIYOUE_PROJECT": "./my-project"
      }
    }
  }
}

// AIエージェントからのツール呼び出し（自動）
// User: "このAPI仕様を検証して"
// AI: ukiyoue_validate({ path: "./docs/api-spec.json", actionable: true })
// → フィードバック受信
// → AI が理解して即座に修正
```

## Related

- architecture.md: Interface Layer（MCP Serverの位置付け）
- ADR-008: Implementation Language (TypeScript採用)
- ADR-009: Runtime Environment (Bun採用)
