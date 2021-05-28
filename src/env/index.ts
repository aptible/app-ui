import { createAssign, createReducerMap } from 'robodux';
import { AppState, Env } from '@app/types';

const isProduction = import.meta.env.PROD;
const isDev = import.meta.env.DEV;
export const createEnv = (e: Partial<Env> = {}): Env => {
  return {
    isProduction,
    isDev,
    authUrl: import.meta.env.REACT_APP_APTIBLE_AUTH_ROOT_URL,
    billingUrl: import.meta.env.REACT_APP_BILLING_ROOT_URL,
    apiUrl: import.meta.env.REACT_APP_API_ROOT_URL,
    ...e,
  };
};

export const ENV_NAME = 'env';
const env = createAssign<Env>({
  name: ENV_NAME,
  initialState: createEnv(),
});

export const { set: setEnv, reset: resetEnv } = env.actions;
export const reducers = createReducerMap(env);
export const selectEnv = (state: AppState) => state[ENV_NAME];
