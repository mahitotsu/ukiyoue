/**
 * Validate Tool
 * ドキュメントの検証を実行するMCPツール
 */

import { SchemaLoader, ValidationEngine } from '@ukiyoue/core';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export interface ValidateToolInput {
  documentPath: string;
  projectRoot?: string;
}

export async function validateTool(input: ValidateToolInput) {
  // プロジェクトルートを決定
  const projectRoot = input.projectRoot || process.cwd();
  const documentPath = resolve(projectRoot, input.documentPath);

  try {
    // スキーマローダーとバリデーションエンジンを初期化
    // schemaDir未指定 → @ukiyoue/core/schemas/ を使用
    const schemaLoader = new SchemaLoader();
    const validationEngine = new ValidationEngine();

    // ドキュメントを読み込み
    const documentContent = readFileSync(documentPath, 'utf-8');
    const document = JSON.parse(documentContent);

    // スキーマを推測して読み込み
    const schema = schemaLoader.loadSchemaForDocument(documentPath);

    // 検証実行
    const result = validationEngine.validate(document, schema);

    if (result.valid) {
      return {
        content: [
          {
            type: 'text',
            text: `✅ 検証成功: ${input.documentPath}\n\nすべての必須項目が正しく定義されています。`,
          },
        ],
      };
    } else {
      const errorMessages = result.errors
        ?.map((err, idx) => {
          let msg = `${idx + 1}. パス: ${err.path}\n   メッセージ: ${err.message}`;
          if (err.params) {
            const params = Object.entries(err.params)
              .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
              .join(', ');
            msg += `\n   詳細: ${params}`;
          }
          return msg;
        })
        .join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `❌ 検証失敗: ${input.documentPath}\n\nエラー詳細:\n${errorMessages}`,
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
