export {
  call,
  parallel,
  createApi,
  createPipe,
  race,
  Ok,
  Err,
  each,
  spawn,
  mdw,
  sleep,
  createThunks,
  timer,
  poll,
  takeEvery,
  put,
  take,
  takeLeading,
  takeLatest,
  API_ACTION_PREFIX,
  select,
  createSelector,
  PERSIST_LOADER_ID,
  configureStore,
  createBatchMdw,
  createLocalStorageAdapter,
  createPersistor,
  persistStoreMdw,
  StoreContext,
  clearTimers,
} from "starfx";
export type { Callable, StoreUpdater, FxStore } from "starfx";
import { defaultLoaderItem, sleep } from "starfx";
export const delay = sleep;
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
