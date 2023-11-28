import { authApi, cacheTimer } from "@app/api";
import { call, select } from "@app/fx";
import {
  OrganizationResponse,
  selectOrganizationSelectedId,
  setOrganizationSelected,
} from "@app/organizations";
import { selectToken } from "@app/token";
import { AuthApiError, HalEmbedded, Organization } from "@app/types";
import { exchangeToken } from "./token";

export const fetchOrganizations = authApi.get<
  never,
  HalEmbedded<{ organizations: OrganizationResponse[] }>
>(
  "/organizations",
  {
    supervisor: cacheTimer(),
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
  { supervisor: cacheTimer() },
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

export const createOrganization = authApi.post<
  CreateOrg,
  OrganizationResponse,
  AuthApiError
>("/organizations", function* onCreateOrg(ctx, next) {
  const { name } = ctx.payload;
  ctx.request = ctx.req({
    body: JSON.stringify({ name }),
  });
  yield* next();
  const token = yield* select(selectToken);
  if (!ctx.json.ok) {
    return;
  }

  yield* call(() =>
    exchangeToken.run(
      exchangeToken({
        actorToken: token.accessToken,
        subjectToken: token.userUrl,
        subjectTokenType: "aptible:user:href",
        scope: "manage",
      }),
    ),
  );
  ctx.actions.push(setOrganizationSelected(ctx.json.data.id));
});

export const updateOrganization = authApi.patch<Organization>(
  "/organizations/:id",
  function* (ctx, next) {
    ctx.request = ctx.req({
      body: JSON.stringify({
        name: ctx.payload.name,
        address: ctx.payload.address,
        city: ctx.payload.city,
        state: ctx.payload.state,
        zip: ctx.payload.zip,
        security_alert_email: ctx.payload.securityAlertEmail,
        ops_alert_email: ctx.payload.opsAlertEmail,
        emergency_phone: ctx.payload.emergencyPhone,
        primary_phone: ctx.payload.primaryPhone,
      }),
    });

    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    ctx.loader = { message: "Successfully updated contact settings!" };
  },
);

export const updateSsoForOrganization = authApi.patch<{
  id: string;
  ssoEnforced: boolean;
}>(["/organizations/:id", "sso"], function* (ctx, next) {
  ctx.request = ctx.req({
    body: JSON.stringify({
      sso_enforced: ctx.payload.ssoEnforced,
    }),
  });

  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  ctx.loader = { message: "Successful organization SSO enforcement!" };
});

export const removeUserFromOrg = authApi.delete<{
  orgId: string;
  userId: string;
}>("/organizations/:orgId/users/:userId");
