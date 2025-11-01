/**
 * Validate Directory Tool
 * ディレクトリ内の全ドキュメントを横断検証するMCPツール
 */

import { SemanticEngine } from '@ukiyoue/core';
import { resolve } from 'path';

export interface ValidateDirectoryToolInput {
  directoryPath: string;
  projectRoot?: string;
}

export async function validateDirectoryTool(input: ValidateDirectoryToolInput) {
  // プロジェクトルートを決定
  const projectRoot = input.projectRoot || process.cwd();
  const directoryPath = resolve(projectRoot, input.directoryPath);

  try {
    // Semantic Engine を初期化
    const semanticEngine = new SemanticEngine({ projectRoot });

    // ディレクトリ全体を検証
    const results = await semanticEngine.validateDirectory(directoryPath);

    // 結果を集計
    let validCount = 0;
    let invalidCount = 0;
    const errorDetails: string[] = [];

    for (const [filePath, result] of results.entries()) {
      const relativePath = filePath.replace(projectRoot + '/', '');

      if (result.valid) {
        validCount++;
      } else {
        invalidCount++;
        const errors = result.errors?.map((err) => `  - ${err.path}: ${err.message}`).join('\n');
        errorDetails.push(`\n❌ ${relativePath}:\n${errors}`);
      }
    }

    const totalCount = validCount + invalidCount;
    const summary = `検証結果: ${totalCount}件のドキュメント\n✅ 成功: ${validCount}件\n❌ 失敗: ${invalidCount}件`;

    if (invalidCount === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `✅ ディレクトリ検証成功: ${input.directoryPath}\n\n${summary}\n\nすべてのドキュメントが検証をパスしました。`,
          },
        ],
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `⚠️ ディレクトリ検証完了（エラーあり）: ${input.directoryPath}\n\n${summary}\n\nエラー詳細:${errorDetails.join('\n')}`,
          },
        ],
      };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ エラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
