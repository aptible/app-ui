import { createAssign, createReducerMap } from '@app/slice-helpers';
import { HOME_PATH } from '@app/routes';
import { AppState } from '@app/types';

export const REDIRECT_NAME = 'redirectPath';

const redirectPath = createAssign({
  name: REDIRECT_NAME,
  initialState: HOME_PATH,
});

export const { set: setRedirectPath, reset: resetRedirectPath } =
  redirectPath.actions;

export const selectRedirectPath = (state: AppState) => {
  return state[REDIRECT_NAME];
};

export const reducers = createReducerMap(redirectPath);
