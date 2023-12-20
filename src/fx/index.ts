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
} from "starfx";
import { sleep } from "starfx";
export const delay = sleep;

export {
  timer,
  poll,
  takeEvery,
  dispatchActions,
  selectDataById,
  batchActions,
  resetLoaderById,
  selectLoaderById,
  BATCH,
  prepareStore,
  put,
  select,
  take,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
  selectLoaders,
  latest,
  leading,
  addData,
  reduxMdw,
} from "starfx/redux";
import { defaultLoaderItem } from "starfx/redux";
export const defaultLoadingItem = defaultLoaderItem;

import type { AnyState, LoaderItemState, LoaderState } from "starfx";
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
export {
  useApi,
  useQuery,
  useCache,
  useLoader,
  useLoaderSuccess,
} from "starfx/react";
