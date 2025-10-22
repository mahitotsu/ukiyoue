/**
 * Type definitions for jsonld v8.3.x
 * Minimal type definitions for Ukiyoue framework usage
 */

declare module 'jsonld' {
  export interface NodeObject {
    '@id'?: string;
    '@type'?: string | string[];
    [key: string]: unknown;
  }

  export interface RemoteDocument {
    contextUrl?: string;
    document: unknown;
    documentUrl: string;
  }

  export type DocumentLoader = (url: string) => Promise<RemoteDocument>;

  export interface ExpandOptions {
    documentLoader?: DocumentLoader;
    processingMode?: 'json-ld-1.0' | 'json-ld-1.1';
    base?: string;
    expandContext?: unknown;
  }

  export interface CompactOptions {
    documentLoader?: DocumentLoader;
    processingMode?: 'json-ld-1.0' | 'json-ld-1.1';
    base?: string;
    compactToRelative?: boolean;
  }

  export interface FlattenOptions {
    documentLoader?: DocumentLoader;
    processingMode?: 'json-ld-1.0' | 'json-ld-1.1';
    base?: string;
  }

  export function expand(input: unknown, options?: ExpandOptions): Promise<NodeObject[]>;

  export function compact(
    input: unknown,
    context: unknown,
    options?: CompactOptions
  ): Promise<NodeObject>;

  export function flatten(input: unknown, options?: FlattenOptions): Promise<NodeObject[]>;
}
