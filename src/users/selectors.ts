import { createSelector } from 'reselect';

import { AppState } from '@app/types';
import { selectToken, JWTToken, parseJwt } from '@app/token';

import { USERS_NAME } from './constants';
import { defaultUser } from './serializers';
import { users } from './slice';

const selectors = users.getSelectors((state: AppState) => state[USERS_NAME]);
export const { selectTable: selectUsers } = selectors;

const initUser = defaultUser({ verified: false });

export const selectCurrentUser = createSelector(selectToken, (token) => {
  if (!token.accessToken) return initUser;
  const userInfo: JWTToken = parseJwt(token.accessToken);
  return defaultUser({
    id: userInfo.sub ? userInfo.sub.split('/').pop() : '',
    name: userInfo.name,
    email: userInfo.email,
    verified: userInfo.email_verified,
  });
});
