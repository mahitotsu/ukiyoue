import { describe, expect, test } from 'bun:test';
import { resolve } from 'path';
import {
  createLocalDocumentLoader,
  validateJsonLd,
  validateJsonLd11Context,
} from '../../src/validators/jsonld-validator';

describe('jsonld-validator', () => {
  const contextBaseUrl = 'https://ukiyoue.example.org/contexts/';
  const contextDir = resolve(__dirname, '../../../semantics/context/');

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

      const documentLoader = createLocalDocumentLoader(contextBaseUrl, contextDir);
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

      const documentLoader = createLocalDocumentLoader(contextBaseUrl, contextDir);
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

      const documentLoader = createLocalDocumentLoader(contextBaseUrl, contextDir);
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

      const documentLoader = createLocalDocumentLoader(contextBaseUrl, contextDir);
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
      const documentLoader = createLocalDocumentLoader(contextBaseUrl, contextDir);

      const result = await documentLoader('https://ukiyoue.example.org/contexts/base.jsonld');

      expect(result.documentUrl).toBe('https://ukiyoue.example.org/contexts/base.jsonld');
      expect(result.document).toBeDefined();
      expect(typeof result.document).toBe('object');

      const doc = result.document as Record<string, unknown>;
      expect(doc['@context']).toBeDefined();
    });

    test('should reject non-local context URLs', async () => {
      const documentLoader = createLocalDocumentLoader(contextBaseUrl, contextDir);

      await expect(documentLoader('https://schema.org/')).rejects.toThrow(
        'Context URL not in allowed local base'
      );
    });

    test('should reject nonexistent local context', async () => {
      const documentLoader = createLocalDocumentLoader(contextBaseUrl, contextDir);

      await expect(
        documentLoader('https://ukiyoue.example.org/contexts/nonexistent.jsonld')
      ).rejects.toThrow('Failed to load local context');
    });
  });
});
