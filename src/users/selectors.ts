import { createSelector } from 'reselect';

import { AppState } from '@app/types';
import { selectToken, JWTTokenResponse, parseJwt } from '@app/token';

import { USERS_NAME } from './constants';
import { defaultUser } from './serializers';
import { users } from './slice';

const selectors = users.getSelectors((state: AppState) => state[USERS_NAME]);
export const { selectTable: selectUsers } = selectors;

export const selectCurrentUser = createSelector(selectToken, (token) => {
  const userInfo: JWTTokenResponse = parseJwt(token.accessToken);
  return defaultUser({
    id: userInfo.sub ? userInfo.sub.split('/').pop() : '',
    name: userInfo.name,
    email: userInfo.email,
    verified: userInfo.email_verified,
  });
});
