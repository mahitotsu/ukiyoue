import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('validate-minimal', () => {
  const ajv = new Ajv({
    allErrors: true,
    strict: true,
    verbose: true,
  });
  addFormats(ajv);

  // Load _common.json schema
  const commonPath = resolve(__dirname, '../../schemas/_common.json');
  const commonSchema = JSON.parse(readFileSync(commonPath, 'utf8'));
  ajv.addSchema(commonSchema);

  describe('project-charter schema', () => {
    const schemaPath = resolve(__dirname, '../../schemas/layer1/project-charter.json');
    const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
    const validate = ajv.compile(schema);

    test('should validate valid project charter', () => {
      const documentPath = resolve(__dirname, './fixtures/project-charter.json');
      const document = JSON.parse(readFileSync(documentPath, 'utf8'));

      const valid = validate(document);

      if (!valid) {
        console.error('Validation errors:', JSON.stringify(validate.errors, null, 2));
      }

      expect(valid).toBe(true);
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

      const valid = validate(document);
      expect(valid).toBe(false);
      expect(validate.errors).toBeDefined();

      const contextError = validate.errors?.find(
        (err) => err.keyword === 'required' && err.params.missingProperty === '@context'
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

      const valid = validate(document);
      expect(valid).toBe(false);

      const patternError = validate.errors?.find(
        (err) => err.keyword === 'pattern' && err.instancePath === '/id'
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

      const valid = validate(document);
      expect(valid).toBe(false);
      expect(validate.errors?.length).toBeGreaterThan(0);

      const requiredFields = ['background', 'scope', 'stakeholders'];
      requiredFields.forEach((field) => {
        const error = validate.errors?.find(
          (err) => err.keyword === 'required' && err.params.missingProperty === field
        );
        expect(error).toBeDefined();
      });
    });
  });

  describe('common definitions', () => {
    test('should validate traceability structure', () => {
      const schema = {
        $ref: 'https://ukiyoue.example.org/schemas/_common.json#/definitions/traceability',
      };
      const validate = ajv.compile(schema);

      const validTrace = {
        derivedFrom: ['pm-charter-001'],
        satisfies: ['req-001'],
      };

      expect(validate(validTrace)).toBe(true);
    });

    test('should validate dateRange structure', () => {
      const schema = {
        $ref: 'https://ukiyoue.example.org/schemas/_common.json#/definitions/dateRange',
      };
      const validate = ajv.compile(schema);

      const validRange = {
        start: '2025-01-01',
        end: '2025-12-31',
      };

      expect(validate(validRange)).toBe(true);
    });

    test('should validate status enum', () => {
      const schema = {
        $ref: 'https://ukiyoue.example.org/schemas/_common.json#/definitions/status',
      };
      const validate = ajv.compile(schema);

      expect(validate('draft')).toBe(true);
      expect(validate('in-review')).toBe(true);
      expect(validate('approved')).toBe(true);
      expect(validate('invalid-status')).toBe(false);
    });
  });
});
