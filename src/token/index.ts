import { createSelector } from "@reduxjs/toolkit";

import { createAssign, createReducerMap } from "@app/slice-helpers";
import { AppState, LinkResponse, Token } from "@app/types";

import { defaultHalHref } from "@app/hal";
import { parseJwt } from "./jwt-parser";

export * from "./jwt-parser";

export interface TokenSuccessResponse {
  access_token: string;
  created_at: string;
  expires_at: string;
  expires_in: string;
  id: string;
  scope: string;
  token_type: string;
  _links: {
    self: LinkResponse;
    user: LinkResponse;
    actor?: LinkResponse;
  };
  _type: "token";
}

export interface JWTToken {
  id: string;
  iss: string;
  sub: string;
  scope: string;
  exp: number;
  session: string;
  email: string;
  email_verified: boolean;
  name: string;
}

export const defaultTokenResponse = (
  t: Partial<TokenSuccessResponse> = {},
): TokenSuccessResponse => {
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  return {
    access_token: "",
    created_at: now.toISOString(),
    expires_at: tomorrow.toISOString(),
    expires_in: tomorrow.toISOString(),
    scope: "manage",
    id: "",
    token_type: "",
    _links: {
      self: { href: "" },
      user: { href: "" },
      actor: { href: "" },
      ...t._links,
    },
    _type: "token",
    ...t,
  };
};

export const defaultJWTToken = (t: Partial<JWTToken> = {}): JWTToken => {
  return {
    id: "",
    iss: "",
    sub: "",
    scope: "",
    exp: 0,
    session: "",
    email: "",
    email_verified: false,
    name: "",
    ...t,
  };
};

export const defaultToken = (t: Partial<Token> = {}): Token => {
  return {
    tokenId: "",
    accessToken: "",
    userUrl: "",
    actorUrl: "",
    ...t,
  };
};

export function deserializeToken(t: TokenSuccessResponse): Token {
  return {
    tokenId: t.id,
    accessToken: t.access_token,
    userUrl: defaultHalHref(t._links.user?.href).href,
    actorUrl: defaultHalHref(t._links.actor?.href).href,
  };
}

export const TOKEN_NAME = "token";
const token = createAssign({
  name: TOKEN_NAME,
  initialState: defaultToken(),
});

export const ELEVATED_TOKEN_NAME = "elevatedToken";
const elevatedToken = createAssign({
  name: ELEVATED_TOKEN_NAME,
  initialState: defaultToken(),
});

export const { set: setToken, reset: resetToken } = token.actions;
export const { set: setElevatedToken, reset: resetElevatedToken } =
  elevatedToken.actions;

export const reducers = createReducerMap(token, elevatedToken);

const unixNow = () => Math.floor(Date.now() / 1000);
const initJWTToken = defaultJWTToken();
const findJWTToken = (curToken: Token) => {
  if (!curToken.accessToken) {
    return initJWTToken;
  }
  return parseJwt(curToken.accessToken);
};
const hasExpired = (curToken: JWTToken) => unixNow() > curToken.exp;

export const selectToken = (state: AppState) => state[TOKEN_NAME];
export const selectAccessToken = (state: AppState) =>
  selectToken(state).accessToken;
export const selectActorUrl = (state: AppState) => selectToken(state).actorUrl;
export const selectUserUrl = (state: AppState) => selectToken(state).userUrl;
export const selectJWTToken = createSelector(selectToken, findJWTToken);
export const selectIsTokenValid = createSelector(
  selectJWTToken,
  (jwtToken) => jwtToken.scope === "manage" && !hasExpired(jwtToken),
);

export const selectIsImpersonated = (state: AppState) => {
  if (!selectActorUrl(state)) {
    return false;
  }
  return selectActorUrl(state) !== selectUserUrl(state);
};
export const selectIsUserAuthenticated = (state: AppState) =>
  !!selectAccessToken(state);

export const selectElevatedToken = (state: AppState) =>
  state[ELEVATED_TOKEN_NAME];
export const selectJWTElevatedToken = createSelector(
  selectElevatedToken,
  findJWTToken,
);
export const selectIsElevatedTokenValid = createSelector(
  selectJWTElevatedToken,
  (jwtToken) => jwtToken.scope === "elevated" && !hasExpired(jwtToken),
);
export const selectElevatedAccessToken = (state: AppState) =>
  selectElevatedToken(state).accessToken;
