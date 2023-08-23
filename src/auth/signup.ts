import {
  batchActions,
  call,
  put,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
} from "@app/fx";

import { thunks } from "@app/api";
import { createSignupBillingRecords } from "@app/billing";
import { createLog } from "@app/debug";
import { ApiGen } from "@app/types";
import { CreateUserForm, createUser } from "@app/users";

import { AUTH_LOADER_ID } from "./loader";
import { createOrganization } from "./organization";
import { createToken, elevateToken } from "./token";

const log = createLog("signup");

export const signup = thunks.create<CreateUserForm>(
  "signup",
  function* onSignup(ctx, next): ApiGen {
    const { company: orgName, name, email, password } = ctx.payload;
    const id = ctx.key;
    yield* put(setLoaderStart({ id }));

    const userCtx = yield* call(createUser.run, createUser(ctx.payload));

    log(userCtx);

    if (!userCtx.json.ok) {
      const { message, ...meta } = userCtx.json.data;
      yield* put(setLoaderError({ id, message, meta }));
      return;
    }

    const tokenCtx = yield* call(
      createToken.run,
      createToken({
        username: email,
        password,
        otpToken: "",
        makeCurrent: true,
      }),
    );

    log(tokenCtx);

    if (!tokenCtx.json.ok) {
      const { message, ...meta } = tokenCtx.json.data;
      yield* put(setLoaderError({ id, message, meta }));
      return;
    }

    const orgCtx = yield* call(
      createOrganization.run,
      createOrganization({ name: orgName }),
    );

    log(orgCtx);

    if (!orgCtx.json.ok) {
      const { message, ...meta } = orgCtx.json.data;
      yield* put(setLoaderError({ id, message, meta }));
      return;
    }

    const billsCtx = yield* call(
      createSignupBillingRecords.run,
      createSignupBillingRecords({
        orgId: orgCtx.json.data.id,
        orgName,
        contactName: name,
        contactEmail: email,
      }),
    );

    if (!billsCtx.json.ok) {
      const { message, ...meta } = billsCtx.json.data;
      yield* put(setLoaderError({ id, message, meta }));
      return;
    }

    log(billsCtx);

    const elevateCtx = yield* call(
      elevateToken.run,
      elevateToken({ username: email, password, otpToken: "" }),
    );

    log(elevateCtx);

    yield* next();

    yield* put(
      batchActions([
        setLoaderSuccess({
          id,
          meta: {
            id: userCtx.json.data.id,
            verified: userCtx.json.data.verified,
          },
        }),
        setLoaderSuccess({
          id: AUTH_LOADER_ID,
        }),
      ]),
    );
  },
);
