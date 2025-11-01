import { SemanticEngine } from "../../tools/core/dist/index.js";

const engine = new SemanticEngine();
const results = await engine.validateDirectory("documents");

console.log("Total files:", results.size);

for (const [file, result] of results) {
  console.log(file, ":", result.valid ? "✅" : "❌", result.errors?.length || 0, "errors");

  if (!result.valid && result.errors && result.errors.length > 0) {
    console.log("  First error:", result.errors[0].message);
  }
}
