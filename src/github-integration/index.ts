import { portalApi } from "@app/api";
import { schema } from "@app/schema";
import { GithubIntegration } from "@app/types";
import { takeLeading } from "starfx";

export const fetchGithubIntegrations = portalApi.get<
  never,
  GithubIntegrationResponse[]
>(
  "/github_integrations",
  {
    supervisor: takeLeading,
  },
  function* (ctx, next) {
    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    const records = ctx.json.value;
    yield* schema.update(
      schema.githubIntegrations.set(
        records.reduce(
          (acc, record) => ({
            ...acc,
            [record.id]: deserializeGithubIntegration(record),
          }),
          {},
        ),
      ),
    );
  },
);

export const createGithubIntegration = portalApi.post<{
  installationId: string;
}>("/github_integrations", { supervisor: takeLeading }, function* (ctx, next) {
  ctx.request = ctx.req({
    body: JSON.stringify({
      installation_id: ctx.payload.installationId,
    }),
  });

  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  const record = ctx.json.value;
  yield* schema.update(
    schema.githubIntegrations.add({
      [record.id]: deserializeGithubIntegration(record),
    }),
  );
});

export const deleteGithubIntegration = portalApi.delete<{
  id: string;
}>("/github_integrations/:id", function* (ctx, next) {
  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  yield* schema.update(schema.githubIntegrations.remove([ctx.payload.id]));
});

export const selectGithubIntegrationsAsList =
  schema.githubIntegrations.selectTableAsList;

export interface GithubIntegrationResponse {
  id: number;
  installation_id: string;
  organization_id: string;
  account_name: string;
  avatar_url: string;
  installation_url: string;
  installed: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const defaultGithubIntegrationResponse = (
  p: Partial<GithubIntegrationResponse> = {},
): GithubIntegrationResponse => {
  const now = new Date().toISOString();
  return {
    id: -1,
    installation_id: "",
    organization_id: "",
    account_name: "",
    avatar_url: "",
    installation_url: "",
    installed: false,
    active: false,
    created_at: now,
    updated_at: now,
    ...p,
  };
};

export const deserializeGithubIntegration = (
  payload: GithubIntegrationResponse,
): GithubIntegration => {
  return {
    id: `${payload.id}`,
    installationId: payload.installation_id,
    accountName: payload.account_name,
    avatarUrl: payload.avatar_url,
    installationUrl: payload.installation_url,
    organizationId: payload.organization_id,
    installed: payload.installed,
    active: payload.active,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
};
