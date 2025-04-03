import { api } from "@app/api";
import { defaultEntity } from "@app/hal";
import { schema } from "@app/schema";
import type {
  DeployLlmIntegration,
  DeployLlmIntegrationResponse,
} from "@app/types";

// Deserializer for LLM integration
export const deserializeLlmIntegration = (
  data: DeployLlmIntegrationResponse,
): DeployLlmIntegration => {
  return {
    id: data.id,
    providerType: data.provider_type,
    organizationId: data.organization_id,
    apiKey: data.api_key,
    baseUrl: data.base_url,
    openaiOrganization: data.openai_organization,
    apiVersion: data.api_version,
    awsAccessKeyId: data.aws_access_key_id,
    awsSecretAccessKey: data.aws_secret_access_key,
    awsRegion: data.aws_region,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

// Default response creator
export const defaultLlmIntegrationResponse =
  (): DeployLlmIntegrationResponse => {
    const now = new Date().toISOString();
    return {
      id: "",
      provider_type: "OpenaiIntegration",
      organization_id: "",
      api_key: "",
      base_url: "",
      openai_organization: "",
      api_version: "",
      aws_access_key_id: "",
      aws_secret_access_key: "",
      aws_region: "",
      created_at: now,
      updated_at: now,
      _links: {
        self: {
          href: "",
        },
      },
      _type: "llm_integration",
    };
  };

// Basic selectors
export const selectLlmIntegrationsAsList =
  schema.llmIntegrations.selectTableAsList;
export const selectLlmIntegrationById = schema.llmIntegrations.selectById;

export const fetchLlmIntegrations = api.get("/llm_integrations");
export const fetchLlmIntegration = api.get<
  { id: string },
  DeployLlmIntegrationResponse
>("/llm_integrations/:id");

export interface CreateLlmIntegrationParams {
  provider_type: string;
  organization_id: string;
  api_key?: string;
  base_url?: string;
  openai_organization?: string;
  api_version?: string;
  aws_access_key_id?: string;
  aws_secret_access_key?: string;
  aws_region?: string;
}

export const createLlmIntegration = api.post<
  CreateLlmIntegrationParams,
  DeployLlmIntegrationResponse
>("/llm_integrations", function* (ctx, next) {
  const {
    provider_type,
    organization_id,
    api_key,
    base_url,
    openai_organization,
    api_version,
    aws_access_key_id,
    aws_secret_access_key,
    aws_region,
  } = ctx.payload;
  const body = {
    provider_type,
    organization_id,
    api_key,
    base_url,
    openai_organization,
    api_version,
    aws_access_key_id,
    aws_secret_access_key,
    aws_region,
  };
  ctx.request = ctx.req({ body: JSON.stringify(body) });
  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  const integrationId = ctx.json.value.id;
  ctx.loader = {
    message: `LLM Integration created (integration ID: ${integrationId})`,
    meta: { integrationId: integrationId },
  };
});

// Update an existing LLM integration
export interface UpdateLlmIntegrationParams {
  id: string;
  api_key?: string;
  base_url?: string;
  openai_organization?: string;
  api_version?: string;
  aws_access_key_id?: string;
  aws_secret_access_key?: string;
  aws_region?: string;
}

export const updateLlmIntegration = api.put<UpdateLlmIntegrationParams>(
  "/llm_integrations/:id",
  function* (ctx, next) {
    const {
      api_key,
      base_url,
      openai_organization,
      api_version,
      aws_access_key_id,
      aws_secret_access_key,
      aws_region,
    } = ctx.payload;
    const body: {
      api_key?: string;
      base_url?: string;
      openai_organization?: string;
      api_version?: string;
      aws_access_key_id?: string;
      aws_secret_access_key?: string;
      aws_region?: string;
    } = {};

    if (api_key !== undefined) {
      body.api_key = api_key;
    }

    if (base_url !== undefined) {
      body.base_url = base_url;
    }

    if (openai_organization !== undefined) {
      body.openai_organization = openai_organization;
    }

    if (api_version !== undefined) {
      body.api_version = api_version;
    }

    if (aws_access_key_id !== undefined) {
      body.aws_access_key_id = aws_access_key_id;
    }

    if (aws_secret_access_key !== undefined) {
      body.aws_secret_access_key = aws_secret_access_key;
    }

    if (aws_region !== undefined) {
      body.aws_region = aws_region;
    }

    ctx.request = ctx.req({ body: JSON.stringify(body) });

    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    ctx.loader = {
      message: "Saved changes successfully!",
    };
  },
);

// Delete an LLM integration
export const deleteLlmIntegration = api.delete<{ id: string }>(
  "/llm_integrations/:id",
  function* (ctx, next) {
    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    yield* schema.update(schema.llmIntegrations.remove([ctx.payload.id]));
  },
);

export const llmIntegrationEntities = {
  llm_integration: defaultEntity({
    id: "llm_integration",
    deserialize: deserializeLlmIntegration,
    save: schema.llmIntegrations.add,
  }),
};
