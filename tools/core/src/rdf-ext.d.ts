declare module 'rdf-ext' {
  import type * as RDF from '@rdfjs/types';

  interface DataFactory extends RDF.DataFactory {
    dataset(quads?: RDF.Quad[]): RDF.DatasetCore;
  }

  const factory: DataFactory;
  export default factory;
}
