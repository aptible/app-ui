import type { AnyState, IdProp } from "starfx";
import type { MapEntity } from "./helpers";

export interface LinkResponse {
  href: string;
}

export interface HalEmbedded<E> {
  _embedded: E;
  _links: { [key: string]: LinkResponse };

  _type?: string;
  total_count?: number;
  per_page?: number;
  current_page?: number;
}

/* interface Action<P> {
  type: string;
  payload?: P;
} */

export interface EmbeddedMap<E = any> {
  id: string;
  save: (p: Record<IdProp, E>) => (s: AnyState) => void; //Action<MapEntity<E>>;
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
