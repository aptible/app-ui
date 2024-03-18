import {
  authApi,
  cacheShortTimer,
  elevatedUpdate,
  elevetatedMdw,
} from "@app/api";
import { selectOrigin } from "@app/config";
import { call, select } from "@app/fx";
import { selectOrganizationById } from "@app/organizations";
import { WebState, schema } from "@app/schema";
import { deserializeUser } from "./serializers";
import type { CreateUserForm, UserResponse } from "./types";

interface UserBase {
  userId: string;
}

export const fetchUser = authApi.get<UserBase, UserResponse>(
  "/users/:userId",
  { supervisor: cacheShortTimer() },
  function* (ctx, next) {
    yield* call(() => elevetatedMdw(ctx as any, next));
    if (!ctx.json.ok) return;
    const user = deserializeUser(ctx.json.value);
    if (user.selectedOrganizationId) {
      const org = yield* select((s: WebState) =>
        selectOrganizationById(s, {
          id: user.selectedOrganizationId,
        }),
      );
      // if we don't have the org in our list we can't set the org selected
      if (!org.id) return;
      // if we need to reauthenticate to use that org then we can't set the org selected
      if (org.reauthRequired) return;
      yield* schema.update(
        schema.organizationSelected.set(user.selectedOrganizationId),
      );
    }
  },
);
export const fetchUsers = authApi.get<{ orgId: string }>(
  "/organizations/:orgId/users",
  {
    supervisor: cacheShortTimer(),
  },
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }
    yield* schema.update(schema.users.reset());
  },
);

export const createUser = authApi.post<CreateUserForm, UserResponse>(
  "/users",
  function* onCreateUser(ctx, next) {
    const origin = yield* select(selectOrigin);
    ctx.request = ctx.req({
      body: JSON.stringify({ ...ctx.payload, origin }),
    });

    yield* next();
  },
);

export const checkClaim = authApi.post<CreateUserForm, UserResponse>(
  "/claims/user",
  function* onCheckClaim(ctx, next) {
    const origin = yield* select(selectOrigin);
    ctx.request = ctx.req({
      body: JSON.stringify({ ...ctx.payload, origin }),
    });

    yield* next();
  },
);

export const updateUserName = authApi.patch<{ userId: string; name: string }>(
  ["/users/:userId", "name"],
  function* (ctx, next) {
    ctx.request = ctx.req({
      body: JSON.stringify({ name: ctx.payload.name }),
    });
    yield* next();
    if (!ctx.json.ok) return;
    ctx.loader = { message: "Successfully updated your name!" };
  },
);

export const updateUserOrg = authApi.put<{ userId: string; orgId: string }>(
  ["/users/:userId", "org"],
  function* (ctx, next) {
    ctx.request = ctx.req({
      body: JSON.stringify({
        selected_organization_id: ctx.payload.orgId,
      }),
    });
    yield* schema.update(schema.organizationSelected.set(ctx.payload.orgId));
    yield* next();
  },
);

interface UpdateEmail {
  userId: string;
  email: string;
}

export const updateEmail = authApi.post<UpdateEmail>(
  ["/users/:userId/email_verification_challenges", "update"],
  elevatedUpdate,
);

export const fetchRecoveryCodes = authApi.get<UserBase>(
  "/users/:userId/otp_recovery_codes",
  authApi.cache(),
);
