import { Next, call, put, select } from "@app/fx";

import { authApi, cacheTimer, elevetatedMdw } from "@app/api";
import { selectOrigin } from "@app/env";
import { setOrganizationSelected } from "@app/organizations";
import type { ApiGen, AuthApiCtx } from "@app/types";

import { deserializeUser } from "./serializers";
import type { CreateUserForm, UserResponse } from "./types";

interface UserBase {
  userId: string;
}

export const fetchUser = authApi.get<UserBase, UserResponse>(
  "/users/:userId",
  { saga: cacheTimer() },
  function* (ctx, next) {
    yield* call(elevetatedMdw, ctx, next);
    if (!ctx.json.ok) return;
    const user = deserializeUser(ctx.json.data);
    if (user.selectedOrganizationId) {
      ctx.actions.push(setOrganizationSelected(user.selectedOrganizationId));
    }
  },
);
export const fetchUsers = authApi.get<{ orgId: string }>(
  "/organizations/:orgId/users",
  {
    saga: cacheTimer(),
  },
);

export const createUser = authApi.post<CreateUserForm, UserResponse>(
  "/users",
  function* onCreateUser(ctx, next): ApiGen {
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

// This is a discriminated union.
// When we provide a `type` to this payload we can make guarentees about the
// we require in order to perform the update.
type PatchUser = UpdatePassword | AddOtp | RemoveOtp;

type ElevatedPostCtx = AuthApiCtx<
  any,
  { userId: string; [key: string]: string | number | boolean }
>;

function* elevatedUpdate(ctx: ElevatedPostCtx, next: Next) {
  const { userId, type: _, ...payload } = ctx.payload;
  ctx.elevated = true;
  ctx.request = ctx.req({
    body: JSON.stringify(payload),
  });
  yield* next();
}

export const updateUser = authApi.patch<PatchUser>(
  "/users/:userId",
  elevatedUpdate,
);

export const updateUserOrg = authApi.put<{ userId: string; orgId: string }>(
  ["/users/:userId", "org"],
  function* (ctx, next) {
    ctx.request = ctx.req({
      body: JSON.stringify({ selected_organization: ctx.payload.orgId }),
    });
    yield* put(setOrganizationSelected(ctx.payload.orgId));
    yield* next();
  },
);

interface UpdateEmail {
  userId: string;
  email: string;
}

export const updateEmail = authApi.post<UpdateEmail>(
  "/:userId/email_verification_challenges",
  elevatedUpdate,
);

export const fetchRecoveryCodes = authApi.get<UserBase>(
  "/users/:userId/otp_recovery_codes",
  authApi.cache(),
);
