import { select } from 'redux-saga/effects';
import { MapEntity, createAssign, Action, createReducerMap } from 'robodux';
import { Next, FetchCtx } from 'saga-query';

import {
  AppState,
  EmbeddedMap,
  EntityMap,
  IdEntity,
  NestedEntity,
} from '@app/types';

export const ENTITIES_NAME = 'entities';
const entities = createAssign<EntityMap>({
  name: ENTITIES_NAME,
  initialState: {},
});
export const reducers = createReducerMap(entities);
const selectEntities = (state: AppState) => state[ENTITIES_NAME] || {};

export function defaultEntity<E = any>(e: EmbeddedMap<E>): EmbeddedMap<E> {
  return e;
}

export function* halEntityParser(ctx: FetchCtx, next: Next) {
  yield next();

  if (!ctx.response.ok) return;

  const entityMap: EntityMap = yield select(selectEntities);
  const { data } = ctx.response;

  const actions: Action<any>[] = [];
  const store: { [key: string]: IdEntity[] } = {};

  const parser = (entity?: NestedEntity) => {
    if (!entity) return;
    const identified = entityMap[entity._type];
    if (identified) {
      if (!store[identified.id]) store[identified.id] = [];
      store[identified.id].push(identified.deserialize(entity));
    }

    if (!entity._embedded) return;
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
    if (!entity) return;

    const storeData = store[key];
    if (storeData.length === 0) return;

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
