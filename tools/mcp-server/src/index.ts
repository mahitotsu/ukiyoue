#!/usr/bin/env node
/**
 * Ukiyoue MCP Server
 * Model Context Protocol server for Ukiyoue Framework
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { validateDirectoryTool } from './tools/validate-directory.js';
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
          'Ukiyoueドキュメントの構造検証とセマンティック検証を実行します。JSON Schema検証、SHACL検証、参照整合性チェックを含みます。',
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
          },
          required: ['documentPath'],
        },
      },
      {
        name: 'validate_directory',
        description:
          'ディレクトリ内のすべてのUkiyoueドキュメントを横断検証します。SHACL検証と参照整合性チェックを含む包括的な検証を実行します。',
        inputSchema: {
          type: 'object',
          properties: {
            directoryPath: {
              type: 'string',
              description: '検証するディレクトリのパス（プロジェクトルートからの相対パス）',
            },
            projectRoot: {
              type: 'string',
              description: 'プロジェクトルートのパス（省略時はカレントディレクトリ）',
            },
          },
          required: ['directoryPath'],
        },
      },
    ],
  };
});

// ツール呼び出しハンドラー
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // 環境変数からドキュメントルートを取得してデフォルト値として使用
  const documentRoot = process.env.UKIYOUE_DOCUMENT_ROOT;
  const enrichedArgs = documentRoot ? { projectRoot: documentRoot, ...args } : args;

  switch (name) {
    case 'validate':
      return await validateTool(enrichedArgs as any);

    case 'validate_directory':
      return await validateDirectoryTool(enrichedArgs as any);

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
