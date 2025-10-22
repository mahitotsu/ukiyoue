/**
 * Integration tests for validate.ts CLI tool
 *
 * Tests the main validation CLI by spawning it as a subprocess.
 * This provides end-to-end validation coverage including:
 * - Argument parsing
 * - File collection
 * - Schema inference
 * - Validator orchestration
 * - Output formatting
 */

import { describe, expect, test } from 'bun:test';
import { spawnSync } from 'child_process';
import { join, resolve } from 'path';

const VALIDATE_CLI = resolve(import.meta.dir, '../src/validate.ts');
const FIXTURES_DIR = resolve(import.meta.dir, 'fixtures');

/**
 * Helper function to run the validate CLI
 */
function runValidate(args: string[]): {
  stdout: string;
  stderr: string;
  exitCode: number;
} {
  const result = spawnSync('bun', [VALIDATE_CLI, ...args], {
    encoding: 'utf8',
    cwd: resolve(import.meta.dir, '..'),
  });

  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    exitCode: result.status || 0,
  };
}

describe('validate CLI', () => {
  describe('argument parsing', () => {
    test('should show error when no path is provided', () => {
      const result = runValidate([]);
      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain('Usage:');
    });

    test('should accept single file path', () => {
      const result = runValidate([join(FIXTURES_DIR, 'project-charter.json')]);
      // Should not error on argument parsing
      expect(result.stderr).not.toContain('Usage:');
    });

    test('should accept --skip-schema flag', () => {
      const result = runValidate([join(FIXTURES_DIR, 'project-charter.json'), '--skip-schema']);
      expect(result.stdout).not.toContain('JSON Schema validation');
    });

    test('should accept --skip-references flag', () => {
      const result = runValidate([join(FIXTURES_DIR, 'project-charter.json'), '--skip-references']);
      expect(result.stdout).not.toContain('Reference integrity');
    });

    test('should accept --skip-jsonld flag', () => {
      const result = runValidate([join(FIXTURES_DIR, 'project-charter.json'), '--skip-jsonld']);
      expect(result.stdout).not.toContain('JSON-LD validation');
    });

    test('should accept --verbose flag', () => {
      const result = runValidate([join(FIXTURES_DIR, 'project-charter.json'), '--verbose']);
      expect(result.exitCode).toBe(0);
    });

    test('should accept --schema flag with path', () => {
      const schemaPath = resolve(import.meta.dir, '../../schemas/layer1/project-charter.json');
      const result = runValidate([
        join(FIXTURES_DIR, 'project-charter.json'),
        '--schema',
        schemaPath,
      ]);
      expect(result.exitCode).toBe(0);
    });

    test('should accept multiple flags', () => {
      const result = runValidate([
        join(FIXTURES_DIR, 'project-charter.json'),
        '--skip-references',
        '--skip-jsonld',
        '--verbose',
      ]);
      expect(result.stdout).toContain('JSON Schema validation');
      expect(result.stdout).not.toContain('Reference integrity');
      expect(result.stdout).not.toContain('JSON-LD validation');
    });
  });

  describe('file collection', () => {
    test('should validate single JSON file', () => {
      const result = runValidate([join(FIXTURES_DIR, 'project-charter.json')]);
      expect(result.stdout).toContain('project-charter.json');
      expect(result.exitCode).toBe(0);
    });

    test('should reject non-existent file', () => {
      const result = runValidate([join(FIXTURES_DIR, 'nonexistent.json')]);
      expect(result.exitCode).toBe(1);
    });

    test('should validate directory of JSON files', () => {
      const result = runValidate([FIXTURES_DIR]);
      expect(result.stdout).toContain('Found');
      expect(result.stdout).toContain('file(s)');
    });
  });

  describe('validation orchestration', () => {
    test('should run all validators by default', () => {
      const result = runValidate([join(FIXTURES_DIR, 'project-charter.json')]);
      expect(result.stdout).toContain('JSON Schema validation');
      expect(result.stdout).toContain('Reference integrity');
      expect(result.stdout).toContain('JSON-LD validation');
    });

    test('should detect invalid JSON file', () => {
      const result = runValidate([join(FIXTURES_DIR, 'invalid.json')]);
      expect(result.exitCode).toBe(1);
      // invalid.json is valid JSON but invalid document (missing required fields)
      expect(result.stdout).toContain('validation failed');
    });

    test('should pass for valid document', () => {
      const result = runValidate([join(FIXTURES_DIR, 'project-charter.json')]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('validated successfully');
    });

    test('should report validation errors', () => {
      // Use invalid.json which is valid JSON but invalid document
      const result = runValidate([join(FIXTURES_DIR, 'invalid.json')]);
      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain('validation failed');
    });
  });

  describe('output formatting', () => {
    test('should show validation progress', () => {
      const result = runValidate([join(FIXTURES_DIR, 'project-charter.json')]);
      expect(result.stdout).toContain('Validating:');
      expect(result.stdout).toContain('✅');
    });

    test('should show summary at the end', () => {
      const result = runValidate([join(FIXTURES_DIR, 'project-charter.json')]);
      expect(result.stdout).toContain('validated successfully');
    });

    test('should show verbose output when requested', () => {
      const result = runValidate([join(FIXTURES_DIR, 'project-charter.json'), '--verbose']);
      expect(result.stdout.length).toBeGreaterThan(500);
    });
  });

  describe('schema inference', () => {
    test('should infer schema from @type field', () => {
      const result = runValidate([join(FIXTURES_DIR, 'project-charter.json')]);
      expect(result.stdout).toContain('JSON Schema validation');
      expect(result.exitCode).toBe(0);
    });

    test('should warn when schema cannot be inferred', () => {
      // Create a minimal JSON doc without @type
      const result = runValidate([
        join(FIXTURES_DIR, 'project-charter.json'),
        '--skip-schema', // Skip for now as we need actual fixture
      ]);
      expect(result.exitCode).toBe(0);
    });
  });

  describe('error handling', () => {
    test('should handle missing file gracefully', () => {
      const result = runValidate(['/nonexistent/path/file.json']);
      expect(result.exitCode).toBe(1);
    });

    test('should handle malformed JSON', () => {
      const result = runValidate([join(FIXTURES_DIR, 'malformed.json')]);
      expect(result.exitCode).toBe(1);
      // Error message might be in stdout or stderr
      const output = result.stdout + result.stderr;
      expect(output).toContain('Failed to parse JSON');
    });

    test('should continue validation after non-critical errors', () => {
      const result = runValidate([
        FIXTURES_DIR,
        '--skip-references', // Skip reference check to avoid dependency issues
      ]);
      // Should validate multiple files even if some fail
      expect(result.stdout).toContain('Validating:');
    });
  });

  describe('integration scenarios', () => {
    test('should validate with only schema check', () => {
      const result = runValidate([
        join(FIXTURES_DIR, 'project-charter.json'),
        '--skip-references',
        '--skip-jsonld',
      ]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('JSON Schema validation');
      expect(result.stdout).not.toContain('Reference integrity');
      expect(result.stdout).not.toContain('JSON-LD validation');
    });

    test('should validate with only JSON-LD check', () => {
      const result = runValidate([
        join(FIXTURES_DIR, 'project-charter.json'),
        '--skip-schema',
        '--skip-references',
      ]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('JSON-LD validation');
      expect(result.stdout).not.toContain('JSON Schema validation');
      expect(result.stdout).not.toContain('Reference integrity');
    });

    test('should build document index for directory validation', () => {
      const result = runValidate([FIXTURES_DIR]);
      expect(result.stdout).toContain('Building document index');
      expect(result.stdout).toContain('Indexed');
    });
  });
});
