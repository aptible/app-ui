import { authApi, cacheShortTimer, elevetatedMdw } from "@app/api";
import { selectOrigin } from "@app/config";
import { Next, call, select } from "@app/fx";
import { selectOrganizationById } from "@app/organizations";
import { WebState, db, schema } from "@app/schema";
import type { AuthApiCtx } from "@app/types";
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
        db.organizationSelected.set(user.selectedOrganizationId),
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
    yield* schema.update(db.users.reset());
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

interface UpdatePassword extends UserBase {
  type: "update-password";
  password: string;
}

interface AddOtp extends UserBase {
  type: "otp";
  otp_enabled: true;
  current_otp_configuration: string;
  current_otp_configuration_id: string;
  otp_token: string;
}

interface RemoveOtp extends UserBase {
  type: "otp";
  otp_enabled: false;
}

type ElevatedPostCtx = AuthApiCtx<
  any,
  { userId: string; [key: string]: string | number | boolean }
>;

function* elevatedUpdate(ctx: ElevatedPostCtx, next: Next) {
  const { userId, ...payload } = ctx.payload;
  ctx.elevated = true;
  ctx.request = ctx.req({
    body: JSON.stringify(payload),
  });
  yield* next();
  if (!ctx.json.ok) {
    return;
  }

  ctx.loader = { message: "Saved changes successfully!" };
}

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

export const updatePassword = authApi.patch<UpdatePassword>(
  ["/users/:userId", "pass"],
  elevatedUpdate,
);
export const addOtp = authApi.patch<AddOtp>(
  ["/users/:userId", "addotp"],
  elevatedUpdate,
);
export const rmOtp = authApi.patch<RemoveOtp>(
  ["/users/:userId", "rmotp"],
  elevatedUpdate,
);

export const updateUserOrg = authApi.put<{ userId: string; orgId: string }>(
  ["/users/:userId", "org"],
  function* (ctx, next) {
    ctx.request = ctx.req({
      body: JSON.stringify({
        selected_organization_id: ctx.payload.orgId,
      }),
    });
    yield* schema.update(db.organizationSelected.set(ctx.payload.orgId));
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
