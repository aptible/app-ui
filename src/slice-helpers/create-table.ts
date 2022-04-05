import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';

import { MapEntity, ActionWithPayload, excludesFalse } from '@app/types';

interface AnyState {
  [name: string]: any;
}

export interface PatchEntity<T> {
  [key: string]: Partial<T[keyof T]>;
}

export interface PropId {
  id: string;
}

export interface PropIds {
  ids: string[];
}

export interface TableSelectors<Entity extends AnyState = AnyState, S = any> {
  findById: (d: MapEntity<Entity>, { id }: PropId) => Entity | undefined;
  findByIds: (d: MapEntity<Entity>, { ids }: PropIds) => Entity[];
  tableAsList: (d: MapEntity<Entity>) => Entity[];
  selectTable: (s: S) => MapEntity<Entity>;
  selectTableAsList: (state: S) => Entity[];
  selectById: (s: S, p: PropId) => Entity | undefined;
  selectByIds: (s: S, p: { ids: string[] }) => Entity[];
}

function tableSelectors<Entity extends AnyState = AnyState, S = any>(
  selectTable: (s: S) => MapEntity<Entity>,
): TableSelectors<Entity, S> {
  const tableAsList = (data: MapEntity<Entity>): Entity[] =>
    Object.values(data).filter(excludesFalse);
  const findById = (data: MapEntity<Entity>, { id }: PropId) => data[id];
  const findByIds = (data: MapEntity<Entity>, { ids }: PropIds): Entity[] =>
    ids.map((id) => data[id]).filter(excludesFalse);
  const selectById = (state: S, { id }: PropId): Entity | undefined => {
    const data = selectTable(state);
    return findById(data, { id });
  };
  const selectTableAsList: any = createSelector(selectTable, (data): Entity[] =>
    tableAsList(data),
  );
  const selectByIds: any = createSelector(
    selectTable,
    (_: S, p: PropIds) => p,
    findByIds,
  );

  return {
    findById,
    findByIds,
    tableAsList,
    selectTable,
    selectTableAsList,
    selectById,
    selectByIds,
  };
}

export function createTable<Entity extends AnyState = AnyState>({
  name,
  initialState = {},
}: {
  name: string;
  initialState?: MapEntity<Entity>;
}) {
  const slice = createSlice({
    name,
    initialState,
    reducers: {
      add: (state, action: ActionWithPayload<MapEntity<Entity>>) => {
        Object.keys(action.payload).forEach((key) => {
          (state as any)[key] = action.payload[key];
        });
      },
      set: (_, action: ActionWithPayload<MapEntity<Entity>>) => action.payload,
      remove: (state, action: ActionWithPayload<string[]>) => {
        action.payload.forEach((key) => {
          delete state[key];
        });
      },
      reset: () => initialState,
      patch: (
        state,
        action: ActionWithPayload<{
          [key: string]: Partial<MapEntity<Entity>[keyof MapEntity<Entity>]>;
        }>,
      ) => {
        Object.keys(action.payload).forEach((id) => {
          if (typeof action.payload[id] !== 'object') {
            return;
          }

          const entity = action.payload[id];
          if (entity) {
            // getting weird issue with typing here
            const s: any = state;
            const nextEntity = { ...s[id] };
            Object.keys(entity).forEach((key) => {
              if (s.hasOwnProperty(id)) {
                nextEntity[key] = (action.payload[id] as any)[key];
              }
            });
            (state as any)[id] = nextEntity;
          }
        });
      },
      merge: (
        state,
        action: ActionWithPayload<{
          [key: string]: Partial<MapEntity<Entity>[keyof MapEntity<Entity>]>;
        }>,
      ) => {
        Object.keys(action.payload).forEach((id) => {
          if (typeof action.payload[id] !== 'object') {
            return;
          }

          const entity = action.payload[id];
          if (entity) {
            // getting weird issue with typing here
            const s: any = state;
            if (!s.hasOwnProperty(id)) {
              return;
            }

            const nextEntity = { ...s[id] };
            Object.keys(entity).forEach((key) => {
              const prop = (action.payload[id] as any)[key];
              if (Array.isArray(nextEntity[key])) {
                nextEntity[key] = [...nextEntity[key], ...prop];
              } else if (Object == prop.constructor) {
                nextEntity[key] = {
                  ...nextEntity[key],
                  ...prop,
                };
              } else {
                nextEntity[key] = prop;
              }
            });
            (state as any)[id] = nextEntity;
          }
        });
      },
    },
  });

  return {
    ...slice,
    getSelectors: <S>(stateFn: (s: S) => MapEntity<Entity>) =>
      tableSelectors(stateFn),
  };
}
