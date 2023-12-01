import { authApi } from "@app/api";
import { RoleResponse } from "@app/roles";
import { db, schema } from "@app/schema";
import { HalEmbedded } from "@app/types";

export const fetchRoles = authApi.get<{ orgId: string }>(
  "/organizations/:orgId/roles",
);
export const fetchCurrentUserRoles = authApi.get<
  { userId: string },
  HalEmbedded<{ roles: RoleResponse[] }>
>("/users/:userId/roles", function* (ctx, next) {
  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  const ids = ctx.json.value._embedded.roles.map((r) => r.id);
  yield* schema.update(db.currentUserRoles.set(ids));
});

export const fetchUserRoles = authApi.get<{ userId: string }>(
  ["/users/:userId/roles", "user"],
  authApi.cache(),
);

export const fetchUsersForRole = authApi.get<{ roleId: string }>(
  "/roles/:roleId/users",
  authApi.cache(),
);
