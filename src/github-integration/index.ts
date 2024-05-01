import { billingApi, portalApi } from "@app/api";

export const createGithubIntegration = billingApi.post<{
  organizationId: string;
  installationId: string;
}>("/github_integrations", function* (ctx, next) {
  ctx.request = ctx.req({
    body: JSON.stringify({
      organization_id: ctx.payload.organizationId,
      installation_id: ctx.payload.installationId,
    }),
  });

  yield* next();
});
