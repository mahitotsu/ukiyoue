/**
 * Semantic Engine
 * JSON-LDからRDFへの変換とSHACL検証
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import * as jsonld from 'jsonld';
import { Parser as N3Parser } from 'n3';
import { dirname, join, resolve } from 'path';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import rdfFactory from 'rdf-ext';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import clownfaceFactory from 'clownface';
import SHACLValidator from 'rdf-validate-shacl';

// Create factory with clownface support
const factory = rdfFactory;
// @ts-ignore
factory.clownface = clownfaceFactory;

export interface SemanticValidationResult {
  valid: boolean;
  errors?: SemanticValidationError[];
}

export interface SemanticValidationError {
  path: string;
  message: string;
  focusNode?: string;
  severity: 'Violation' | 'Warning' | 'Info';
}

export interface SemanticEngineOptions {
  projectRoot?: string;
  shapesDir?: string;
}

/**
 * 現在のファイルから schemas/ と semantics/ への相対パスを解決
 * 開発時（src/）もビルド後（dist/）も同じ構造で動作
 */
function resolveAssetPath(assetType: 'schemas' | 'semantics'): string {
  const currentFile = new URL(import.meta.url).pathname;
  const currentDir = dirname(currentFile);

  // 開発時: tools/core/src/semantic-engine.ts → tools/core/schemas
  // 本番時: tools/core/dist/semantic-engine.js → tools/core/schemas
  // npm install後: node_modules/@ukiyoue/core/dist/semantic-engine.js → node_modules/@ukiyoue/core/schemas

  // dist/ ディレクトリ内から実行されている場合
  if (currentDir.endsWith('/dist')) {
    const packageRoot = resolve(currentDir, '..'); // dist/ の親がパッケージルート
    return join(packageRoot, assetType);
  }

  // src/ ディレクトリから実行されている場合
  if (currentDir.includes('/src')) {
    const packageRoot = resolve(currentDir, '..'); // src/ の親がパッケージルート
    return join(packageRoot, assetType);
  }

  // その他の場合
  const packageRoot = resolve(currentDir, '..');
  return join(packageRoot, assetType);
}

export class SemanticEngine {
  private shapesDir: string;
  private projectRoot: string;
  private shapesGraph: ReturnType<typeof factory.dataset> | null = null;

  constructor(options: SemanticEngineOptions = {}) {
    this.shapesDir = options.shapesDir || join(resolveAssetPath('semantics'), 'shapes');
    this.projectRoot = options.projectRoot || process.cwd();
  }

  /**
   * SHACL shapes をロード
   */
  private async loadShapes(): Promise<ReturnType<typeof factory.dataset>> {
    if (this.shapesGraph) {
      return this.shapesGraph;
    }

    const dataset = factory.dataset();
    const shapeFiles = [
      'business-goal.ttl',
      'use-case.ttl',
      'success-metric.ttl',
      'constraint.ttl',
    ];

    for (const file of shapeFiles) {
      const filePath = join(this.shapesDir, file);
      try {
        const turtleContent = readFileSync(filePath, 'utf-8');
        const quads = await this.parseTurtle(turtleContent);
        quads.forEach((quad) => dataset.add(quad));
      } catch (error) {
        console.warn(`Warning: Failed to load shape file ${file}:`, error);
      }
    }

    this.shapesGraph = dataset;
    return dataset;
  }

  /**
   * Turtle 形式を RDF に変換
   */
  private async parseTurtle(
    turtleContent: string
  ): Promise<Array<ReturnType<typeof factory.quad>>> {
    return new Promise((resolve, reject) => {
      const parser = new N3Parser({ format: 'text/turtle' });
      const quads: Array<ReturnType<typeof factory.quad>> = [];

      parser.parse(turtleContent, (error: Error | null, quad: any) => {
        if (error) {
          reject(error);
        } else if (quad) {
          // N3 quad を rdf-ext quad に変換
          const rdfQuad = factory.quad(
            factory.namedNode(quad.subject.value),
            factory.namedNode(quad.predicate.value),
            quad.object.termType === 'Literal'
              ? factory.literal(
                  quad.object.value,
                  quad.object.language || quad.object.datatype?.value
                )
              : factory.namedNode(quad.object.value),
            quad.graph.value !== '' ? factory.namedNode(quad.graph.value) : undefined
          );
          quads.push(rdfQuad);
        } else {
          // パース完了
          resolve(quads);
        }
      });
    });
  }

