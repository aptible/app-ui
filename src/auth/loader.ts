import { selectLoaderById } from 'saga-query';
import type { LoadingState } from 'saga-query';

import type { AppState, AuthLoader, AuthLoaderMessage } from '@app/types';

export const AUTH_LOADER_ID = 'auth';

export const defaultAuthLoader = (l: Partial<AuthLoader> = {}): AuthLoader => ({
  status: 'idle',
  message: '',
  lastRun: 0,
  lastSuccess: 0,
  meta: {
    error: '',
    code: 0,
    exception_context: {},
    ...l.meta,
  },
  ...l,
});

export const defaultLoader = (l: Partial<AuthLoader> = {}): LoadingState<AuthLoaderMessage> => {
  const loading = defaultAuthLoader(l);
  return {
    ...loading,
    isIdle: loading.status === 'idle',
    isError: loading.status === 'error',
    isSuccess: loading.status === 'success',
    isLoading: loading.status === 'loading',
    isInitialLoading:
      (loading.status === 'idle' || loading.status === 'loading') && loading.lastSuccess === 0,
  };
};

export const selectAuthLoader = (state: AppState) =>
  defaultLoader(selectLoaderById(state, { id: AUTH_LOADER_ID }) as any);

export const selectIsOtpError = (state: AppState) =>
  selectAuthLoader(state).meta.error === 'otp_token_required';

export const selectIsAuthenticationError = (state: AppState) => {
  const { error } = selectAuthLoader(state).meta;
  return (
    error === 'unprocessable_entity' ||
    error === 'invalid_credentials' ||
    error === 'invalid_email' ||
    error === 'unsupported_grant_type' ||
    error === 'access_denied' ||
    error === 'invalid_scope'
  );
};

/* export const selectAuthLoaderMessage = (state: AppState) => {
  const curLoader = selectAuthLoader(state);
  const { message } = curLoader;
  return message || { error: '', message: '', code: 0, exception_context: {} };
}; */
