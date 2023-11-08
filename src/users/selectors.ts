import { createSelector } from "@reduxjs/toolkit";

import { selectToken } from "@app/token";
import type { AppState } from "@app/types";

import { USERS_NAME } from "./constants";
import { defaultUser } from "./serializers";
import { users } from "./slice";

const selectors = users.getSelectors((state: AppState) => state[USERS_NAME]);
export const {
  selectTable: selectUsers,
  selectById: selectUserById,
  selectTableAsList: selectUsersAsList,
} = selectors;

export const selectUsersForSearchTable = createSelector(
  selectUsersAsList,
  (_: AppState, p: { search: string }) => p.search,
  (users, search) => {
    return users.filter((user) => {
      const searchLower = search.toLocaleLowerCase();
      const email = user.email.toLocaleLowerCase();
      const name = user.name.toLocaleLowerCase();

      const emailMatch = email.includes(searchLower);
      const nameMatch = name.includes(searchLower);
      const verifiedMatch = search === "verified" && user.verified;
      const notVerifiedMatch = search === "!verified" && !user.verified;
      const otpMatch = search === "mfa" && user.otpEnabled;
      const notOtpMatch = search === "!mfa" && !user.otpEnabled;

      return (
        emailMatch ||
        nameMatch ||
        verifiedMatch ||
        notVerifiedMatch ||
        otpMatch ||
        notOtpMatch
      );
    });
  },
);

export const selectCurrentUserId = createSelector(selectToken, (token) => {
  return token.userUrl.split("/").pop() || "";
});

const initUser = defaultUser();
export const selectCurrentUser = createSelector(
  selectUsers,
  selectCurrentUserId,
  (curUsers, userId) => {
    return curUsers[userId] || initUser;
  },
);

export const selectCanImpersonate = createSelector(
  selectCurrentUser,
  (user) => {
    return user.superuser || user.readOnlyImpersonate;
  },
);

export const selectIsUserVerified = createSelector(
  selectCurrentUser,
  (user) => user.verified,
);
