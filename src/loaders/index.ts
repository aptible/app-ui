import {
  createLoader,
  createLoaderTable,
  createReducerMap,
  defaultLoader,
} from 'robodux';

import { AppState, AuthLoader, AuthLoaderMessage } from '@app/types';

export const LOADERS_NAME = 'loaders';
export const loaders = createLoaderTable({ name: LOADERS_NAME });
export const { selectById: selectLoaderById } = loaders.getSelectors(
  (s: AppState) => s[LOADERS_NAME] || {},
);

const AUTH_LOADER_NAME = 'authLoader';

export const defaultAuthLoader = (): AuthLoader => ({
  status: 'idle',
  message: '',
  lastRun: 0,
  lastSuccess: 0,
  meta: {
    error: '',
    code: 0,
    exception_context: {},
  },
});
const authLoader = createLoader<AuthLoaderMessage>({
  name: AUTH_LOADER_NAME,
  initialState: defaultAuthLoader(),
});
export const {
  loading: setAuthLoaderStart,
  error: setAuthLoaderError,
  success: setAuthLoaderSuccess,
  reset: resetAuthLoader,
} = authLoader.actions;

export const reducers = createReducerMap(loaders, authLoader);

export const selectAuthLoader = (state: AppState) =>
  defaultLoader(state[AUTH_LOADER_NAME]) || defaultLoader(defaultAuthLoader());

export const selectAuthLoaderMessage = (state: AppState) => {
  const curLoader = selectAuthLoader(state);
  const { message } = curLoader;
  return message || { error: '', message: '', code: 0, exception_context: {} };
};
