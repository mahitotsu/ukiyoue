import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { validateSchema, validateSchemaFromFiles } from '../../src/validators/schema-validator.js';

describe('schema-validator', () => {
  describe('validateSchemaFromFiles', () => {
    test('should validate valid project charter from files', () => {
      const schemaPath = resolve(__dirname, '../../../schemas/layer1/project-charter.json');
      const documentPath = resolve(__dirname, '../fixtures/project-charter.json');

      const result = validateSchemaFromFiles(schemaPath, documentPath);

      if (!result.valid) {
        console.error('Validation errors:', JSON.stringify(result.errors, null, 2));
      }

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should report file loading errors', () => {
      const schemaPath = resolve(__dirname, '../../../schemas/layer1/project-charter.json');
      const documentPath = resolve(__dirname, './fixtures/non-existent.json');

      const result = validateSchemaFromFiles(schemaPath, documentPath);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors[0]?.type).toBe('file-error');
    });
  });

  describe('validateSchema', () => {
    const schemaPath = resolve(__dirname, '../../../schemas/layer1/project-charter.json');
    const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));

    test('should validate valid project charter', () => {
      const documentPath = resolve(__dirname, '../fixtures/project-charter.json');
      const document = JSON.parse(readFileSync(documentPath, 'utf8'));

      const result = validateSchema(schema, document, schemaPath);

      if (!result.valid) {
        console.error('Validation errors:', JSON.stringify(result.errors, null, 2));
      }

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject document without @context', () => {
      const document = {
        '@type': 'ProjectCharter',
        id: 'pm-charter-001',
        title: 'Test',
        background: {
          problem: 'Test problem',
          opportunity: 'Test opportunity',
        },
        scope: {
          inScope: ['Test'],
          outOfScope: [],
        },
        stakeholders: {
          roles: [],
        },
      };

      const result = validateSchema(schema, document, schemaPath);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();

      const contextError = result.errors.find(
        (err) => err.keyword === 'required' && err.params?.missingProperty === '@context'
      );
      expect(contextError).toBeDefined();
    });

    test('should reject document with invalid id pattern', () => {
      const document = {
        '@context': 'https://ukiyoue.example.org/contexts/base.jsonld',
        '@type': 'ProjectCharter',
        id: 'PM-CHARTER-001', // Invalid: uppercase not allowed
        title: 'Test',
        background: {
          problem: 'Test problem',
          opportunity: 'Test opportunity',
        },
        scope: {
          inScope: ['Test'],
          outOfScope: [],
        },
        stakeholders: {
          roles: [],
        },
      };

      const result = validateSchema(schema, document, schemaPath);

      expect(result.valid).toBe(false);

      const patternError = result.errors.find(
        (err) => err.keyword === 'pattern' && err.path === '/id'
      );
      expect(patternError).toBeDefined();
    });

    test('should reject document without required fields', () => {
      const document = {
        '@context': 'https://ukiyoue.example.org/contexts/base.jsonld',
        '@type': 'ProjectCharter',
        id: 'pm-charter-001',
        title: 'Test',
        // Missing: background, scope, stakeholders
      };

      const result = validateSchema(schema, document, schemaPath);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);

      const requiredFields = ['background', 'scope', 'stakeholders'];
      requiredFields.forEach((field) => {
        const error = result.errors.find(
          (err) => err.keyword === 'required' && err.params?.missingProperty === field
        );
        expect(error).toBeDefined();
      });
    });

    test('should validate with custom options', () => {
      const document = {
        '@context': 'https://ukiyoue.example.org/contexts/base.jsonld',
        '@type': 'ProjectCharter',
        id: 'pm-charter-001',
        title: 'Test',
      };

      const result = validateSchema(schema, document, schemaPath, {
        allErrors: true,
        strict: true,
        verbose: true,
      });

      expect(result.valid).toBe(false);
      // With allErrors: true, should report multiple missing fields
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('common definitions', () => {
    test('should load and use common schema for $ref resolution', () => {
      // Test with a schema that uses $ref to _common.json
      const schemaPath = resolve(__dirname, '../../../schemas/layer1/project-charter.json');
      const documentPath = resolve(__dirname, '../fixtures/project-charter.json');

      const result = validateSchemaFromFiles(schemaPath, documentPath, {
        loadCommonSchema: true,
      });

      // The project-charter schema uses $ref to common definitions
      // like traceability, dateRange, etc.
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should work without loading common schema when not needed', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        required: ['name'],
      };

      const document = {
        name: 'Test',
        age: 30,
      };

      const result = validateSchema(schema, document, undefined, {
        loadCommonSchema: false,
      });

      expect(result.valid).toBe(true);
    });
  });
});
