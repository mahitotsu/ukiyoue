# Ukiyoue Framework - Architecture

**フレームワークのアーキテクチャ設計**

---

## 🎯 このドキュメントの目的

Ukiyoue フレームワークの全体アーキテクチャと、各コンポーネントの設計を定義します。

**対象読者**: フレームワーク開発者、貢献者  
**使用場面**: 実装開始前、設計レビュー時、新規コンポーネント追加時

**技術基盤**:

- データフォーマット: JSON + JSON Schema Draft-07 + JSON-LD 1.1（[ADR-001](design-decisions/001-data-format-and-schema.md)）
- 実装言語: TypeScript + Bun（[ADR-004](design-decisions/004-tool-implementation-language.md)）

---

## 🏗️ 全体アーキテクチャ

### 技術選定の根拠

各層の技術選定の詳細な根拠は、以下の設計判断記録（ADR）を参照してください：

- [ADR-001: データフォーマット・スキーマ定義・セマンティック定義の選定](design-decisions/001-data-format-and-schema.md) - JSON + JSON Schema + JSON-LD 採用
- [ADR-002: JSON Schema Draft 版の選定](design-decisions/002-json-schema-draft-version.md) - Draft-07 採用の根拠
- [ADR-003: JSON-LD バージョンの選定](design-decisions/003-json-ld-version.md) - JSON-LD 1.1 採用の根拠
- [ADR-004: ツール実装言語とランタイムの選定](design-decisions/004-tool-implementation-language.md) - TypeScript + Bun 採用の根拠

### 4 層アーキテクチャ

```
┌─────────────────────────────────────────────────────┐
│                   Tools Layer                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │Validator │ │Generator │ │Analyzer  │ │  CLI   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│               Semantics Layer                        │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │
│  │  JSON-LD     │ │ Vocabularies │ │ Ontologies  │ │
│  │  Context     │ │              │ │             │ │
│  └──────────────┘ └──────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│                 Schema Layer                         │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │
│  │ JSON Schema  │ │ Document     │ │ Component   │ │
│  │ Base         │ │ Types        │ │ Schemas     │ │
│  └──────────────┘ └──────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│                   Data Layer                         │
│          JSON Documents (User Content)               │
└─────────────────────────────────────────────────────┘
```

### 各層の責務

| 層                  | 責務                           | 技術                 | 選定根拠         |
| ------------------- | ------------------------------ | -------------------- | ---------------- |
| **Data Layer**      | ドキュメントの実際の内容を保持 | JSON                 | ADR-001          |
| **Schema Layer**    | 構造の形式的定義と検証ルール   | JSON Schema Draft-07 | ADR-001, ADR-002 |
| **Semantics Layer** | 意味・関係性の定義             | JSON-LD 1.1          | ADR-001, ADR-003 |
| **Tools Layer**     | 自動化ツールの提供             | TypeScript + Bun     | ADR-004          |

**技術選定の詳細**:

- **JSON Schema Draft-07**: 最大のツールサポート、安定性、ajv 完全対応（[ADR-002](design-decisions/002-json-schema-draft-version.md)）
- **JSON-LD 1.1**: W3C 最新勧告、nested context/`@protected`等の新機能（[ADR-003](design-decisions/003-json-ld-version.md)）
- **TypeScript + Bun**: 最速起動（~20ms）、ajv/jsonld.js 最適サポート（[ADR-004](design-decisions/004-tool-implementation-language.md)）

---

## 📦 コンポーネント構成

### 1. Schema Layer

#### 1.1 document-base.schema.json

**役割**: 全ドキュメント共通の基底スキーマ

