/**
 * @ukiyoue/schemas
 *
 * Provides JSON Schema definitions for Ukiyoue framework artifacts.
 *
 * Usage:
 *   import { getSchemaPath } from '@ukiyoue/schemas';
 *   const schemaPath = getSchemaPath('layer1', 'project-charter');
 */

import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get the absolute path to a schema file
 * @param {string} layer - Layer name (e.g., 'layer1', 'layer2')
 * @param {string} artifact - Artifact name (e.g., 'project-charter')
 * @returns {string} Absolute path to the schema file
 */
export function getSchemaPath(layer, artifact) {
  return join(__dirname, layer, `${artifact}.json`);
}

/**
 * Get the absolute path to the common definitions
 * @returns {string} Absolute path to _common.json
 */
export function getCommonSchemaPath() {
  return join(__dirname, "_common.json");
}

/**
 * Get the schemas directory path
 * @returns {string} Absolute path to schemas directory
 */
export function getSchemasDir() {
  return __dirname;
}

export default {
  getSchemaPath,
  getCommonSchemaPath,
  getSchemasDir,
};
