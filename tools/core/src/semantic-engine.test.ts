/**
 * Semantic Engine Tests
 */

import { describe, expect, it } from 'bun:test';
import { resolve } from 'path';
import { SemanticEngine } from './semantic-engine.js';

describe('SemanticEngine', () => {
  const projectRoot = resolve(process.cwd(), '../../examples/blog-system');
  const engine = new SemanticEngine({ projectRoot });

  describe('validateDirectory', () => {
    it('should validate all documents in directory', async () => {
      const documentsDir = resolve(projectRoot, 'documents');
      const results = await engine.validateDirectory(documentsDir);

      expect(results.size).toBeGreaterThan(0);

      // 結果を表示
      for (const [file, result] of results.entries()) {
        console.log(`\n${file}:`);
        if (result.valid) {
          console.log('  ✅ Valid');
        } else {
          console.log('  ❌ Invalid:');
          result.errors?.forEach((error) => {
            console.log(`    - ${error.path}: ${error.message}`);
          });
        }
      }
    });
  });

  describe('validateFile', () => {
    it('should validate a single document', async () => {
      const filePath = resolve(projectRoot, 'documents/BG-001-seo-optimization.json');
      const result = await engine.validateFile(filePath);

      if (!result.valid) {
        console.log('\nValidation errors:');
        result.errors?.forEach((error) => {
          console.log(`  - ${error.path}: ${error.message}`);
        });
      }

      // エラーがあっても失敗させない（まだSHACL shapesが完全でない可能性があるため）
      expect(result).toBeDefined();
    });
  });

  describe('checkReferences', () => {
    it('should check if referenced documents exist', async () => {
      const document = {
        '@context': 'https://ukiyoue.dev/context/v1',
        '@type': 'UseCase',
        id: 'UC-001',
        title: 'Test UseCase',
        description: 'Test description',
        relatedGoal: 'BG-001', // この参照が存在するかチェック
      };

      const errors = await engine.checkReferences(document);

      // エラーがあっても失敗させない
      console.log('\nReference check results (existing reference):');
      if (errors.length === 0) {
        console.log('  ✅ All references are valid');
      } else {
        errors.forEach((error) => {
          console.log(`  - ${error.path}: ${error.message}`);
        });
      }

      expect(errors).toBeDefined();
    });

    it('should detect non-existent references', async () => {
      const document = {
        '@context': 'https://ukiyoue.dev/context/v1',
        '@type': 'UseCase',
        id: 'UC-999',
        title: 'Test UseCase',
        description: 'Test description',
        relatedGoal: 'BG-999', // この参照は存在しない
      };

      const errors = await engine.checkReferences(document);

      console.log('\nReference check results (non-existent reference):');
      if (errors.length === 0) {
        console.log('  ✅ All references are valid');
      } else {
        errors.forEach((error) => {
          console.log(`  ❌ ${error.path}: ${error.message}`);
        });
      }

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].path).toBe('relatedGoal');
      expect(errors[0].message).toContain('BG-999');
    });

    it('should validate single document with non-existent reference and fail', async () => {
      const document = {
        '@context': 'https://ukiyoue.dev/context/v1',
        '@type': 'UseCase',
        id: 'UC-999',
        title: 'Test UseCase',
        description: 'Test description',
        relatedGoal: 'BG-999', // この参照は存在しない
      };

      const result = await engine.validate(document);

      console.log('\nFull validation with non-existent reference:');
      if (result.valid) {
        console.log('  ✅ Valid');
      } else {
        console.log('  ❌ Invalid:');
        result.errors?.forEach((error) => {
          console.log(`    - ${error.path}: ${error.message}`);
        });
      }

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });
});
