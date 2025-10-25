/**
 * Tests for SHACL validator
 */

import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { validateShacl } from '../../src/validators/shacl-validator.js';

const fixturesDir = resolve(import.meta.dir, '../fixtures/shacl-test');

describe('SHACL Validator', () => {
  test('should validate User Story derived from Business Goal', async () => {
    const userStory = {
      '@context': 'https://ukiyoue.example.org/context/base.jsonld',
      id: 'us-001',
      type: 'user-story',
      title: 'Test User Story',
      derivedFrom: ['bg-001'],
    };

    const result = await validateShacl(userStory, { documentIndexPath: fixturesDir });
    if (!result.valid) {
      console.log('SHACL errors:', result.errors);
    }
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject User Story with no derivedFrom', async () => {
    const userStory = {
      '@context': 'https://ukiyoue.example.org/context/base.jsonld',
      id: 'us-test-002',
      type: 'user-story',
      title: 'Invalid User Story',
      derivedFrom: [],
    };

    const result = await validateShacl(userStory);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should validate Project Charter with no derivedFrom', async () => {
    const projectCharter = {
      '@context': 'https://ukiyoue.example.org/context/base.jsonld',
      id: 'pc-test-001',
      type: 'project-charter',
      title: 'Test Project Charter',
    };

    const result = await validateShacl(projectCharter);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject Project Charter with derivedFrom', async () => {
    const projectCharter = {
      '@context': 'https://ukiyoue.example.org/context/base.jsonld',
      id: 'pc-test-002',
      type: 'project-charter',
      title: 'Invalid Project Charter',
      derivedFrom: ['something'],
    };

    const result = await validateShacl(projectCharter);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('must not have derivedFrom');
  });

  test('should validate Business Goal derived from Project Charter', async () => {
    const businessGoal = {
      '@context': 'https://ukiyoue.example.org/context/base.jsonld',
      id: 'bg-001',
      type: 'business-goal',
      title: 'Test Business Goal',
      derivedFrom: ['pc-001'],
    };

    const result = await validateShacl(businessGoal, { documentIndexPath: fixturesDir });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should validate Risk Register (no derivedFrom required)', async () => {
    const riskRegister = {
      '@context': 'https://ukiyoue.example.org/context/base.jsonld',
      id: 'risk-test-001',
      type: 'risk-register',
      title: 'Test Risk Register',
      // No derivedFrom - traceability via individual risk affectedArtifacts
    };

    const result = await validateShacl(riskRegister);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject Risk Register with derivedFrom', async () => {
    const riskRegister = {
      '@context': 'https://ukiyoue.example.org/context/base.jsonld',
      id: 'risk-test-002',
      type: 'risk-register',
      title: 'Test Risk Register',
      derivedFrom: ['pc-test-001'], // Should be rejected
    };

    const result = await validateShacl(riskRegister);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Risk Register');
  });

  test('should validate ADR (no derivedFrom required)', async () => {
    const adr = {
      '@context': 'https://ukiyoue.example.org/context/base.jsonld',
      id: 'adr-test-001',
      type: 'architecture-decision-record',
      title: 'Test ADR',
      // No derivedFrom - use impact and relatedDecisions instead
    };

    const result = await validateShacl(adr);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject ADR with derivedFrom', async () => {
    const adr = {
      '@context': 'https://ukiyoue.example.org/context/base.jsonld',
      id: 'adr-test-002',
      type: 'architecture-decision-record',
      title: 'Test ADR',
      derivedFrom: ['nfr-test-001'], // Should be rejected
    };

    const result = await validateShacl(adr);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('ADR');
  });

  test('should validate Functional Requirements from Use Case', async () => {
    const fr = {
      '@context': 'https://ukiyoue.example.org/context/base.jsonld',
      id: 'fr-001',
      type: 'functional-requirements',
      title: 'Test FR',
      derivedFrom: ['uc-001'],
    };

    const result = await validateShacl(fr, { documentIndexPath: fixturesDir });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should handle validation errors gracefully', async () => {
    const invalid = {
      invalid: 'data',
    };

    const result = await validateShacl(invalid);
    // Should not crash, may or may not be valid depending on implementation
    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('errors');
  });
});
