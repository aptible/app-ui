import {
  put,
  call,
  setLoaderStart,
  setLoaderSuccess,
  setLoaderError,
} from "saga-query";

import { AuthApiCtx, ThunkCtx, thunks } from "@app/api";
import { CreateUserForm, CreateUserCtx, createUser } from "@app/users";

import { TokenCtx, createToken } from "./token";
import { AUTH_LOADER_ID } from "./loader";

function* setAuthError(ctx: AuthApiCtx) {
  if (ctx.json.ok) {
    return;
  }
  const { message, ...meta } = ctx.json.data;
  yield put(setLoaderError({ id: AUTH_LOADER_ID, message, meta }));
}

export const signup = thunks.create<CreateUserForm>(
  "signup",
  function* onSignup(ctx: ThunkCtx<CreateUserForm>, next) {
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

    yield put(setLoaderSuccess({ id: AUTH_LOADER_ID }));
    yield next();
  },
);
