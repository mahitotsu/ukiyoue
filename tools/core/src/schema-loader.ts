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
  // require.resolveを使って@ukiyoue/coreのpackage.jsonを見つける
  try {
    // ESMでもrequire.resolveは使える（Bun/Node.js）
    // @ts-ignore - CommonJS require in ESM context
    const packageJson = require.resolve('@ukiyoue/core/package.json');
    return dirname(packageJson);
  } catch {
    // フォールバック: process.cwdから相対的に探す
    // 開発環境用（tools/core自体から実行される場合）
    return process.cwd();
  }
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
