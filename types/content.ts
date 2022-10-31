import { HashCarouselData } from '../stores/carousel';

export interface Versioned {
  version: number;
}

export interface CollectionContentMetadata extends Versioned {
  version: 0.01;
  id: string;
  title: string;
  description: string;
  link: string;
  data: AnnotatedHash[];
  // blocks: CollectionBlockMetadata[];
}

export interface AnnotatedHash extends HashCarouselData {}

export type CollectionBlockType = 'hero' | 'dynamic-grid' | 'credits' | 'empty';

export interface CollectionBlockMetadata {
  type: CollectionBlockType;
  hashes: AnnotatedHash[];
  title: string;
  description: string;
  id: string;
}

export interface DynamicGridBlockMetadata extends CollectionBlockMetadata {
  type: 'dynamic-grid';
}

export interface CreditsBlockMetadata extends CollectionBlockMetadata {
  type: 'credits';
  account: string;
}

export interface EmptyBlockMetadata extends CollectionBlockMetadata {
  type: 'empty';
}

export interface HeroBlockMetadata extends CollectionBlockMetadata {
  type: 'hero';
}
