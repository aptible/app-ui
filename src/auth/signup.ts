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

import { AUTH_LOADER_ID, defaultAuthLoaderMeta } from "./loader";
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
      yield* put(
        setLoaderError({ id, message, meta: defaultAuthLoaderMeta(meta) }),
      );
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
      yield* put(
        setLoaderError({ id, message, meta: defaultAuthLoaderMeta(meta) }),
      );
      return;
    }

    const orgCtx = yield* call(
      createOrganization.run,
      createOrganization({ name: orgName }),
    );

    // hack because useLoaderSuccess expected loader.isLoader then loader.isSuccess
    yield* put(setLoaderStart({ id }));

    log(orgCtx);

    if (!orgCtx.json.ok) {
      const { message, ...meta } = orgCtx.json.data;
      yield* put(
        setLoaderError({ id, message, meta: defaultAuthLoaderMeta(meta) }),
      );
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
      yield* put(
        setLoaderError({ id, message, meta: defaultAuthLoaderMeta(meta) }),
      );
      return;
    }

    log(billsCtx);

    const elevateCtx = yield* call(
      elevateToken.run,
      elevateToken({ username: email, password, otpToken: "" }),
    );

    log(elevateCtx);

    yield* put(
      batchActions([
        setLoaderSuccess({
          id,
          meta: defaultAuthLoaderMeta({
            id: `${userCtx.json.data.id}`,
            verified: userCtx.json.data.verified,
          }),
        }),
        setLoaderSuccess({
          id: AUTH_LOADER_ID,
        }),
      ]),
    );

    yield* next();
  },
);
