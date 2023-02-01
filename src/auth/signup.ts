import {
  put,
  call,
  setLoaderStart,
  setLoaderSuccess,
  setLoaderError,
} from "saga-query";

import { AuthApiCtx, ThunkCtx, thunks } from "@app/api";
import { CreateUserForm, CreateUserCtx, createUser } from "@app/users";

import { TokenCtx, createToken, elevateToken, ElevateTokenCtx } from "./token";
import { AUTH_LOADER_ID } from "./loader";
import { createOrganization, OrgCtx } from "@app/organizations";
import { ApiGen } from "@app/types";
import { elevate } from "./elevate";

function* setAuthError(ctx: AuthApiCtx) {
  if (ctx.json.ok) {
    return;
  }
  const { message, ...meta } = ctx.json.data;
  yield put(setLoaderError({ id: AUTH_LOADER_ID, message, meta }));
}

export const signup = thunks.create<CreateUserForm>(
  "signup",
  function* onSignup(ctx: ThunkCtx<CreateUserForm>, next): ApiGen {
    const { email, password } = ctx.payload;
    yield put(setLoaderStart({ id: AUTH_LOADER_ID }));

    const userCtx: CreateUserCtx = yield call(
      createUser.run,
      createUser(ctx.payload),
    );
    console.log(userCtx);
    if (!userCtx.json.ok) {
      yield call(setAuthError, userCtx);
      return;
    }

    const tokenCtx: TokenCtx = yield call(
      createToken.run,
      createToken({
        username: email,
        password,
        otpToken: "",
        makeCurrent: true,
      }),
    );
    console.log(tokenCtx);
    if (!tokenCtx.json.ok) {
      yield call(setAuthError, tokenCtx);
      return;
    }

    const orgCtx: OrgCtx = yield call(
      createOrganization.run,
      createOrganization({ name: email }),
    );
    console.log(orgCtx);
    if (!orgCtx.json.ok) {
      yield call(setAuthError, orgCtx);
      return;
    }

    const elevateCtx: ElevateTokenCtx = yield call(
      elevateToken.run,
      elevateToken({ username: email, password, otpToken: "" }),
    );
    console.log(elevateCtx);

    yield put(
      setLoaderSuccess({
        id: AUTH_LOADER_ID,
        meta: {
          id: userCtx.json.data.id,
          verified: userCtx.json.data.verified,
        },
      }),
    );
    yield next();
  },
);
