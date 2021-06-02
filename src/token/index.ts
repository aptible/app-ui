import { createAssign, createReducerMap } from 'robodux';

import { Loaders, selectLoaderById } from '@app/loaders';
import { Token, AppState } from '@app/types';

export const defaultToken = (t: Partial<Token> = {}): Token => {
  return {
    tokenId: '',
    accessToken: '',
    userUrl: '',
    actorUrl: '',
    ...t,
  };
};

export const TOKEN_SLICE = 'token';
const token = createAssign({
  name: TOKEN_SLICE,
  initialState: defaultToken(),
});

export const { set: setToken, reset: resetToken } = token.actions;

export const reducers = createReducerMap(token);
export const selectToken = (state: AppState) => state[TOKEN_SLICE];
export const selectAccessToken = (state: AppState) =>
  selectToken(state).accessToken;
export const selectActorUrl = (state: AppState) => selectToken(state).actorUrl;
export const selectUserUrl = (state: AppState) => selectToken(state).userUrl;
export const selectIsImpersonated = (state: AppState) =>
  selectActorUrl(state) !== selectUserUrl(state);
export const selectIsUserAuthenticated = (state: AppState) =>
  !!selectAccessToken(state);

export const selectIsOtpError = (state: AppState) =>
  selectLoaderById(state, { id: Loaders.Auth }).meta.error ===
  'otp_token_required';

export const selectIsAuthenticationError = (state: AppState) => {
  const { error } = selectLoaderById(state, { id: Loaders.Auth }).meta;
  return (
    error === 'unprocessable_entity' ||
    error === 'invalid_credentials' ||
    error === 'invalid_email'
  );
};