  /**
   * JSON-LD を RDF に変換
   */
  private async jsonLdToRdf(document: unknown): Promise<ReturnType<typeof factory.dataset>> {
    // カスタム document loader でローカルコンテキストを読み込む
    const documentLoader = async (url: string) => {
      if (url === 'https://ukiyoue.dev/context/v1') {
        const contextPath = join(resolveAssetPath('semantics'), 'contexts/context.jsonld');
        const contextContent = readFileSync(contextPath, 'utf-8');
        return {
          contextUrl: undefined,
          document: JSON.parse(contextContent),
          documentUrl: url,
        };
      }
      // デフォルトの処理: エラーを投げる
      throw new Error(`Unable to load remote context: ${url}`);
    };

    // JSON-LD を N-Quads 形式に変換
    let nquads: string;
    try {
      nquads = (await jsonld.toRDF(document as any, {
        format: 'application/n-quads',
        documentLoader: documentLoader as any,
      })) as string;
    } catch (error) {
      throw error;
    }

    // N-Quads を rdf-ext dataset に変換
    const dataset = factory.dataset();
    const parser = new N3Parser({ format: 'application/n-quads' });

    return new Promise((resolve, reject) => {
      parser.parse(nquads, (error: Error | null, quad: any) => {
        if (error) {
          reject(error);
        } else if (quad) {
          const rdfQuad = factory.quad(
            factory.namedNode(quad.subject.value),
            factory.namedNode(quad.predicate.value),
            quad.object.termType === 'Literal'
              ? factory.literal(
                  quad.object.value,
                  quad.object.language || quad.object.datatype?.value
                )
              : factory.namedNode(quad.object.value),
            quad.graph.value !== '' ? factory.namedNode(quad.graph.value) : undefined
          );
          dataset.add(rdfQuad);
        } else {
          resolve(dataset);
        }
      });
    });
  }

  /**
   * SHACL 検証を実行
   */
  async validateWithShacl(document: unknown): Promise<SemanticValidationResult> {
    try {
      // JSON-LD を RDF に変換
      const dataDataset = await this.jsonLdToRdf(document);

      // SHACL shapes をロード
      const shapesDataset = await this.loadShapes();

      // SHACL 検証
      const validator = new SHACLValidator(shapesDataset);
      const report = await validator.validate(dataDataset);

      if (report.conforms) {
        return { valid: true };
      }

      // エラーを整形
      const errors: SemanticValidationError[] = [];
      for (const result of report.results) {
        const path = result.path?.value || 'unknown';
        const message = result.message?.[0]?.value || 'Constraint violated';
        const focusNode = result.focusNode?.value;
        const severity = result.severity?.value.includes('Violation')
          ? 'Violation'
          : result.severity?.value.includes('Warning')
            ? 'Warning'
            : 'Info';

        errors.push({
          path,
          message,
          focusNode,
          severity,
        });
      }

      return {
        valid: false,
        errors,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [
          {
            path: '/',
            message: `SHACL validation error: ${error instanceof Error ? error.message : String(error)}`,
            severity: 'Violation',
          },
        ],
      };
    }
  }

