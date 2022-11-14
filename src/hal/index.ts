import { Next, select } from "saga-query";

import { createAssign, createReducerMap } from "@app/slice-helpers";
import type {
  Action,
  AppState,
  EmbeddedMap,
  EntityMap,
  IdEntity,
  NestedEntity,
  MapEntity,
  HalEmbedded,
} from "@app/types";
import type { DeployApiCtx } from "@app/api";

/* const uuidRe = new RegExp(
  /([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})/,
); */

export function extractIdFromLink(relation: { href: string } | null) {
  if (!relation?.href) {
    return "";
  }
  /* const exec = uuidRe.exec(url);
  if (!exec) return '';
  return exec[0] || ''; */
  const segments = relation.href.split("/");
  return segments[segments.length - 1];
}

export const ENTITIES_NAME = "entities";
const entities = createAssign<EntityMap>({
  name: ENTITIES_NAME,
  initialState: {},
});
export const reducers = createReducerMap(entities);
const selectEntities = (state: AppState) => state[ENTITIES_NAME] || {};

export function defaultEntity<E = any>(e: EmbeddedMap<E>): EmbeddedMap<E> {
  return e;
}

export function* halEntityParser(
  ctx: DeployApiCtx<HalEmbedded<{ [key: string]: any }>>,
  next: Next,
) {
  yield next();

  if (!ctx.json.ok) {
    return;
  }

  const entityMap: EntityMap = yield select(selectEntities);
  const { data } = ctx.json;

  const actions: Action<any>[] = [];
  const store: { [key: string]: IdEntity[] } = {};

  const parser = (
    entity?: NestedEntity | HalEmbedded<{ [key: string]: any }>,
  ) => {
    if (!entity) {
      return;
    }

    if (entity._type) {
      const identified = entityMap[entity._type];
      if (identified) {
        if (!store[identified.id]) {
          store[identified.id] = [];
        }
        store[identified.id].push(identified.deserialize(entity));
      }
    }

    if (!entity._embedded) {
      return;
    }

    Object.values(entity._embedded).forEach((value) => {
      if (Array.isArray(value)) {
        value.forEach(parser);
      } else {
        parser(value);
      }
    });
  };

  parser(data);

  Object.keys(store).forEach((key) => {
    const entity = entityMap[key];
    if (!entity) {
      return;
    }

    const storeData = store[key];
    if (storeData.length === 0) {
      return;
    }

    const dataObj = storeData.reduce<MapEntity<any>>((acc, em) => {
      acc[em.id] = em;
      return acc;
    }, {});

    actions.push(entity.save(dataObj));
  });

  if (actions.length > 0) {
    ctx.actions.push(...actions);
  }
}