**構造**:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://ukiyoue.dev/schemas/document-base.schema.json",
  "title": "Document Base Schema",
  "type": "object",
  "required": ["$schema", "@context", "metadata", "content"],
  "properties": {
    "$schema": {
      "type": "string",
      "description": "JSON Schema reference"
    },
    "@context": {
      "type": "string",
      "description": "JSON-LD context reference"
    },
    "metadata": {
      "$ref": "#/definitions/metadata"
    },
    "content": {
      "type": "object",
      "description": "Document content"
    }
  },
  "definitions": {
    "metadata": {
      "type": "object",
      "required": ["type", "title", "version", "created", "updated"],
      "properties": {
        "type": { "type": "string" },
        "title": { "type": "string" },
        "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
        "created": { "type": "string", "format": "date-time" },
        "updated": { "type": "string", "format": "date-time" },
        "authors": {
          "type": "array",
          "items": { "$ref": "#/definitions/author" }
        },
        "tags": {
          "type": "array",
          "items": { "type": "string" }
        },
        "audience": {
          "type": "array",
          "items": {
            "enum": ["developer", "pm", "stakeholder", "ai-agent"]
          }
        }
      }
    },
    "author": {
      "type": "object",
      "required": ["name"],
      "properties": {
        "name": { "type": "string" },
        "email": { "type": "string", "format": "email" },
        "url": { "type": "string", "format": "uri" }
      }
    }
  }
}
```

#### 1.2 types/\*.schema.json

**役割**: ドキュメントタイプ別の特化スキーマ

**例: technical-spec.schema.json**:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://ukiyoue.dev/schemas/types/technical-spec.schema.json",
  "title": "Technical Specification Schema",
  "allOf": [{ "$ref": "../document-base.schema.json" }],
  "properties": {
    "metadata": {
      "properties": {
        "type": { "const": "technical-specification" }
      }
    },
    "content": {
      "type": "object",
      "required": ["overview", "requirements", "design"],
      "properties": {
        "overview": { "type": "string" },
        "requirements": {
          "type": "array",
          "items": { "$ref": "#/definitions/requirement" }
        },
        "design": {
          "type": "object",
          "properties": {
            "architecture": { "type": "string" },
            "components": { "type": "array" },
            "dataModel": { "type": "object" }
          }
        },
        "implementation": {
          "type": "object",
          "properties": {
            "approach": { "type": "string" },
            "technologies": { "type": "array" },
            "considerations": { "type": "string" }
          }
        }
      }
    }
  },
  "definitions": {
    "requirement": {
      "type": "object",
      "required": ["id", "description"],
      "properties": {
        "id": { "type": "string" },
        "description": { "type": "string" },
        "priority": {
          "enum": ["critical", "high", "medium", "low"]
        },
        "status": {
          "enum": ["draft", "approved", "implemented", "deprecated"]
        }
      }
    }
  }
}
```

---

### 2. Semantics Layer

#### 2.1 context.jsonld

**役割**: 基本的な JSON-LD コンテキストの定義

**構造**:

```json
{
  "@context": {
    "@version": 1.1,
    "@vocab": "http://schema.org/",
    "ukiyoue": "https://ukiyoue.dev/vocab#",

    "Document": "ukiyoue:Document",
    "Component": "ukiyoue:Component",

    "dependsOn": {
      "@id": "ukiyoue:dependsOn",
      "@type": "@id",
      "@container": "@set"
    },
    "relatedTo": {
      "@id": "ukiyoue:relatedTo",
      "@type": "@id",
      "@container": "@set"
    },
    "implements": {
      "@id": "ukiyoue:implements",
      "@type": "@id"
    },
    "supersedes": {
      "@id": "ukiyoue:supersedes",
      "@type": "@id"
    },

    "author": {
      "@id": "http://schema.org/author",
      "@type": "@id"
    },
    "created": {
      "@id": "http://schema.org/dateCreated",
      "@type": "http://www.w3.org/2001/XMLSchema#dateTime"
    },
    "updated": {
      "@id": "http://schema.org/dateModified",
      "@type": "http://www.w3.org/2001/XMLSchema#dateTime"
    },

    "tags": {
      "@id": "http://schema.org/keywords",
      "@container": "@set"
    },
    "audience": {
      "@id": "http://schema.org/audience",
      "@container": "@set"
    }
  }
}
```

#### 2.2 vocabularies/document.jsonld

**役割**: ドキュメント関連の語彙定義

```json
{
  "@context": "https://ukiyoue.dev/context.jsonld",
  "@graph": [
    {
      "@id": "ukiyoue:Document",
      "@type": "rdfs:Class",
      "rdfs:label": "Document",
      "rdfs:comment": "Base class for all documentation"
    },
    {
      "@id": "ukiyoue:TechnicalSpecification",
      "@type": "rdfs:Class",
      "rdfs:subClassOf": "ukiyoue:Document",
      "rdfs:label": "Technical Specification",
      "rdfs:comment": "A technical specification document"
    },
    {
      "@id": "ukiyoue:APIDocumentation",
      "@type": "rdfs:Class",
      "rdfs:subClassOf": "ukiyoue:Document",
      "rdfs:label": "API Documentation"
    },
    {
      "@id": "ukiyoue:dependsOn",
      "@type": "rdf:Property",
      "rdfs:label": "depends on",
      "rdfs:comment": "Indicates a dependency relationship",
      "rdfs:domain": "ukiyoue:Document",
      "rdfs:range": "ukiyoue:Document"
    }
  ]
}
```

---

### 3. Tools Layer

#### 3.1 アーキテクチャパターン

**採用パターン**: Plugin Architecture