  /**
   * 参照先ドキュメントの存在確認
   */
  async checkReferences(document: Record<string, unknown>): Promise<SemanticValidationError[]> {
    const errors: SemanticValidationError[] = [];

    // プロジェクト内の全ドキュメント ID を取得
    const allDocumentIds = await this.getAllDocumentIds();

    // 参照フィールドをチェック
    const referenceFields = [
      'hasMetric',
      'hasUseCase',
      'constrainedBy',
      'derivedFrom',
      'measuresGoal',
      'relatedGoal',
    ];

    for (const field of referenceFields) {
      const value = document[field];
      if (!value) continue;

      const references = Array.isArray(value) ? value : [value];

      for (const ref of references) {
        if (typeof ref !== 'string') continue;

        // IRI から ID 部分を抽出 (例: "BG-001")
        const id = this.extractIdFromIri(ref);

        if (!allDocumentIds.has(id)) {
          errors.push({
            path: field,
            message: `参照先のドキュメント '${id}' が見つかりません`,
            focusNode: document['id'] as string,
            severity: 'Violation',
          });
        }
      }
    }

    return errors;
  }

  /**
   * IRI から ID 部分を抽出
   */
  private extractIdFromIri(iri: string): string {
    // 例: "https://example.com/BG-001" -> "BG-001"
    // または "BG-001" -> "BG-001"
    const parts = iri.split('/');
    return parts[parts.length - 1];
  }

  /**
   * プロジェクト内の全ドキュメント ID を取得
   */
  private async getAllDocumentIds(): Promise<Set<string>> {
    const ids = new Set<string>();

    const findJsonFiles = (dir: string): string[] => {
      const files: string[] = [];
      try {
        const entries = readdirSync(dir);

        for (const entry of entries) {
          const fullPath = join(dir, entry);
          const stat = statSync(fullPath);

          if (stat.isDirectory()) {
            files.push(...findJsonFiles(fullPath));
          } else if (entry.endsWith('.json') && entry !== 'package.json') {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // ディレクトリ読み込みエラーは無視
      }

      return files;
    };

    const jsonFiles = findJsonFiles(this.projectRoot);

    for (const file of jsonFiles) {
      try {
        const content = readFileSync(file, 'utf-8');
        const doc = JSON.parse(content);

        if (doc.id) {
          ids.add(this.extractIdFromIri(doc.id));
        }
      } catch (error) {
        // JSON パースエラーは無視
      }
    }

    return ids;
  }

  /**
   * 単一ドキュメントの完全検証 (SHACL + 参照チェック)
   */
  async validate(document: unknown): Promise<SemanticValidationResult> {
    // Phase 1: SHACL 検証
    const shaclResult = await this.validateWithShacl(document);

    if (!shaclResult.valid) {
      return shaclResult;
    }

    // Phase 2: 参照先存在確認
    const referenceErrors = await this.checkReferences(document as Record<string, unknown>);

    if (referenceErrors.length > 0) {
      return {
        valid: false,
        errors: referenceErrors,
      };
    }

    return { valid: true };
  }

  /**
   * ファイルから読み込んで検証
   */
  async validateFile(filePath: string): Promise<SemanticValidationResult> {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const document = JSON.parse(content);
      return await this.validate(document);
    } catch (error) {
      return {
        valid: false,
        errors: [
          {
            path: '/',
            message: `File read error: ${error instanceof Error ? error.message : String(error)}`,
            severity: 'Violation',
          },
        ],
      };
    }
  }

  /**
   * ディレクトリ内の全ドキュメントを検証
   */
  async validateDirectory(dirPath: string): Promise<Map<string, SemanticValidationResult>> {
    const results = new Map<string, SemanticValidationResult>();

    const findJsonFiles = (dir: string): string[] => {
      const files: string[] = [];
      try {
        const entries = readdirSync(dir);

        for (const entry of entries) {
          const fullPath = join(dir, entry);
          const stat = statSync(fullPath);

          if (stat.isDirectory()) {
            files.push(...findJsonFiles(fullPath));
          } else if (entry.endsWith('.json') && entry !== 'package.json') {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // ディレクトリ読み込みエラーは無視
      }

      return files;
    };

    const jsonFiles = findJsonFiles(dirPath);

    for (const file of jsonFiles) {
      const result = await this.validateFile(file);
      results.set(file, result);
    }

    return results;
  }
}
