import { describe, expect, test } from 'bun:test';
import type { DocumentIndex } from '../../src/validators/reference-validator';
import {
  buildDocumentIndex,
  validateReferences,
  validateReferencesAcrossDocuments,
} from '../../src/validators/reference-validator';

describe('reference-validator', () => {
  describe('validateReferences', () => {
    test('should pass for document with valid references', () => {
      const document = {
        id: 'doc-001',
        '@type': 'TestDocument',
        title: 'Test Document',
        traceability: {
          derivedFrom: ['doc-000'],
          satisfies: ['req-001', 'req-002'],
        },
      };

      const index: DocumentIndex = {
        'doc-000': { filePath: '/test/doc-000.json', type: 'TestDocument' },
        'doc-001': { filePath: '/test/doc-001.json', type: 'TestDocument' },
        'req-001': { filePath: '/test/req-001.json', type: 'Requirement' },
        'req-002': { filePath: '/test/req-002.json', type: 'Requirement' },
      };

      const result = validateReferences(document, index);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail for document with missing reference', () => {
      const document = {
        id: 'doc-001',
        '@type': 'TestDocument',
        title: 'Test Document',
        traceability: {
          derivedFrom: ['doc-999'], // This does not exist
          satisfies: ['req-001'],
        },
      };

      const index: DocumentIndex = {
        'doc-001': { filePath: '/test/doc-001.json', type: 'TestDocument' },
        'req-001': { filePath: '/test/req-001.json', type: 'Requirement' },
      };

      const result = validateReferences(document, index);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.type).toBe('missing-reference');
      expect(result.errors[0]?.referencedId).toBe('doc-999');
    });

    test('should detect multiple missing references', () => {
      const document = {
        id: 'doc-001',
        '@type': 'TestDocument',
        title: 'Test Document',
        traceability: {
          derivedFrom: ['doc-888', 'doc-999'],
          satisfies: ['req-888'],
        },
      };

      const index: DocumentIndex = {
        'doc-001': { filePath: '/test/doc-001.json', type: 'TestDocument' },
      };

      const result = validateReferences(document, index);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors.map((e) => e.referencedId).sort()).toEqual([
        'doc-888',
        'doc-999',
        'req-888',
      ]);
    });

    test('should handle document without id', () => {
      const document = {
        '@type': 'TestDocument',
        title: 'Test Document',
      };

      const index: DocumentIndex = {};

      const result = validateReferences(document, index);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.type).toBe('invalid-format');
    });

    test('should handle nested traceability fields', () => {
      const document = {
        id: 'doc-001',
        '@type': 'TestDocument',
        metadata: {
          relatedDocuments: ['doc-002', 'doc-003'],
        },
        sections: [
          {
            id: 'sec-001',
            dependsOn: ['sec-000'],
          },
        ],
      };

      const index: DocumentIndex = {
        'doc-001': { filePath: '/test/doc-001.json', type: 'TestDocument' },
        'doc-002': { filePath: '/test/doc-002.json', type: 'TestDocument' },
        'doc-003': { filePath: '/test/doc-003.json', type: 'TestDocument' },
        'sec-000': { filePath: '/test/sec-000.json', type: 'Section' },
      };

      const result = validateReferences(document, index);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateReferencesAcrossDocuments', () => {
    test('should detect circular references', async () => {
      const documents = [
        {
          id: 'doc-001',
          '@type': 'TestDocument',
          traceability: {
            derivedFrom: ['doc-002'],
          },
        },
        {
          id: 'doc-002',
          '@type': 'TestDocument',
          traceability: {
            derivedFrom: ['doc-003'],
          },
        },
        {
          id: 'doc-003',
          '@type': 'TestDocument',
          traceability: {
            derivedFrom: ['doc-001'], // Circular!
          },
        },
      ];

      const index: DocumentIndex = {
        'doc-001': { filePath: '/test/doc-001.json', type: 'TestDocument' },
        'doc-002': { filePath: '/test/doc-002.json', type: 'TestDocument' },
        'doc-003': { filePath: '/test/doc-003.json', type: 'TestDocument' },
      };

      const result = await validateReferencesAcrossDocuments(documents, index);

      expect(result.valid).toBe(false);
      const circularError = result.errors.find((e) => e.type === 'circular-reference');
      expect(circularError).toBeDefined();
      expect(circularError?.message).toContain('Circular reference detected');
    });

    test('should pass for valid document graph', async () => {
      const documents = [
        {
          id: 'doc-001',
          '@type': 'TestDocument',
          traceability: {
            derivedFrom: ['doc-000'],
          },
        },
        {
          id: 'doc-002',
          '@type': 'TestDocument',
          traceability: {
            derivedFrom: ['doc-001'],
          },
        },
        {
          id: 'doc-003',
          '@type': 'TestDocument',
          traceability: {
            derivedFrom: ['doc-001', 'doc-002'],
          },
        },
      ];

      const index: DocumentIndex = {
        'doc-000': { filePath: '/test/doc-000.json', type: 'TestDocument' },
        'doc-001': { filePath: '/test/doc-001.json', type: 'TestDocument' },
        'doc-002': { filePath: '/test/doc-002.json', type: 'TestDocument' },
        'doc-003': { filePath: '/test/doc-003.json', type: 'TestDocument' },
      };

      const result = await validateReferencesAcrossDocuments(documents, index);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('buildDocumentIndex', () => {
    test('should build index from fixture file', async () => {
      const fixturePath = import.meta
        .resolve('../fixtures/project-charter.json')
        .replace('file://', '');
      const index = await buildDocumentIndex([fixturePath]);

      expect(Object.keys(index)).toHaveLength(1);
      expect(index['pm-charter-001']).toBeDefined();
      expect(index['pm-charter-001']?.type).toBe('ProjectCharter');
    });

    test('should skip invalid JSON files', async () => {
      const invalidPath = import.meta.resolve('../fixtures/invalid.json').replace('file://', '');
      // Create temporary invalid file
      await Bun.write(invalidPath, 'not valid json {');

      const index = await buildDocumentIndex([invalidPath]);

      expect(Object.keys(index)).toHaveLength(0);

      // Cleanup
      await Bun.write(invalidPath, '{}');
    });
  });

  describe('advanced reference validation', () => {
    test('should handle self-reference', () => {
      const document = {
        id: 'doc-001',
        '@type': 'TestDocument',
        traceability: {
          derivedFrom: ['doc-001'], // Self-reference
        },
      };

      const index: DocumentIndex = {
        'doc-001': { filePath: '/test/doc-001.json', type: 'TestDocument' },
      };

      const result = validateReferences(document, index);

      // Self-reference is technically valid (document exists)
      expect(result.valid).toBe(true);
    });

    test('should handle empty reference arrays', () => {
      const document = {
        id: 'doc-001',
        '@type': 'TestDocument',
        traceability: {
          derivedFrom: [],
          satisfies: [],
        },
      };

      const index: DocumentIndex = {
        'doc-001': { filePath: '/test/doc-001.json', type: 'TestDocument' },
      };

      const result = validateReferences(document, index);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should handle null and undefined references gracefully', () => {
      const document = {
        id: 'doc-001',
        '@type': 'TestDocument',
        traceability: {
          derivedFrom: null,
          satisfies: undefined,
        },
      };

      const index: DocumentIndex = {
        'doc-001': { filePath: '/test/doc-001.json', type: 'TestDocument' },
      };

      const result = validateReferences(document, index);
      // Should not crash, null/undefined should be ignored
      expect(result.valid).toBe(true);
    });

    test('should validate deep circular reference (A→B→C→D→A)', async () => {
      const documents = [
        {
          id: 'doc-a',
          '@type': 'TestDocument',
          traceability: { derivedFrom: ['doc-b'] },
        },
        {
          id: 'doc-b',
          '@type': 'TestDocument',
          traceability: { derivedFrom: ['doc-c'] },
        },
        {
          id: 'doc-c',
          '@type': 'TestDocument',
          traceability: { derivedFrom: ['doc-d'] },
        },
        {
          id: 'doc-d',
          '@type': 'TestDocument',
          traceability: { derivedFrom: ['doc-a'] }, // Deep circular
        },
      ];

      const index: DocumentIndex = {
        'doc-a': { filePath: '/test/doc-a.json', type: 'TestDocument' },
        'doc-b': { filePath: '/test/doc-b.json', type: 'TestDocument' },
        'doc-c': { filePath: '/test/doc-c.json', type: 'TestDocument' },
        'doc-d': { filePath: '/test/doc-d.json', type: 'TestDocument' },
      };

      const result = await validateReferencesAcrossDocuments(documents, index);

      expect(result.valid).toBe(false);
      const circularError = result.errors.find((e) => e.type === 'circular-reference');
      expect(circularError).toBeDefined();
    });

    test('should detect circular reference in multiple paths', async () => {
      const documents = [
        {
          id: 'doc-001',
          '@type': 'TestDocument',
          traceability: {
            derivedFrom: ['doc-002'],
            satisfies: ['doc-003'],
          },
        },
        {
          id: 'doc-002',
          '@type': 'TestDocument',
          traceability: { derivedFrom: ['doc-003'] },
        },
        {
          id: 'doc-003',
          '@type': 'TestDocument',
          traceability: {
            derivedFrom: ['doc-001'], // Circular through different fields
          },
        },
      ];

      const index: DocumentIndex = {
        'doc-001': { filePath: '/test/doc-001.json', type: 'TestDocument' },
        'doc-002': { filePath: '/test/doc-002.json', type: 'TestDocument' },
        'doc-003': { filePath: '/test/doc-003.json', type: 'TestDocument' },
      };

      const result = await validateReferencesAcrossDocuments(documents, index);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.type === 'circular-reference')).toBe(true);
    });

    test('should handle invalid id formats', () => {
      const document = {
        id: 123, // Invalid: should be string
        '@type': 'TestDocument',
      };

      const index: DocumentIndex = {};

      const result = validateReferences(document, index);

      expect(result.valid).toBe(false);
      expect(result.errors[0]?.type).toBe('invalid-format');
    });

    test('should handle empty string id', () => {
      const document = {
        id: '',
        '@type': 'TestDocument',
      };

      const index: DocumentIndex = {};

      const result = validateReferences(document, index);

      expect(result.valid).toBe(false);
      expect(result.errors[0]?.type).toBe('invalid-format');
    });

    test('should validate all reference field types', () => {
      const document = {
        id: 'doc-001',
        '@type': 'TestDocument',
        traceability: {
          derivedFrom: ['doc-000'],
          satisfies: ['req-001'],
        },
        metadata: {
          relatedDocuments: ['doc-002'],
          parentId: 'doc-parent',
          childIds: ['doc-child-1', 'doc-child-2'],
        },
        dependencies: {
          dependsOn: ['dep-001'],
          blocks: ['task-001'],
          relates: ['rel-001'],
        },
      };

      const index: DocumentIndex = {
        'doc-000': { filePath: '/test/doc-000.json', type: 'Document' },
        'doc-001': { filePath: '/test/doc-001.json', type: 'Document' },
        'doc-002': { filePath: '/test/doc-002.json', type: 'Document' },
        'doc-parent': { filePath: '/test/doc-parent.json', type: 'Document' },
        'doc-child-1': { filePath: '/test/doc-child-1.json', type: 'Document' },
        'doc-child-2': { filePath: '/test/doc-child-2.json', type: 'Document' },
        'req-001': { filePath: '/test/req-001.json', type: 'Requirement' },
        'dep-001': { filePath: '/test/dep-001.json', type: 'Dependency' },
        'task-001': { filePath: '/test/task-001.json', type: 'Task' },
        'rel-001': { filePath: '/test/rel-001.json', type: 'Relation' },
      };

      const result = validateReferences(document, index);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect missing references in complex nested structure', () => {
      const document = {
        id: 'doc-001',
        '@type': 'TestDocument',
        sections: [
          {
            id: 'sec-001',
            dependsOn: ['sec-000', 'sec-missing'], // One missing
          },
          {
            id: 'sec-002',
            blocks: ['task-missing'], // Missing
          },
        ],
      };

      const index: DocumentIndex = {
        'doc-001': { filePath: '/test/doc-001.json', type: 'Document' },
        'sec-000': { filePath: '/test/sec-000.json', type: 'Section' },
      };

      const result = validateReferences(document, index);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.map((e) => e.referencedId).sort()).toEqual([
        'sec-missing',
        'task-missing',
      ]);
    });
  });

  describe('buildDocumentIndex edge cases', () => {
    test('should handle documents without @type', async () => {
      const tempFile = '/tmp/test-no-type.json';
      await Bun.write(
        tempFile,
        JSON.stringify({
          id: 'test-001',
          title: 'Test',
        })
      );

      const index = await buildDocumentIndex([tempFile]);

      expect(index['test-001']).toBeDefined();
      expect(index['test-001']?.type).toBe('unknown');

      // Cleanup
      await Bun.write(tempFile, '');
    });

    test('should handle documents with non-string id', async () => {
      const tempFile = '/tmp/test-numeric-id.json';
      await Bun.write(
        tempFile,
        JSON.stringify({
          id: 12345,
          '@type': 'TestDocument',
        })
      );

      const index = await buildDocumentIndex([tempFile]);

      // Should skip documents with invalid id format
      expect(Object.keys(index)).toHaveLength(0);

      // Cleanup
      await Bun.write(tempFile, '');
    });

    test('should handle empty files', async () => {
      const tempFile = '/tmp/test-empty.json';
      await Bun.write(tempFile, '');

      const index = await buildDocumentIndex([tempFile]);

      expect(Object.keys(index)).toHaveLength(0);

      // Cleanup
      await Bun.write(tempFile, '');
    });

    test('should handle multiple files with same id', async () => {
      const file1 = '/tmp/test-dup-1.json';
      const file2 = '/tmp/test-dup-2.json';

      await Bun.write(file1, JSON.stringify({ id: 'dup-001', '@type': 'Type1' }));
      await Bun.write(file2, JSON.stringify({ id: 'dup-001', '@type': 'Type2' }));

      const index = await buildDocumentIndex([file1, file2]);

      // Last one wins
      expect(index['dup-001']).toBeDefined();
      expect(index['dup-001']?.filePath).toBe(file2);

      // Cleanup
      await Bun.write(file1, '');
      await Bun.write(file2, '');
    });
  });
});
