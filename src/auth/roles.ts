import { authApi } from "@app/api";
import { RoleResponse, setCurrentUserRoleIds } from "@app/roles";
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

  ctx.actions.push(
    setCurrentUserRoleIds(ctx.json.data._embedded.roles.map((r) => r.id)),
  );
});

export const fetchUserRoles = authApi.get<{ userId: string }>(
  ["/users/:userId/roles", "user"],
  authApi.cache(),
);

export const fetchUsersForRole = authApi.get<{ roleId: string }>(
  "/roles/:roleId/users",
  authApi.cache(),
);
