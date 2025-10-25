import { describe, expect, test } from 'bun:test';
import { validateReferences } from '../../src/validators/reference-validator.js';

describe('Reference Validator - Type Validation', () => {
  test('should pass when User Story derives from Business Goal', () => {
    const documentIndex = {
      'bg-tos-001': { filePath: 'bg-tos-001.json', type: 'BusinessGoal' },
      'us-tos-001': { filePath: 'us-tos-001.json', type: 'UserStory' },
    };

    const userStory = {
      '@type': 'UserStory',
      id: 'us-tos-001',
      traceability: {
        derivedFrom: ['bg-tos-001'],
      },
    };

    const result = validateReferences(userStory, documentIndex);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should fail when User Story derives from Roadmap (invalid input type)', () => {
    const documentIndex = {
      'roadmap-tos-001': { filePath: 'roadmap-tos-001.json', type: 'Roadmap' },
      'us-tos-001': { filePath: 'us-tos-001.json', type: 'UserStory' },
    };

    const userStory = {
      '@type': 'UserStory',
      id: 'us-tos-001',
      traceability: {
        derivedFrom: ['roadmap-tos-001'],
      },
    };

    const result = validateReferences(userStory, documentIndex);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.type).toBe('invalid-input-type');
    expect(result.errors[0]?.message).toContain('can only derive from [business-goal]');
  });

  test('should pass when Functional Requirements derives from Use Case and Business Goal', () => {
    const documentIndex = {
      'uc-tos-001': { filePath: 'uc-tos-001.json', type: 'UseCase' },
      'bg-tos-001': { filePath: 'bg-tos-001.json', type: 'BusinessGoal' },
      'fr-tos-001': { filePath: 'fr-tos-001.json', type: 'FunctionalRequirements' },
    };

    const funcReq = {
      '@type': 'FunctionalRequirements',
      id: 'fr-tos-001',
      traceability: {
        derivedFrom: ['uc-tos-001', 'bg-tos-001'],
      },
    };

    const result = validateReferences(funcReq, documentIndex);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should fail when Project Charter has derivedFrom (starting point)', () => {
    const documentIndex = {
      'some-doc': { filePath: 'some-doc.json', type: 'SomeType' },
      'pc-tos-001': { filePath: 'pc-tos-001.json', type: 'ProjectCharter' },
    };

    const charter = {
      '@type': 'ProjectCharter',
      id: 'pc-tos-001',
      traceability: {
        derivedFrom: ['some-doc'],
      },
    };

    const result = validateReferences(charter, documentIndex);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.type).toBe('invalid-input-type');
    expect(result.errors[0]?.message).toContain('should not have derivedFrom');
  });

  test('should pass when Risk Register has no derivedFrom (empty inputs)', () => {
    const documentIndex = {
      'pc-tos-001': { filePath: 'pc-tos-001.json', type: 'ProjectCharter' },
      'risk-register-tos-001': { filePath: 'risk-register-tos-001.json', type: 'RiskRegister' },
    };

    const riskRegister = {
      '@type': 'RiskRegister',
      id: 'risk-register-tos-001',
      // No derivedFrom - traceability via individual risk affectedArtifacts
    };

    const result = validateReferences(riskRegister, documentIndex);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should pass when ADR has no derivedFrom (empty inputs)', () => {
    const documentIndex = {
      'nfr-tos-001': { filePath: 'nfr-tos-001.json', type: 'NonFunctionalRequirements' },
      'adr-001': { filePath: 'adr-001.json', type: 'ArchitectureDecisionRecord' },
    };

    const adr = {
      '@type': 'ArchitectureDecisionRecord',
      id: 'adr-001',
      // No derivedFrom - use impact and relatedDecisions instead
    };

    const result = validateReferences(adr, documentIndex);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should not validate non-derivedFrom fields (satisfies, relatedDocuments)', () => {
    const documentIndex = {
      'some-requirement': { filePath: 'some-req.json', type: 'SomeType' },
      'us-tos-001': { filePath: 'us-tos-001.json', type: 'UserStory' },
    };

    const userStory = {
      '@type': 'UserStory',
      id: 'us-tos-001',
      traceability: {
        satisfies: ['some-requirement'], // Should not be validated for type
        relatedDocuments: ['some-requirement'], // Should not be validated for type
      },
    };

    const result = validateReferences(userStory, documentIndex);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should handle type aliases (PM-CHARTER, BIZ-GOAL, etc.)', () => {
    const documentIndex = {
      'bg-tos-001': { filePath: 'bg-tos-001.json', type: 'BIZ-GOAL' }, // Alias
      'us-tos-001': { filePath: 'us-tos-001.json', type: 'BIZ-STORY' }, // Alias
    };

    const userStory = {
      '@type': 'BIZ-STORY',
      id: 'us-tos-001',
      traceability: {
        derivedFrom: ['bg-tos-001'],
      },
    };

    const result = validateReferences(userStory, documentIndex);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should fail with clear error message when Data Model derives from wrong type', () => {
    const documentIndex = {
      'ui-spec-001': { filePath: 'ui-spec-001.json', type: 'UIUXSpecification' },
      'data-model-001': { filePath: 'data-model-001.json', type: 'DataModel' },
    };

    const dataModel = {
      '@type': 'DataModel',
      id: 'data-model-001',
      traceability: {
        derivedFrom: ['ui-spec-001'],
      },
    };

    const result = validateReferences(dataModel, documentIndex);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.type).toBe('invalid-input-type');
    expect(result.errors[0]?.message).toContain('conceptual-data-model');
    expect(result.errors[0]?.message).toContain('data-dictionary');
  });

  test('should validate Risk Register affectedArtifacts references', () => {
    const documentIndex = {
      'pc-tos-001': { filePath: 'pc-tos-001.json', type: 'ProjectCharter' },
      'us-tos-001': { filePath: 'us-tos-001.json', type: 'UserStory' },
      'risk-register-001': { filePath: 'risk-register-001.json', type: 'RiskRegister' },
    };

    const riskRegister = {
      '@type': 'RiskRegister',
      id: 'risk-register-001',
      risks: [
        {
          id: 'RISK-001',
          description: 'Some risk',
          affectedArtifacts: ['pc-tos-001', 'us-tos-001'], // Valid references
        },
      ],
    };

    const result = validateReferences(riskRegister, documentIndex);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should detect missing references in Risk Register affectedArtifacts', () => {
    const documentIndex = {
      'pc-tos-001': { filePath: 'pc-tos-001.json', type: 'ProjectCharter' },
      'risk-register-001': { filePath: 'risk-register-001.json', type: 'RiskRegister' },
    };

    const riskRegister = {
      '@type': 'RiskRegister',
      id: 'risk-register-001',
      risks: [
        {
          id: 'RISK-001',
          description: 'Some risk',
          affectedArtifacts: ['pc-tos-001', 'missing-artifact'], // One missing
        },
      ],
    };

    const result = validateReferences(riskRegister, documentIndex);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]?.referencedId).toBe('missing-artifact');
  });

  test('should validate ADR relatedDecisions references', () => {
    const documentIndex = {
      'adr-001': { filePath: 'adr-001.json', type: 'ArchitectureDecisionRecord' },
      'adr-002': { filePath: 'adr-002.json', type: 'ArchitectureDecisionRecord' },
      'adr-003': { filePath: 'adr-003.json', type: 'ArchitectureDecisionRecord' },
    };

    const adr = {
      '@type': 'ArchitectureDecisionRecord',
      id: 'adr-003',
      title: 'Use PostgreSQL',
      relatedDecisions: ['adr-001', 'adr-002'], // Valid references to other ADRs
    };

    const result = validateReferences(adr, documentIndex);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should detect missing references in ADR relatedDecisions', () => {
    const documentIndex = {
      'adr-001': { filePath: 'adr-001.json', type: 'ArchitectureDecisionRecord' },
      'adr-003': { filePath: 'adr-003.json', type: 'ArchitectureDecisionRecord' },
    };

    const adr = {
      '@type': 'ArchitectureDecisionRecord',
      id: 'adr-003',
      title: 'Use PostgreSQL',
      relatedDecisions: ['adr-001', 'adr-999'], // adr-999 doesn't exist
    };

    const result = validateReferences(adr, documentIndex);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]?.referencedId).toBe('adr-999');
  });
});
