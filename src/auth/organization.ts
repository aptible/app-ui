import { call, select } from "@app/fx";

import { authApi, cacheTimer } from "@app/api";
import {
  OrganizationResponse,
  setOrganizationSelected,
} from "@app/organizations";
import { selectToken } from "@app/token";
import { ApiGen, AuthApiCtx, HalEmbedded } from "@app/types";

import { exchangeToken } from "./token";

type FetchOrgCtx = AuthApiCtx<
  {},
  HalEmbedded<{ organizations: OrganizationResponse[] }>
>;
export const fetchOrganizations = authApi.get<FetchOrgCtx>(
  "/organizations",
  { saga: cacheTimer() },
  function* onFetchOrgs(ctx, next) {
    yield next();
    if (!ctx.json.ok) {
      return;
    }

    const orgs = ctx.json.data._embedded.organizations.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
    if (orgs.length > 0) {
      ctx.actions.push(setOrganizationSelected(orgs[0].id));
    }
  },
);

interface CreateOrg {
  name: string;
}

export const createOrganization = authApi.post<CreateOrg, OrganizationResponse>(
  "/organizations",
  function* onCreateOrg(ctx, next): ApiGen {
    const { name } = ctx.payload;
    ctx.request = ctx.req({
      body: JSON.stringify({ name }),
    });
    yield next();
    const token = yield* select(selectToken);
    if (!ctx.json.ok) {
      return;
    }

    yield* call(
      exchangeToken.run,
      exchangeToken({
        actorToken: token.accessToken,
        subjectToken: token.userUrl,
        subjectTokenType: "aptible:user:href",
        scope: "manage",
      }),
    );
    ctx.actions.push(setOrganizationSelected(ctx.json.data.id));
  },
);
