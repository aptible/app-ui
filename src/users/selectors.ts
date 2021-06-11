import { createSelector } from 'reselect';

import { AppState } from '@app/types';
import { selectToken } from '@app/token';

import { USERS_NAME } from './constants';
import { defaultUser } from './serializers';
import { users } from './slice';

const selectors = users.getSelectors((state: AppState) => state[USERS_NAME]);
export const { selectTable: selectUsers, selectById: selectUserById } =
  selectors;

export const selectCurrentUserId = createSelector(selectToken, (token) => {
  return token.userUrl.split('/').pop() || '';
});

export const selectCurrentUser = createSelector(
  selectUsers,
  selectCurrentUserId,
  (curUsers, userId) => {
    return curUsers[userId] || defaultUser();
  },
);
