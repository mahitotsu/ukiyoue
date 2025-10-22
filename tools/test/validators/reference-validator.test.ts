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
    test('should detect circular references', () => {
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

      const result = validateReferencesAcrossDocuments(documents, index);

      expect(result.valid).toBe(false);
      const circularError = result.errors.find((e) => e.type === 'circular-reference');
      expect(circularError).toBeDefined();
      expect(circularError?.message).toContain('Circular reference detected');
    });

    test('should pass for valid document graph', () => {
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

      const result = validateReferencesAcrossDocuments(documents, index);

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
});
