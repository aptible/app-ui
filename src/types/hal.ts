import type { MapEntity } from './helpers';

export type LinkResponse = {
  href: string;
} | null;

export interface HalEmbedded<E> {
  _embedded: E;
  _links: { [key: string]: LinkResponse };
}

interface Action<P> {
  type: string;
  payload?: P;
}

export interface EmbeddedMap<E = any> {
  id: string;
  save: (p: MapEntity<E>) => Action<MapEntity<E>>;
  deserialize: (...args: any[]) => E;
}

export interface EntityMap {
  [key: string]: EmbeddedMap;
}

export interface NestedEntity {
  _type: string;
  _embedded?: MapEntity<NestedEntity[]>;
}

export interface IdEntity {
  id: string;
}
