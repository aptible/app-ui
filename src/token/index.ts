import { createSelector } from "@app/fx";
import { defaultHalHref } from "@app/hal";
import { type WebState, schema } from "@app/schema";
import type { LinkResponse, Token } from "@app/types";
import { type JwtToken, defaultJWTToken, parseJwt } from "./jwt-parser";

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

export function deserializeToken(t: TokenSuccessResponse): Token {
  return {
    tokenId: t.id,
    accessToken: t.access_token,
    userUrl: defaultHalHref(t._links.user?.href).href,
    actorUrl: defaultHalHref(t._links.actor?.href).href,
  };
}

const unixNow = () => Math.floor(Date.now() / 1000);
const initJwtToken = defaultJWTToken();
const findJwtToken = (curToken: Token): JwtToken => {
  if (curToken.accessToken === "") {
    return initJwtToken;
  }
  return parseJwt(curToken.accessToken);
};
const hasExpired = (curToken: JwtToken) => unixNow() > curToken.exp;

export const selectToken = schema.token.select;
export const selectAccessToken = (state: WebState) =>
  schema.token.select(state).accessToken;
export const selectActorUrl = (state: WebState) =>
  schema.token.select(state).actorUrl;
export const selectUserUrl = (state: WebState) =>
  schema.token.select(state).userUrl;
export const selectJwtToken = createSelector(schema.token.select, findJwtToken);
export const selectIsTokenValid = createSelector(
  selectJwtToken,
  (jwtToken) => jwtToken.scope !== "" && !hasExpired(jwtToken),
);
export const selectTokenHasWriteAccess = createSelector(
  selectJwtToken,
  (jwtToken) => ["manage", "elevated", "privileged"].includes(jwtToken.scope),
);
export const selectIsAuthWithSso = createSelector(selectJwtToken, (jwt) => {
  return jwt._type === "org";
});

export const selectIsImpersonated = (state: WebState) => {
  if (!selectActorUrl(state)) {
    return false;
  }
  return selectActorUrl(state) !== selectUserUrl(state);
};
export const selectIsUserAuthenticated = selectIsTokenValid;

export const selectJwtElevatedToken = createSelector(
  schema.elevatedToken.select,
  findJwtToken,
);
export const selectIsElevatedTokenValid = createSelector(
  selectJwtElevatedToken,
  (jwtToken) => jwtToken.scope === "elevated" && !hasExpired(jwtToken),
);
export const selectElevatedAccessToken = (state: WebState) =>
  schema.elevatedToken.select(state).accessToken;
