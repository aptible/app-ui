import { User } from '@app/types';
import { createReducerMap, createAssign, createTable } from 'robodux';
import { CURRENT_USER_NAME, USERS_NAME } from './constants';
import { defaultUser } from './serializers';

export const currentUser = createAssign<User>({
  name: CURRENT_USER_NAME,
  initialState: defaultUser(),
});

export const users = createTable<User>({
  name: USERS_NAME,
});

export const { set: setCurrentUser, reset: resetCurrentUser } =
  currentUser.actions;

export const { set: setUsers, reset: resetUsers } = users.actions;

export const reducers = createReducerMap(currentUser, users);
