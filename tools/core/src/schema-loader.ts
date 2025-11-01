/**
 * Schema Loader
 * JSON Schemaの読み込みと管理
 */

import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';

export interface SchemaLoaderOptions {
  schemaDir?: string;
}

/**
 * パッケージのルートディレクトリを取得
 * @returns パッケージルートの絶対パス
 */
function getPackageRoot(): string {
  // import.meta.url からファイルパスを取得
  const currentFile = new URL(import.meta.url).pathname;
  const currentDir = dirname(currentFile);

  // dist/ ディレクトリ内から実行されている場合
  if (currentDir.endsWith('/dist')) {
    return resolve(currentDir, '..'); // パッケージルートへ（dist/ の親）
  }

  // src/ ディレクトリから実行されている場合
  if (currentDir.includes('/src')) {
    return resolve(currentDir, '../..'); // tools/core ルートへ
  }

  // その他の場合（node_modules 経由など）
  return resolve(currentDir, '..');
}

export class SchemaLoader {
  private schemaDir: string;

  constructor(options: SchemaLoaderOptions = {}) {
    // デフォルトはパッケージ内のschemasディレクトリ
    this.schemaDir = options.schemaDir || resolve(getPackageRoot(), 'schemas');
  }

  /**
   * スキーマファイルを読み込む
   */
  loadSchema(schemaPath: string): unknown {
    const fullPath = schemaPath.startsWith('/') ? schemaPath : resolve(this.schemaDir, schemaPath);

    const content = readFileSync(fullPath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * ドキュメントタイプからスキーマファイル名を推測
   * 例: BusinessGoal → definitions/business-goal.schema.json
   */
  inferSchemaFileName(docType: string): string {
    const fileName =
      docType
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .slice(1) + '.schema.json';
    return `definitions/${fileName}`;
  }

  /**
   * ドキュメントから@typeを読み取ってスキーマを読み込む
   */
  loadSchemaForDocument(documentPath: string): unknown {
    const content = readFileSync(documentPath, 'utf-8');
    const document = JSON.parse(content);

    const docType = document['@type'];
    if (!docType) {
      throw new Error(`Document missing @type: ${documentPath}`);
    }

    const schemaFileName = this.inferSchemaFileName(docType);
    return this.loadSchema(schemaFileName);
  }
}
