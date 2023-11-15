import { call, select } from "@app/fx";

import { authApi, cacheTimer } from "@app/api";
import {
  OrganizationResponse,
  selectOrganizationSelectedId,
  setOrganizationSelected,
} from "@app/organizations";
import { selectToken } from "@app/token";
import { ApiGen, HalEmbedded } from "@app/types";

import { exchangeToken } from "./token";

export const fetchOrganizations = authApi.get<
  never,
  HalEmbedded<{ organizations: OrganizationResponse[] }>
>(
  "/organizations",
  {
    saga: cacheTimer(),
  },
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) return;
    const orgSelected = yield* select(selectOrganizationSelectedId);
    const orgs = [...ctx.json.data._embedded.organizations].sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );

    const foundOrg = orgs.find((o) => o.id === orgSelected);
    if (!foundOrg && orgs.length > 0) {
      const org = orgs[0];
      if (!org) return;
      ctx.actions.push(setOrganizationSelected(org.id));
    }
  },
);
export const fetchReauthOrganizations = authApi.get<
  never,
  HalEmbedded<{ organizations: OrganizationResponse[] }>
>(
  "/reauthenticate_organizations",
  { saga: cacheTimer() },
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) return;
    const organizations = ctx.json.data._embedded.organizations.map((o) => {
      return { ...o, reauth_required: true };
    });
    ctx.json.data._embedded = {
      organizations,
    };
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
    yield* next();
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

export const removeUserFromOrg = authApi.delete<{
  orgId: string;
  userId: string;
}>("/organizations/:orgId/users/:userId");
