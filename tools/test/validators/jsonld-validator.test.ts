import { describe, expect, test } from 'bun:test';
import {
  createLocalDocumentLoader,
  validateJsonLd,
  validateJsonLd11Context,
} from '../../src/validators/jsonld-validator';

describe('jsonld-validator', () => {
  const contextBaseUrl = 'https://ukiyoue.example.org/contexts/';

  describe('validateJsonLd', () => {
    test('should pass for valid JSON-LD document with inline context', async () => {
      const document = {
        '@context': {
          '@version': 1.1,
          '@vocab': 'https://ukiyoue.example.org/vocab#',
          title: 'https://schema.org/name',
          id: '@id',
        },
        '@type': 'ProjectCharter',
        id: 'pm-charter-001',
        title: 'Test Project Charter',
      };

      const result = await validateJsonLd(document, {
        validateExpansion: true,
      });

      if (!result.valid) {
        console.log('Validation errors:', result.errors);
      }

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.expandedDocument).toBeDefined();
    });

    test('should pass for valid JSON-LD document with local base.jsonld context', async () => {
      const document = {
        '@context': 'https://ukiyoue.example.org/contexts/base.jsonld',
        '@type': 'ProjectCharter',
        id: 'pm-charter-001',
        title: 'Test Project Charter',
      };

      const documentLoader = createLocalDocumentLoader(contextBaseUrl);
      const result = await validateJsonLd(document, {
        documentLoader,
        validateExpansion: true,
      });

      if (!result.valid) {
        console.log('Validation errors:', result.errors);
      }

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.expandedDocument).toBeDefined();
    });

    test('should fail for document without @context', async () => {
      const document = {
        '@type': 'ProjectCharter',
        id: 'pm-charter-001',
        title: 'Test Project Charter',
      };

      const result = await validateJsonLd(document, {
        validateExpansion: false,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.type).toBe('missing-context');
    });

    test('should warn for document without @type', async () => {
      const document = {
        '@context': 'https://ukiyoue.example.org/contexts/base.jsonld',
        id: 'pm-charter-001',
        title: 'Test Project Charter',
      };

      const documentLoader = createLocalDocumentLoader(contextBaseUrl);
      const result = await validateJsonLd(document, {
        documentLoader,
        validateExpansion: true,
      });

      expect(result.valid).toBe(false);
      const typeError = result.errors.find((e) => e.type === 'invalid-type');
      expect(typeError).toBeDefined();
    });

    test('should fail for document with invalid @context URL', async () => {
      const document = {
        '@context': 'https://ukiyoue.example.org/contexts/nonexistent.jsonld',
        '@type': 'ProjectCharter',
        id: 'pm-charter-001',
        title: 'Test Project Charter',
      };

      const documentLoader = createLocalDocumentLoader(contextBaseUrl);
      const result = await validateJsonLd(document, {
        documentLoader,
        validateExpansion: true,
      });

      expect(result.valid).toBe(false);
      const contextError = result.errors.find((e) => e.type === 'invalid-context');
      expect(contextError).toBeDefined();
    });

    test('should block remote context loading by default', async () => {
      const document = {
        '@context': 'https://schema.org/',
        '@type': 'Thing',
        id: 'test-001',
      };

      const result = await validateJsonLd(document, {
        validateExpansion: true,
        allowRemoteContexts: false,
      });

      expect(result.valid).toBe(false);
      const hasRemoteError = result.errors.some(
        (e) =>
          e.message.includes('Remote context loading is disabled') ||
          e.message.includes('loading remote context') ||
          e.message.includes('Dereferencing a URL')
      );
      expect(hasRemoteError).toBe(true);
    });

    test('should validate expected @type', async () => {
      const document = {
        '@context': 'https://ukiyoue.example.org/contexts/base.jsonld',
        '@type': 'ProjectCharter',
        id: 'pm-charter-001',
        title: 'Test Project Charter',
      };

      const documentLoader = createLocalDocumentLoader(contextBaseUrl);
      const result = await validateJsonLd(document, {
        documentLoader,
        validateExpansion: true,
        expectedType: 'RequirementsDocument',
      });

      expect(result.valid).toBe(false);
      const typeError = result.errors.find(
        (e) => e.type === 'invalid-type' && e.message.includes('Expected @type')
      );
      expect(typeError).toBeDefined();
    });

    test('should handle inline @context object', async () => {
      const document = {
        '@context': {
          '@version': 1.1,
          '@vocab': 'https://ukiyoue.example.org/vocab#',
          title: 'https://schema.org/name',
        },
        '@type': 'ProjectCharter',
        id: 'pm-charter-001',
        title: 'Test Project Charter',
      };

      const result = await validateJsonLd(document, {
        validateExpansion: true,
        allowRemoteContexts: false,
      });

      expect(result.valid).toBe(true);
      expect(result.expandedDocument).toBeDefined();
    });

    test('should skip expansion when validateExpansion is false', async () => {
      const document = {
        '@context': 'https://ukiyoue.example.org/contexts/base.jsonld',
        '@type': 'ProjectCharter',
        id: 'pm-charter-001',
        title: 'Test Project Charter',
      };

      const result = await validateJsonLd(document, {
        validateExpansion: false,
      });

      expect(result.expandedDocument).toBeUndefined();
    });
  });

  describe('validateJsonLd11Context', () => {
    test('should pass for context with @version 1.1', () => {
      const context = {
        '@version': 1.1,
        '@vocab': 'https://ukiyoue.example.org/vocab#',
        title: 'https://schema.org/name',
      };

      const errors = validateJsonLd11Context(context);

      expect(errors).toHaveLength(0);
    });

    test('should warn for context without @version 1.1', () => {
      const context = {
        '@vocab': 'https://ukiyoue.example.org/vocab#',
        title: 'https://schema.org/name',
      };

      const errors = validateJsonLd11Context(context);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]?.type).toBe('invalid-context');
      expect(errors[0]?.message).toContain('@version: 1.1');
    });

    test('should warn for context with @version 1.0', () => {
      const context = {
        '@version': 1.0,
        '@vocab': 'https://ukiyoue.example.org/vocab#',
        title: 'https://schema.org/name',
      };

      const errors = validateJsonLd11Context(context);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]?.message).toContain('JSON-LD 1.1');
    });

    test('should handle non-object context', () => {
      const errors = validateJsonLd11Context('https://schema.org/');

      expect(errors).toHaveLength(0);
    });
  });

  describe('createLocalDocumentLoader', () => {
    test('should load local context file', async () => {
      const documentLoader = createLocalDocumentLoader(contextBaseUrl);

      const result = await documentLoader('https://ukiyoue.example.org/contexts/base.jsonld');

      expect(result.documentUrl).toBe('https://ukiyoue.example.org/contexts/base.jsonld');
      expect(result.document).toBeDefined();
      expect(typeof result.document).toBe('object');

      const doc = result.document as Record<string, unknown>;
      expect(doc['@context']).toBeDefined();
    });

    test('should reject non-local context URLs', async () => {
      const documentLoader = createLocalDocumentLoader(contextBaseUrl);

      await expect(documentLoader('https://schema.org/')).rejects.toThrow(
        'Context URL not in allowed local base'
      );
    });

    test('should reject nonexistent local context', async () => {
      const documentLoader = createLocalDocumentLoader(contextBaseUrl);

      await expect(
        documentLoader('https://ukiyoue.example.org/contexts/nonexistent.jsonld')
      ).rejects.toThrow('Failed to load local context');
    });
  });

  describe('advanced JSON-LD features', () => {
    test('should handle array context', async () => {
      const document = {
        '@context': [
          'https://ukiyoue.example.org/contexts/base.jsonld',
          {
            customField: 'https://example.com/vocab#customField',
          },
        ],
        '@type': 'ProjectCharter',
        id: 'pm-charter-001',
        title: 'Test',
        customField: 'custom value',
      };

      const documentLoader = createLocalDocumentLoader(contextBaseUrl);
      const result = await validateJsonLd(document, {
        documentLoader,
        validateExpansion: true,
      });

      expect(result.valid).toBe(true);
      expect(result.expandedDocument).toBeDefined();
    });

    test('should handle multiple @type values', async () => {
      const document = {
        '@context': {
          '@version': 1.1,
          '@vocab': 'https://ukiyoue.example.org/vocab#',
        },
        '@type': ['ProjectCharter', 'Document'],
        id: 'pm-charter-001',
        title: 'Test',
      };

      const result = await validateJsonLd(document, {
        validateExpansion: true,
      });

      expect(result.valid).toBe(true);
      expect(result.expandedDocument).toBeDefined();
    });

    test('should validate @id and @type combination', async () => {
      const document = {
        '@context': {
          '@version': 1.1,
          '@vocab': 'https://ukiyoue.example.org/vocab#',
        },
        '@id': 'https://example.org/documents/charter-001',
        '@type': 'ProjectCharter',
        title: 'Test',
      };

      const result = await validateJsonLd(document, {
        validateExpansion: true,
      });

      expect(result.valid).toBe(true);
      expect(result.expandedDocument).toBeDefined();

      // Verify expanded document has the correct @id
      if (Array.isArray(result.expandedDocument) && result.expandedDocument.length > 0) {
        const expanded = result.expandedDocument[0] as Record<string, unknown>;
        expect(expanded?.['@id']).toBe('https://example.org/documents/charter-001');
      }
    });

    test('should handle compacted JSON-LD', async () => {
      const document = {
        '@context': {
          '@version': 1.1,
          '@vocab': 'https://ukiyoue.example.org/vocab#',
          name: 'https://schema.org/name',
          description: 'https://schema.org/description',
        },
        '@type': 'Document',
        name: 'Test Document',
        description: 'This is a test',
      };

      const result = await validateJsonLd(document, {
        validateExpansion: true,
      });

      expect(result.valid).toBe(true);
      expect(result.expandedDocument).toBeDefined();
    });

    test('should validate nested objects with different contexts', async () => {
      const document = {
        '@context': {
          '@version': 1.1,
          '@vocab': 'https://ukiyoue.example.org/vocab#',
          author: {
            '@id': 'https://schema.org/author',
            '@context': {
              name: 'https://schema.org/name',
              email: 'https://schema.org/email',
            },
          },
        },
        '@type': 'Document',
        title: 'Test',
        author: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      const result = await validateJsonLd(document, {
        validateExpansion: true,
      });

      expect(result.valid).toBe(true);
    });

    test('should handle @language in context', async () => {
      const document = {
        '@context': {
          '@version': 1.1,
          '@vocab': 'https://ukiyoue.example.org/vocab#',
          '@language': 'ja',
        },
        '@type': 'Document',
        title: 'テストドキュメント',
      };

      const result = await validateJsonLd(document, {
        validateExpansion: true,
      });

      expect(result.valid).toBe(true);
    });

    test('should detect missing @context in nested objects', async () => {
      const document = {
        '@context': {
          '@version': 1.1,
          '@vocab': 'https://ukiyoue.example.org/vocab#',
        },
        '@type': 'Document',
        // Missing context for embedded object
        nested: {
          '@type': 'SubDocument',
          value: 'test',
        },
      };

      const result = await validateJsonLd(document, {
        validateExpansion: true,
      });

      // Should still be valid as parent context applies
      expect(result.valid).toBe(true);
    });
  });

  describe('context validation edge cases', () => {
    test('should handle empty context object', () => {
      const context = {};
      const errors = validateJsonLd11Context(context);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]?.message).toContain('@version');
    });

    test('should validate context with @protected', () => {
      const context = {
        '@version': 1.1,
        '@vocab': 'https://ukiyoue.example.org/vocab#',
        '@protected': true,
      };

      const errors = validateJsonLd11Context(context);
      expect(errors).toHaveLength(0);
    });

    test('should handle numeric @version', () => {
      const context = {
        '@version': 1.1,
        '@vocab': 'https://ukiyoue.example.org/vocab#',
      };

      const errors = validateJsonLd11Context(context);
      expect(errors).toHaveLength(0);
    });

    test('should reject string @version other than "1.1"', () => {
      const context = {
        '@version': '1.0',
        '@vocab': 'https://ukiyoue.example.org/vocab#',
      };

      const errors = validateJsonLd11Context(context);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('expansion validation', () => {
    test('should validate expanded form', async () => {
      const document = {
        '@context': {
          '@version': 1.1,
          '@vocab': 'https://ukiyoue.example.org/vocab#',
        },
        '@type': 'Document',
        title: 'Test',
        items: [{ name: 'Item 1' }, { name: 'Item 2' }],
      };

      const result = await validateJsonLd(document, {
        validateExpansion: true,
      });

      expect(result.valid).toBe(true);
      expect(result.expandedDocument).toBeDefined();
      expect(Array.isArray(result.expandedDocument)).toBe(true);
    });

    test('should handle expansion errors gracefully', async () => {
      const document = {
        '@context': {
          '@version': 1.1,
          // Invalid context definition
          '@vocab': 123, // Should be string
        },
        '@type': 'Document',
      };

      const result = await validateJsonLd(document, {
        validateExpansion: true,
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
