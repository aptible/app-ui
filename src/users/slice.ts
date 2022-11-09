import { createReducerMap, createTable } from "@app/slice-helpers";
import type { User } from "@app/types";

import { USERS_NAME } from "./constants";

export const users = createTable<User>({
  name: USERS_NAME,
});

export const {
  add: addUsers,
  set: setUsers,
  reset: resetUsers,
} = users.actions;

export const reducers = createReducerMap(users);
