#!/usr/bin/env node
/**
 * Ukiyoue MCP Server
 * Model Context Protocol server for Ukiyoue Framework
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { validateTool } from './tools/validate.js';

const server = new Server(
  {
    name: 'ukiyoue-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ツールリストの登録
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'validate',
        description:
          'Ukiyoueドキュメントの構造検証を実行します。JSON Schemaによる必須項目チェック、データ型検証、フォーマット検証を行います。',
        inputSchema: {
          type: 'object',
          properties: {
            documentPath: {
              type: 'string',
              description: '検証するドキュメントのパス（プロジェクトルートからの相対パス）',
            },
            projectRoot: {
              type: 'string',
              description: 'プロジェクトルートのパス（省略時はカレントディレクトリ）',
            },
            frameworkRoot: {
              type: 'string',
              description: 'Ukiyoueフレームワークルートのパス（省略時はprojectRoot）',
            },
          },
          required: ['documentPath'],
        },
      },
    ],
  };
});

// ツール呼び出しハンドラー
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'validate':
      return await validateTool(args as any);

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// サーバー起動
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Ukiyoue MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