```
┌─────────────────────────────────────┐
│          Core Framework             │
│  ┌───────────────────────────────┐  │
│  │    Configuration Manager      │  │
│  ├───────────────────────────────┤  │
│  │      Schema Loader            │  │
│  ├───────────────────────────────┤  │
│  │   JSON-LD Processor           │  │
│  ├───────────────────────────────┤  │
│  │      Plugin Manager           │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
           ↕          ↕          ↕
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │Validator │ │Generator │ │Analyzer  │
    │ Plugin   │ │  Plugin  │ │  Plugin  │
    └──────────┘ └──────────┘ └──────────┘
```

#### 3.2 コアモジュール

##### ConfigurationManager

```typescript
class ConfigurationManager {
  private config: UkiyoueConfig;

  constructor(configPath?: string) {
    this.config = this.loadConfig(configPath);
  }

  get schemaPath(): string {
    return this.config.schemas.basePath;
  }

  get semanticsPath(): string {
    return this.config.semantics.contextPath;
  }

  // ... other getters
}
```

##### SchemaLoader

```typescript
class SchemaLoader {
  private cache: Map<string, JSONSchema>;

  async loadSchema(schemaId: string): Promise<JSONSchema> {
    if (this.cache.has(schemaId)) {
      return this.cache.get(schemaId)!;
    }

    const schema = await this.fetchSchema(schemaId);
    this.cache.set(schemaId, schema);
    return schema;
  }

  async resolveRef(ref: string): Promise<JSONSchema> {
    // $ref の解決
  }
}
```

##### JSONLDProcessor

#### 3.2 JSON-LD Processor

```typescript
import * as jsonld from "jsonld";

// JSON-LD 1.1 完全対応（ADR-003）
class JSONLDProcessor {
  async expand(document: any): Promise<any> {
    return jsonld.expand(document);
  }

  async compact(document: any, context: any): Promise<any> {
    return jsonld.compact(document, context);
  }

  async frame(document: any, frame: any): Promise<any> {
    return jsonld.frame(document, frame);
  }

  async normalize(document: any): Promise<string> {
    // RDF正規化（JSON-LD 1.1機能）
    return jsonld.normalize(document, {
      algorithm: "URDNA2015",
      format: "application/n-quads",
    });
  }
}
```

#### 3.3 プラグイン

##### Validator Plugin

```typescript
interface ValidatorPlugin {
  name: string;
  validate(document: any): Promise<ValidationResult>;
}

class SchemaValidator implements ValidatorPlugin {
  name = "schema-validator";

  async validate(document: any): Promise<ValidationResult> {
    // ajv v8+ を使用（Draft-07完全対応、ADR-002/004）
    const ajv = new Ajv({ allErrors: true, strict: true });
    const schema = await this.loadSchema(document.$schema);
    const valid = ajv.validate(schema, document);

    return {
      valid,
      errors: ajv.errors || [],
    };
  }
}

class LinkChecker implements ValidatorPlugin {
  name = "link-checker";

  async validate(document: any): Promise<ValidationResult> {
    const links = this.extractLinks(document);
    const results = await Promise.all(
      links.map((link) => this.checkLink(link))
    );

    return {
      valid: results.every((r) => r.valid),
      errors: results.filter((r) => !r.valid),
    };
  }
}
```

##### Generator Plugin

```typescript
interface GeneratorPlugin {
  name: string;
  generate(template: string, data: any): Promise<any>;
}

class TemplateGenerator implements GeneratorPlugin {
  name = "template-generator";

  async generate(template: string, data: any): Promise<any> {
    const templateContent = await this.loadTemplate(template);
    const compiled = Handlebars.compile(templateContent);
    return JSON.parse(compiled(data));
  }
}
```

##### Analyzer Plugin

```typescript
interface AnalyzerPlugin {
  name: string;
  analyze(document: any): Promise<AnalysisResult>;
}

class QualityAnalyzer implements AnalyzerPlugin {
  name = 'quality-analyzer';

  async analyze(document: any): Promise<AnalysisResult> {
    const completeness = this.checkCompleteness(document);
    const consistency = this.checkConsistency(document);
    const freshness = this.checkFreshness(document);

    return {
      score: this.calculateScore(completeness, consistency, freshness),
      metrics: { completeness, consistency, freshness },
      suggestions: this.generateSuggestions(...)
    };
  }
}
```

---

## 🔌 プラグインインターフェース

### Plugin Registration

```typescript
class PluginManager {
  private plugins: Map<string, Plugin[]> = new Map();

  register(type: PluginType, plugin: Plugin): void {
    if (!this.plugins.has(type)) {
      this.plugins.set(type, []);
    }
    this.plugins.get(type)!.push(plugin);
  }

  async execute(
    type: PluginType,
    method: string,
    ...args: any[]
  ): Promise<any[]> {
    const plugins = this.plugins.get(type) || [];
    return Promise.all(plugins.map((plugin) => plugin[method](...args)));
  }
}
```

### Plugin Configuration

