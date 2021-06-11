import { createSelector } from 'reselect';

import { AppState } from '@app/types';
import { selectToken, JWTToken, parseJwt } from '@app/token';

import { USERS_NAME } from './constants';
import { defaultUser } from './serializers';
import { users } from './slice';

const selectors = users.getSelectors((state: AppState) => state[USERS_NAME]);
export const { selectTable: selectUsers, selectById: selectUserById } =
  selectors;

const initUser = defaultUser({ verified: false });

export const selectCurrentUserId = createSelector(selectToken, (token) => {
  return token.userUrl.split('/').pop() || '';
});

export const selectCurrentUser = createSelector(
  selectUsers,
  selectCurrentUserId,
  (users, userId) => users[userId] || defaultUser(),
);
