/**
 * @ukiyoue/semantics
 *
 * Provides JSON-LD contexts and vocabularies for Ukiyoue framework.
 *
 * Usage:
 *   import { getContextPath } from '@ukiyoue/semantics';
 *   const contextPath = getContextPath('layer1');
 */

import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get the absolute path to a context file
 * @param {string} layer - Layer name (e.g., 'layer1', 'layer2')
 * @returns {string} Absolute path to the context file
 */
export function getContextPath(layer) {
  return join(__dirname, "context", `${layer}.jsonld`);
}

/**
 * Get the absolute path to a vocabulary file
 * @param {string} name - Vocabulary name
 * @returns {string} Absolute path to the vocabulary file
 */
export function getVocabularyPath(name) {
  return join(__dirname, "vocabularies", `${name}.jsonld`);
}

/**
 * Get the semantics directory path
 * @returns {string} Absolute path to semantics directory
 */
export function getSemanticsDir() {
  return __dirname;
}

export default {
  getContextPath,
  getVocabularyPath,
  getSemanticsDir,
};
