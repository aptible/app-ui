export {
  call,
  parallel,
  requestMonitor,
  createApi,
  createPipe,
  race,
  fetcher,
  Ok,
  Err,
  each,
  spawn,
  mdw,
  sleep,
  createThunks,
  log,
  timer,
  poll,
  takeEvery,
  put,
  take,
  latest,
  leading,
} from "starfx";
import { sleep } from "starfx";
export const delay = sleep;

export {
  select,
  storeMdw,
  createSelector,
  PERSIST_LOADER_ID,
  configureStore,
  createBatchMdw,
  createLocalStorageAdapter,
  createPersistor,
  persistStoreMdw,
} from "starfx/store";
export type { StoreUpdater, FxStore } from "starfx/store";
import { defaultLoaderItem } from "starfx/store";
export const defaultLoadingItem = defaultLoaderItem;

export function createAction(actionType: string): () => Action;
export function createAction<P>(
  actionType: string,
): (p: P) => ActionWithPayload<P>;
export function createAction(actionType: string) {
  const fn = (payload?: unknown) => ({
    type: actionType,
    payload,
  });
  fn.toString = () => actionType;

  return fn;
}

import { Action } from "@app/types";
import type {
  ActionWithPayload,
  AnyState,
  LoaderItemState,
  LoaderState,
} from "starfx";
export type LoadingState<M extends AnyState = AnyState> = Omit<
  LoaderState<M>,
  "id"
>;
export type LoadingItemState<M extends AnyState = AnyState> = Omit<
  LoaderItemState<M>,
  "id"
>;

export type {
  Next,
  CreateActionWithPayload,
  LoaderCtx,
  ThunkCtx,
  FetchJson,
  Payload,
  Action,
  Result,
  Operation,
} from "starfx";