```yaml
# .ukiyoue/config.yml
plugins:
  validators:
    - name: schema-validator
      enabled: true
    - name: link-checker
      enabled: true
      options:
        timeout: 5000
    - name: consistency-checker
      enabled: true
      dictionary: .ukiyoue/dictionary.yml

  generators:
    - name: template-generator
      enabled: true
      templatesPath: templates/

  analyzers:
    - name: quality-analyzer
      enabled: true
    - name: impact-analyzer
      enabled: false
```

---

## 📂 ディレクトリ構造

```
ukiyoue/
├── src/
│   ├── core/
│   │   ├── ConfigurationManager.ts
│   │   ├── SchemaLoader.ts
│   │   ├── JSONLDProcessor.ts
│   │   └── PluginManager.ts
│   ├── plugins/
│   │   ├── validators/
│   │   │   ├── SchemaValidator.ts
│   │   │   ├── LinkChecker.ts
│   │   │   └── ConsistencyChecker.ts
│   │   ├── generators/
│   │   │   └── TemplateGenerator.ts
│   │   └── analyzers/
│   │       ├── QualityAnalyzer.ts
│   │       └── ImpactAnalyzer.ts
│   ├── cli/
│   │   ├── commands/
│   │   │   ├── validate.ts
│   │   │   ├── generate.ts
│   │   │   ├── analyze.ts
│   │   │   └── search.ts
│   │   └── index.ts
│   └── utils/
│       ├── logger.ts
│       ├── fileHelper.ts
│       └── jsonHelper.ts
├── schemas/
├── semantics/
├── examples/
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## 🔄 データフロー

### Validation Flow

```
Input Document (JSON)
    ↓
SchemaLoader
    ↓ (load schema)
SchemaValidator
    ↓ (validate structure)
LinkChecker
    ↓ (check links)
ConsistencyChecker
    ↓ (check consistency)
Validation Result
```

### Generation Flow

```
Template + Data
    ↓
TemplateGenerator
    ↓ (expand template)
Generated Document
    ↓ (auto-validate)
SchemaValidator
    ↓
Final Document
```

### Analysis Flow

```
Input Document
    ↓
JSONLDProcessor
    ↓ (expand to RDF)
SemanticAnalyzer
    ↓ (analyze relationships)
QualityAnalyzer
    ↓ (calculate metrics)
Analysis Result
```

---

## 🔒 セキュリティ考慮事項

### Input Validation

```typescript
class SecurityValidator {
  validateInput(input: any): void {
    // JSONスキーマのサイズチェック
    if (JSON.stringify(input).length > MAX_SIZE) {
      throw new Error("Input too large");
    }

    // 循環参照のチェック
    if (this.hasCircularRef(input)) {
      throw new Error("Circular reference detected");
    }

    // 危険なパスのチェック
    if (this.hasDangerousPath(input)) {
      throw new Error("Dangerous path detected");
    }
  }
}
```

### File Access Control

```typescript
class FileAccessControl {
  isAllowed(path: string): boolean {
    // ワークスペース外のアクセスを禁止
    const normalized = path.resolve(path);
    return normalized.startsWith(this.workspaceRoot);
  }
}
```

---

## 📊 パフォーマンス最適化

### キャッシング戦略

```typescript
class CacheManager {
  private schemaCache: LRUCache<string, JSONSchema>;
  private contextCache: LRUCache<string, any>;

  constructor() {
    this.schemaCache = new LRUCache({ max: 100 });
    this.contextCache = new LRUCache({ max: 50 });
  }

  async getSchema(id: string): Promise<JSONSchema> {
    if (this.schemaCache.has(id)) {
      return this.schemaCache.get(id)!;
    }

    const schema = await this.loadSchema(id);
    this.schemaCache.set(id, schema);
    return schema;
  }
}
```

### 並列処理

```typescript
class ParallelValidator {
  async validateAll(documents: any[]): Promise<ValidationResult[]> {
    // 並列実行（最大同時実行数: 10）
    const pool = new PromisePool(10);
    return pool.map(documents, (doc) => this.validate(doc));
  }
}
```

---

## 📚 Related Documents

- [`concept.md`](concept.md) - コンセプトと背景
- [`requirements.md`](requirements.md) - フレームワーク要件（FR-CONV/AUTO/REUSE）
- [`design-decisions/`](design-decisions/) - 技術選定の意思決定記録（ADR）
  - [ADR-001: データフォーマット選定](design-decisions/001-data-format-and-schema.md)
  - [ADR-002: JSON Schema Draft-07 選定](design-decisions/002-json-schema-draft-version.md)
  - [ADR-003: JSON-LD 1.1 選定](design-decisions/003-json-ld-version.md)
  - [ADR-004: TypeScript + Bun 選定](design-decisions/004-tool-implementation-language.md)
