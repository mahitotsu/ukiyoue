import { SemanticEngine } from "../../tools/core/dist/index.js";

const engine = new SemanticEngine();
const results = await engine.validateDirectory("documents");

console.log("=== Validation Results ===\n");

for (const [file, result] of results) {
  const filename = file.split("/").pop();
  console.log(`📄 ${filename}:`);
  console.log(`  Status: ${result.valid ? "✅ Valid" : "❌ Invalid"}`);

  if (result.errors && result.errors.length > 0) {
    console.log(`  Errors (${result.errors.length}):`);
    result.errors.forEach((err, i) => {
      console.log(`    ${i + 1}. [${err.severity}] ${err.path}`);
      console.log(`       ${err.message}`);
      if (err.focusNode) {
        console.log(`       Focus: ${err.focusNode}`);
      }
    });
  }
  console.log("");
}
