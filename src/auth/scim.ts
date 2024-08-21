import { authApi } from "@app/api";
import { thunks } from "@app/api";
import { schema } from "@app/schema";
import type { HalEmbedded } from "@app/types";

export interface ScimConfigurationResponse {
  id: string;
  organization_id: string;
  default_role_id: string;
  token_id: string;
  created_at: string;
  updated_at: string;
  unique_identifier: string;
  _type: "scim_configuration";
}

export const defaultScimConfigurationResponse = (
  s: Partial<ScimConfigurationResponse> = {},
): ScimConfigurationResponse => {
  const now = new Date().toISOString();
  return {
    id: "",
    organization_id: "",
    default_role_id: "",
    token_id: "",
    created_at: now,
    updated_at: now,
    unique_identifier: "",
    _type: "scim_configuration",
    ...s,
  };
};

export type FetchScimConfigurations = HalEmbedded<{
  scim_configurations: ScimConfigurationResponse[];
}>;

export const fetchScimConfigurations = authApi.get<
  never,
  FetchScimConfigurations
>("/scim_configurations", authApi.cache());

export interface CreateScimConfiguration {
  orgId: string;
  defaultRoleId: string;
}

export const createScimConfiguration = authApi.post<CreateScimConfiguration>(
  "/scim_configurations",
  function* (ctx, next) {
    ctx.request = ctx.req({
      body: JSON.stringify({
        scim_configuration: {
          organization_id: ctx.payload.orgId,
          default_role_id: ctx.payload.defaultRoleId,
          unique_identifier: "email",
        },
      }),
    });
    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    ctx.loader = { message: "Success!" };
  },
);

export interface UpdateScimConfiguration {
  scimId: string;
  orgId: string;
  defaultRoleId: string;
}

export const updateScimConfiguration = authApi.patch<UpdateScimConfiguration>(
  "/scim_configurations/:scimId",
  function* (ctx, next) {
    ctx.request = ctx.req({
      body: JSON.stringify({
        scim_configuration: {
          organization_id: ctx.payload.orgId,
          default_role_id: ctx.payload.defaultRoleId,
        },
      }),
    });
    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    ctx.loader = { message: "Success!" };
  },
);

export const deleteScimConfiguration = authApi.delete<{ id: string }>(
  "/scim_configurations/:id",
);

export interface GenerateScimToken {
  scimConfigurationId: string;
  userId: string;
}

export interface GenerateTokenResponse {
  token: string;
}

export const selectScimToken = schema.scimToken.select;

export const generateScimToken = authApi.post<
  GenerateScimToken,
  GenerateTokenResponse
>("/scim_configurations/generate_token", function* (ctx, next) {
  ctx.request = ctx.req({
    body: JSON.stringify({
      scim_configuration_id: ctx.payload.scimConfigurationId,
      user_id: ctx.payload.userId,
    }),
  });
  yield* next();

  if (!ctx.json.ok) {
    throw new Error("API request failed");
  }

  const response: GenerateTokenResponse = ctx.json.value;
  yield* schema.update(schema.scimToken.set(response.token));
  ctx.loader = { message: "Token generated successfully!" };
});

export const resetScimToken = thunks.create(
  "reset-scim-token",
  function* (_, next) {
    yield* schema.update(schema.scimToken.reset());
    yield* next();
  },
);
