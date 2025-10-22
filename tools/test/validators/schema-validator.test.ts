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

  describe('format validation', () => {
    test('should validate uri format', () => {
      const schema = {
        type: 'object',
        properties: {
          url: { type: 'string', format: 'uri' },
        },
        required: ['url'],
      };

      const validDoc = { url: 'https://example.com/path' };
      const invalidDoc = { url: 'not a valid uri' };

      expect(validateSchema(schema, validDoc).valid).toBe(true);
      const result = validateSchema(schema, invalidDoc);
      expect(result.valid).toBe(false);
      expect(result.errors.find((e) => e.keyword === 'format')).toBeDefined();
    });

    test('should validate date-time format', () => {
      const schema = {
        type: 'object',
        properties: {
          created: { type: 'string', format: 'date-time' },
        },
        required: ['created'],
      };

      const validDoc = { created: '2025-10-22T10:30:00Z' };
      const invalidDoc = { created: '2025-10-22' }; // date only, not date-time

      expect(validateSchema(schema, validDoc).valid).toBe(true);
      const result = validateSchema(schema, invalidDoc);
      expect(result.valid).toBe(false);
      expect(result.errors.find((e) => e.keyword === 'format')).toBeDefined();
    });

    test('should validate email format', () => {
      const schema = {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
        },
      };

      const validDoc = { email: 'user@example.com' };
      const invalidDoc = { email: 'not-an-email' };

      expect(validateSchema(schema, validDoc).valid).toBe(true);
      const result = validateSchema(schema, invalidDoc);
      expect(result.valid).toBe(false);
      expect(result.errors.find((e) => e.keyword === 'format')).toBeDefined();
    });
  });

  describe('$ref resolution', () => {
    test('should resolve $ref to common definitions', () => {
      const schemaPath = resolve(__dirname, '../../../schemas/layer1/project-charter.json');
      const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));

      // project-charter.json uses $ref to _common.json
      const document = {
        '@context': 'https://ukiyoue.example.org/contexts/base.jsonld',
        '@type': 'ProjectCharter',
        id: 'pm-charter-001',
        title: 'Test Charter',
        background: { problem: 'Test', opportunity: 'Test' },
        scope: { inScope: ['Test'], outOfScope: [] },
        stakeholders: {
          sponsor: { name: 'Test Sponsor', role: 'Sponsor' },
          projectManager: { name: 'Test PM', role: 'PM' },
          roles: [],
        },
        traceability: {
          derivedFrom: ['req-001'], // This should validate against common traceability schema
        },
      };

      const result = validateSchema(schema, document, schemaPath, {
        loadCommonSchema: true,
      });

      if (!result.valid) {
        console.error('$ref validation errors:', JSON.stringify(result.errors, null, 2));
      }

      expect(result.valid).toBe(true);
    });

    test('should fail when $ref target is not found', () => {
      const schema = {
        type: 'object',
        properties: {
          item: { $ref: '#/definitions/NonExistent' },
        },
      };

      const document = { item: {} };

      const result = validateSchema(schema, document);
      expect(result.valid).toBe(false);
      expect(result.errors[0]?.type).toBe('schema-error');
    });

    test('should handle nested $ref', () => {
      const schema = {
        type: 'object',
        definitions: {
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
            },
            required: ['street', 'city'],
          },
          person: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              address: { $ref: '#/definitions/address' },
            },
            required: ['name'],
          },
        },
        properties: {
          owner: { $ref: '#/definitions/person' },
        },
      };

      const validDoc = {
        owner: {
          name: 'John',
          address: { street: '123 Main St', city: 'Tokyo' },
        },
      };

      const invalidDoc = {
        owner: {
          name: 'John',
          address: { street: '123 Main St' }, // Missing city
        },
      };

      expect(validateSchema(schema, validDoc).valid).toBe(true);
      const result = validateSchema(schema, invalidDoc);
      expect(result.valid).toBe(false);
      expect(result.errors.find((e) => e.path.includes('/address'))).toBeDefined();
    });
  });

  describe('validation options', () => {
    test('should report only first error when allErrors is false', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
          email: { type: 'string', format: 'email' },
        },
        required: ['name', 'age', 'email'],
      };

      const document = {}; // Missing all required fields

      const resultAllErrors = validateSchema(schema, document, undefined, {
        allErrors: true,
      });
      const resultFirstError = validateSchema(schema, document, undefined, {
        allErrors: false,
      });

      expect(resultAllErrors.errors.length).toBeGreaterThan(1);
      expect(resultFirstError.errors.length).toBe(1);
    });

    test('should handle strict mode', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      };

      const document = { name: 'Test' };

      const resultStrict = validateSchema(schema, document, undefined, {
        strict: true,
      });
      const resultNonStrict = validateSchema(schema, document, undefined, {
        strict: false,
      });

      expect(resultStrict.valid).toBe(true);
      expect(resultNonStrict.valid).toBe(true);
    });

    test('should include verbose error information', () => {
      const schema = {
        type: 'object',
        properties: {
          age: { type: 'number', minimum: 0, maximum: 150 },
        },
      };

      const document = { age: 200 };

      const result = validateSchema(schema, document, undefined, {
        verbose: true,
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]?.params).toBeDefined();
      expect(result.errors[0]?.keyword).toBe('maximum');
    });
  });

  describe('complex nested schemas', () => {
    test('should validate deeply nested structures', () => {
      const schema = {
        type: 'object',
        properties: {
          level1: {
            type: 'object',
            properties: {
              level2: {
                type: 'object',
                properties: {
                  level3: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        value: { type: 'number', minimum: 0 },
                      },
                      required: ['value'],
                    },
                  },
                },
              },
            },
          },
        },
      };

      const validDoc = {
        level1: {
          level2: {
            level3: [{ value: 1 }, { value: 2 }],
          },
        },
      };

      const invalidDoc = {
        level1: {
          level2: {
            level3: [{ value: 1 }, { value: -1 }], // Negative value
          },
        },
      };

      expect(validateSchema(schema, validDoc).valid).toBe(true);
      const result = validateSchema(schema, invalidDoc);
      expect(result.valid).toBe(false);
      expect(result.errors[0]?.path).toContain('/level1/level2/level3');
    });

    test('should handle additionalProperties: false', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        additionalProperties: false,
        required: ['name'],
      };

      const validDoc = { name: 'John', age: 30 };
      const invalidDoc = { name: 'John', age: 30, extra: 'not allowed' };

      expect(validateSchema(schema, validDoc).valid).toBe(true);
      const result = validateSchema(schema, invalidDoc);
      expect(result.valid).toBe(false);
      expect(result.errors.find((e) => e.keyword === 'additionalProperties')).toBeDefined();
    });

    test('should validate array items with different schemas', () => {
      const schema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              oneOf: [
                {
                  type: 'object',
                  properties: { type: { const: 'text' }, value: { type: 'string' } },
                  required: ['type', 'value'],
                },
                {
                  type: 'object',
                  properties: { type: { const: 'number' }, value: { type: 'number' } },
                  required: ['type', 'value'],
                },
              ],
            },
          },
        },
      };

      const validDoc = {
        items: [
          { type: 'text', value: 'hello' },
          { type: 'number', value: 42 },
        ],
      };

      const invalidDoc = {
        items: [
          { type: 'text', value: 123 }, // Should be string
        ],
      };

      expect(validateSchema(schema, validDoc).valid).toBe(true);
      const result = validateSchema(schema, invalidDoc);
      expect(result.valid).toBe(false);
    });
  });

  describe('error handling', () => {
    test('should handle malformed schema', () => {
      const malformedSchema = {
        type: 'object',
        properties: {
          name: { $ref: '#/circular' }, // Circular reference
        },
        definitions: {
          circular: { $ref: '#/properties/name' },
        },
      };

      const document = { name: 'test' };

      const result = validateSchema(malformedSchema, document);
      expect(result.valid).toBe(false);
      expect(result.errors[0]?.type).toBe('schema-error');
    });

    test('should handle schema compilation errors', () => {
      const invalidSchema = {
        type: 'invalid-type', // Not a valid JSON Schema type
      };

      const document = { test: 'value' };

      const result = validateSchema(invalidSchema, document);
      expect(result.valid).toBe(false);
      expect(result.errors[0]?.type).toBe('schema-error');
    });
  });
});
