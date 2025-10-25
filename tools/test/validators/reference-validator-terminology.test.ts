import { describe, expect, test } from 'bun:test';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { validateTermReferences } from '../../src/validators/reference-validator';

describe('reference-validator: terminology validation (ADR-009)', () => {
  const testDir = join(import.meta.dir, '../fixtures/terminology-test');

  describe('validateTermReferences', () => {
    test('should pass when no termReference fields exist', async () => {
      const document = {
        id: 'doc-001',
        type: 'test-document',
        title: 'Test Document',
      };

      const result = await validateTermReferences(document);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should pass when Data Dictionary not found (optional validation)', async () => {
      const document = {
        id: 'doc-001',
        type: 'conceptual-data-model',
        entities: [
          {
            name: 'Order',
            termReference: 'term-order-001',
          },
        ],
      };

      const result = await validateTermReferences(document, {
        projectRoot: '/nonexistent/path',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect missing term reference', async () => {
      // Setup test directory with Data Dictionary
      await mkdir(testDir, { recursive: true });

      const dictionary = {
        id: 'dd-001',
        type: 'data-dictionary',
        terms: [
          {
            id: 'term-order-001',
            term: 'Order',
            dataType: 'object',
          },
        ],
      };

      const dictPath = join(testDir, 'data-dictionary.json');
      await writeFile(dictPath, JSON.stringify(dictionary, null, 2));

      const document = {
        id: 'doc-001',
        type: 'conceptual-data-model',
        entities: [
          {
            name: 'Order',
            termReference: 'term-order-001',
          },
          {
            name: 'Customer',
            termReference: 'term-customer-999', // Does not exist
          },
        ],
      };

      const result = await validateTermReferences(document, {
        dataDictionaryPath: dictPath,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.type).toBe('missing-term-reference');
      expect(result.errors[0]?.referencedId).toBe('term-customer-999');
      expect(result.errors[0]?.severity).toBe('error');

      // Cleanup
      await rm(testDir, { recursive: true, force: true });
    });

    test('should detect type mismatch', async () => {
      await mkdir(testDir, { recursive: true });

      const dictionary = {
        id: 'dd-001',
        type: 'data-dictionary',
        terms: [
          {
            id: 'term-order-id-001',
            term: 'Order ID',
            dataType: 'string',
          },
        ],
      };

      const dictPath = join(testDir, 'data-dictionary.json');
      await writeFile(dictPath, JSON.stringify(dictionary, null, 2));

      const document = {
        id: 'doc-001',
        type: 'logical-data-model',
        entities: [
          {
            name: 'Order',
            attributes: [
              {
                name: 'orderId',
                dataType: 'integer', // Mismatch: should be string
                termReference: 'term-order-id-001',
              },
            ],
          },
        ],
      };

      const result = await validateTermReferences(document, {
        dataDictionaryPath: dictPath,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.type).toBe('term-type-mismatch');
      expect(result.errors[0]?.severity).toBe('error');
      expect(result.errors[0]?.message).toContain('integer');
      expect(result.errors[0]?.message).toContain('string');

      await rm(testDir, { recursive: true, force: true });
    });

    test('should detect deprecated term usage', async () => {
      await mkdir(testDir, { recursive: true });

      const dictionary = {
        id: 'dd-001',
        type: 'data-dictionary',
        terms: [
          {
            id: 'term-old-field-001',
            term: 'OldField',
            dataType: 'string',
            deprecated: true,
            replacedBy: 'term-new-field-001',
          },
          {
            id: 'term-new-field-001',
            term: 'NewField',
            dataType: 'string',
          },
        ],
      };

      const dictPath = join(testDir, 'data-dictionary.json');
      await writeFile(dictPath, JSON.stringify(dictionary, null, 2));

      const document = {
        id: 'doc-001',
        type: 'conceptual-data-model',
        entities: [
          {
            name: 'Entity',
            termReference: 'term-old-field-001', // Deprecated
          },
        ],
      };

      const result = await validateTermReferences(document, {
        dataDictionaryPath: dictPath,
      });

      expect(result.valid).toBe(true); // Warning, not error
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.type).toBe('deprecated-term-used');
      expect(result.errors[0]?.severity).toBe('warning');
      expect(result.errors[0]?.message).toContain('deprecated');
      expect(result.errors[0]?.message).toContain('term-new-field-001');

      await rm(testDir, { recursive: true, force: true });
    });

    test('should detect constraint violations', async () => {
      await mkdir(testDir, { recursive: true });

      const dictionary = {
        id: 'dd-001',
        type: 'data-dictionary',
        terms: [
          {
            id: 'term-email-001',
            term: 'Email',
            dataType: 'string',
            constraints: {
              required: true,
              unique: true,
            },
          },
        ],
      };

      const dictPath = join(testDir, 'data-dictionary.json');
      await writeFile(dictPath, JSON.stringify(dictionary, null, 2));

      const document = {
        id: 'doc-001',
        type: 'logical-data-model',
        entities: [
          {
            name: 'User',
            attributes: [
              {
                name: 'email',
                dataType: 'string',
                termReference: 'term-email-001',
                constraints: {
                  required: false, // Should be true
                  unique: false, // Should be true
                },
              },
            ],
          },
        ],
      };

      const result = await validateTermReferences(document, {
        dataDictionaryPath: dictPath,
      });

      expect(result.valid).toBe(true); // Warnings, not errors
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]?.type).toBe('term-constraint-violation');
      expect(result.errors[0]?.severity).toBe('warning');
      expect(result.errors[1]?.type).toBe('term-constraint-violation');
      expect(result.errors[1]?.severity).toBe('warning');

      await rm(testDir, { recursive: true, force: true });
    });

    test('should detect synonym usage', async () => {
      await mkdir(testDir, { recursive: true });

      const dictionary = {
        id: 'dd-001',
        type: 'data-dictionary',
        terms: [
          {
            id: 'term-order-001',
            term: 'Order',
            canonicalName: 'Order',
            synonyms: ['注文', 'オーダー'],
            dataType: 'object',
          },
        ],
      };

      const dictPath = join(testDir, 'data-dictionary.json');
      await writeFile(dictPath, JSON.stringify(dictionary, null, 2));

      const document = {
        id: 'doc-001',
        type: 'conceptual-data-model',
        entities: [
          {
            name: '注文', // Using synonym
            termReference: 'term-order-001',
          },
        ],
      };

      const result = await validateTermReferences(document, {
        dataDictionaryPath: dictPath,
      });

      expect(result.valid).toBe(true); // Info, not error
      expect(result.errors.length).toBeGreaterThan(0);
      const synonymError = result.errors.find((e) => e.type === 'synonym-used');
      expect(synonymError).toBeDefined();
      expect(synonymError?.severity).toBe('info');
      expect(synonymError?.message).toContain('注文');
      expect(synonymError?.message).toContain('Order');

      await rm(testDir, { recursive: true, force: true });
    });

    test('should skip validation when skipTerminology is true', async () => {
      const document = {
        id: 'doc-001',
        type: 'conceptual-data-model',
        entities: [
          {
            name: 'Order',
            termReference: 'term-nonexistent-999',
          },
        ],
      };

      const result = await validateTermReferences(document, {
        skipTerminology: true,
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
