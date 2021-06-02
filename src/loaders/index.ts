import { createLoader, createLoaderTable, createReducerMap } from 'robodux';

import { AppState, AuthLoader, AuthLoaderMessage } from '@app/types';

export enum Loaders {
  Auth = 'auth',
}

export const LOADERS_NAME = 'loaders';
const loaders = createLoaderTable({ name: LOADERS_NAME });
export const { selectById: selectLoaderById } = loaders.getSelectors(
  (s: AppState) => s[LOADERS_NAME],
);

const AUTH_LOADER_NAME = 'authLoader';

export const defaultAuthLoader = (): AuthLoader => ({
  loading: false,
  success: false,
  error: false,
  message: {
    error: '',
    message: '',
  },
  lastRun: 0,
  lastSuccess: 0,
  meta: {},
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
  state[AUTH_LOADER_NAME] || defaultAuthLoader();

export const selectAuthLoaderMessage = (state: AppState) => {
  const curLoader = selectAuthLoader(state);
  const { message } = curLoader;
  return message || { error: '', message: '' };
};
