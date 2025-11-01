/**
 * Validate Tool
 * ドキュメントの検証を実行するMCPツール
 */

import { SchemaLoader, SemanticEngine, ValidationEngine } from '@ukiyoue/core';
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
    const schemaLoader = new SchemaLoader();
    const validationEngine = new ValidationEngine();
    const semanticEngine = new SemanticEngine({ projectRoot });

    // ドキュメントを読み込み
    const documentContent = readFileSync(documentPath, 'utf-8');
    const document = JSON.parse(documentContent);

    // Level 1: 構造検証 (JSON Schema)
    const schema = schemaLoader.loadSchemaForDocument(documentPath);
    const structureResult = validationEngine.validate(document, schema);

    if (!structureResult.valid) {
      const errorMessages = structureResult.errors
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
            text: `❌ 検証失敗 (Level 1: 構造検証): ${input.documentPath}\n\nエラー詳細:\n${errorMessages}`,
          },
        ],
      };
    }

    // Level 2: セマンティック検証 (SHACL + 参照チェック)
    const semanticResult = await semanticEngine.validate(document);

    if (!semanticResult.valid) {
      const errorMessages = semanticResult.errors
        ?.map((err, idx) => {
          let msg = `${idx + 1}. パス: ${err.path}\n   メッセージ: ${err.message}`;
          if (err.focusNode) {
            msg += `\n   対象ノード: ${err.focusNode}`;
          }
          msg += `\n   重要度: ${err.severity}`;
          return msg;
        })
        .join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `❌ 検証失敗 (Level 2: セマンティック検証): ${input.documentPath}\n\nエラー詳細:\n${errorMessages}`,
          },
        ],
      };
    }

    // すべての検証が成功
    return {
      content: [
        {
          type: 'text',
          text: `✅ 検証成功: ${input.documentPath}\n\nすべての検証をパスしました:\n- Level 1: 構造検証 (JSON Schema) ✓\n- Level 2: セマンティック検証 (SHACL + 参照チェック) ✓`,
        },
      ],
    };
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
