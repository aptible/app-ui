import { createSelector } from "@app/fx";
import { WebState, schema } from "@app/schema";
import { selectToken } from "@app/token";

export const selectUsers = schema.users.selectTable;
export const selectUsersAsList = schema.users.selectTableAsList;
export const selectUsersByIds = schema.users.selectByIds;
export const selectUserById = schema.users.selectById;

export const selectUsersForSearchTable = createSelector(
  selectUsersAsList,
  (_: WebState, p: { search: string }) => p.search,
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

export const selectCurrentUser = createSelector(
  selectUsers,
  selectCurrentUserId,
  (curUsers, userId) => {
    return curUsers[userId] || schema.users.empty;
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
