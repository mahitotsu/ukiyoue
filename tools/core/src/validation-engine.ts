/**
 * Validation Engine
 * JSON Schemaによる構造検証
 */

import Ajv, { type ErrorObject, type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

export interface ValidationError {
  path: string;
  message: string;
  params?: Record<string, unknown>;
}

export interface ValidationEngineOptions {
  allErrors?: boolean;
  verbose?: boolean;
}

export class ValidationEngine {
  private ajv: Ajv;

  constructor(options: ValidationEngineOptions = {}) {
    this.ajv = new Ajv({
      allErrors: options.allErrors ?? true,
      verbose: options.verbose ?? true,
      strict: false,
      validateSchema: false, // Draft 2020-12との互換性のため
    });
    addFormats(this.ajv);
  }

  /**
   * スキーマをコンパイル
   */
  compileSchema(schema: unknown): ValidateFunction {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.ajv.compile(schema as any);
  }

  /**
   * ドキュメントを検証
   */
  validate(document: unknown, schema: unknown): ValidationResult {
    const validate = this.compileSchema(schema);
    const valid = validate(document);

    if (valid) {
      return { valid: true };
    }

    return {
      valid: false,
      errors: this.formatErrors(validate.errors || []),
    };
  }

  /**
   * ファイルから読み込んで検証
   */
  validateFile(documentPath: string, schemaPath: string): ValidationResult {
    const documentContent = readFileSync(documentPath, 'utf-8');
    const document = JSON.parse(documentContent);

    const schemaContent = readFileSync(schemaPath, 'utf-8');
    const schema = JSON.parse(schemaContent);

    return this.validate(document, schema);
  }

  /**
   * Ajvのエラーを整形
   */
  private formatErrors(errors: ErrorObject[]): ValidationError[] {
    return errors.map((error) => ({
      path: error.instancePath || '/',
      message: error.message || 'Unknown error',
      params: error.params,
    }));
  }
}
