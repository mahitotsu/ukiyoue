#!/usr/bin/env bun
/**
 * MCP Server Test Script (from node_modules)
 * node_modules/.bin/ukiyoue-mcp の動作確認用スクリプト
 */

import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// スクリプトのディレクトリから親ディレクトリ（blog-system/）を取得
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const serverPath = resolve(projectRoot, 'node_modules/.bin/ukiyoue-mcp');
const documentPath = 'documents/BG-001-seo-optimization.json';

console.log('🚀 MCPサーバーテスト開始 (from node_modules)\n');
console.log(`サーバー: ${serverPath}`);
console.log(`ドキュメント: ${documentPath}\n`);

// MCPサーバーを起動
const server = spawn(serverPath, [], {
  stdio: ['pipe', 'pipe', 'inherit'],
});

// リクエストを送信
const request = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    name: 'validate',
    arguments: {
      documentPath: documentPath,
      projectRoot: projectRoot,
    },
  },
};

console.log('📤 リクエスト送信:');
console.log(JSON.stringify(request, null, 2));
console.log();

server.stdin.write(JSON.stringify(request) + '\n');

// レスポンスを受信
let responseData = '';
server.stdout.on('data', (data) => {
  responseData += data.toString();

  // 完全なJSON-RPCレスポンスが来たら処理
  try {
    const lines = responseData.split('\n');
    for (const line of lines) {
      if (line.trim() && line.startsWith('{')) {
        const response = JSON.parse(line);
        console.log('📥 レスポンス受信:');
        console.log(JSON.stringify(response, null, 2));

        if (response.result?.content) {
          console.log('\n✅ 検証結果:');
          console.log(response.result.content[0].text);
        }

        server.kill();
        process.exit(0);
      }
    }
  } catch (e) {
    // JSON解析失敗は無視（不完全なデータ）
  }
});

// タイムアウト処理
setTimeout(() => {
  console.error('❌ タイムアウト: レスポンスが返ってきませんでした');
  server.kill();
  process.exit(1);
}, 5000);

// エラーハンドリング
server.on('error', (error) => {
  console.error('❌ サーバー起動エラー:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`❌ サーバーが異常終了しました (code: ${code})`);
    process.exit(1);
  }
});
