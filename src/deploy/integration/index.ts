import { api } from "@app/api";
import { defaultEntity } from "@app/hal";
import { schema } from "@app/schema";
import type {
  DeployIntegration,
  DeployIntegrationResponse,
  IntegrationType,
} from "@app/types";

// Deserializer for integration
export const deserializeIntegration = (
  data: DeployIntegrationResponse,
): DeployIntegration => {
  return {
    id: data.id,
    type: (data.type as IntegrationType) || "unknown",
    organizationId: data.organization_id,
    awsRoleArn: data.aws_role_arn,
    apiKey: data.api_key,
    appKey: data.app_key,
    host: data.host,
    port: data.port,
    username: data.username,
    database: data.database,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

// Default response creator
export const defaultIntegrationResponse = (): DeployIntegrationResponse => {
  const now = new Date().toISOString();
  return {
    id: "",
    type: "ElasticsearchIntegration",
    organization_id: "",
    aws_role_arn: "",
    api_key: "",
    app_key: "",
    host: "",
    port: "",
    username: "",
    created_at: now,
    updated_at: now,
    _links: {
      self: {
        href: "",
      },
    },
    _type: "integration",
  };
};

// Basic selectors
export const selectIntegrationsAsList = schema.integrations.selectTableAsList;
export const selectIntegrationById = schema.integrations.selectById;

export const fetchIntegrations = api.get("/integrations");
export const fetchIntegration = api.get<
  { id: string },
  DeployIntegrationResponse
>("/integrations/:id");

export interface CreateIntegrationParams {
  type: string;
  organization_id: string;
  aws_role_arn?: string;
  api_key?: string;
  app_key?: string;
  host?: string;
  port?: string;
  username?: string;
  password?: string;
  database?: string;
}

export const createIntegration = api.post<
  CreateIntegrationParams,
  DeployIntegrationResponse
>("/integrations", function* (ctx, next) {
  const {
    type,
    organization_id,
    aws_role_arn,
    api_key,
    app_key,
    host,
    port,
    username,
    password,
    database,
  } = ctx.payload;
  const body = {
    type,
    organization_id,
    aws_role_arn,
    api_key,
    app_key,
    host,
    port,
    username,
    password,
    database,
  };
  ctx.request = ctx.req({ body: JSON.stringify(body) });
  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  const integrationId = ctx.json.value.id;
  ctx.loader = {
    message: `Integration created (integration ID: ${integrationId})`,
    meta: { integrationId: integrationId },
  };
});

// Update an existing integration
export interface UpdateIntegrationParams {
  id: string;
  aws_role_arn?: string;
  api_key?: string;
  app_key?: string;
  host?: string;
  port?: string;
  username?: string;
  password?: string;
  database?: string;
}

export const updateIntegration = api.put<UpdateIntegrationParams>(
  "/integrations/:id",
  function* (ctx, next) {
    const {
      aws_role_arn,
      api_key,
      app_key,
      host,
      port,
      username,
      password,
      database,
    } = ctx.payload;
    const body: {
      aws_role_arn?: string;
      api_key?: string;
      app_key?: string;
      host?: string;
      port?: string;
      username?: string;
      password?: string;
      database?: string;
    } = {};
    if (aws_role_arn) {
      body.aws_role_arn = aws_role_arn;
    }

    if (api_key) {
      body.api_key = api_key;
    }

    if (app_key) {
      body.app_key = app_key;
    }

    if (host) {
      body.host = host;
    }

    if (port) {
      body.port = port;
    }

    if (username) {
      body.username = username;
    }

    if (password && password !== "") {
      body.password = password;
    }

    if (database) {
      body.database = database;
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

// Delete an integration
export const deleteIntegration = api.delete<{ id: string }>(
  "/integrations/:id",
  function* (ctx, next) {
    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    yield* schema.update(schema.integrations.remove([ctx.payload.id]));
  },
);

export const integrationEntities = {
  integration: defaultEntity({
    id: "integration",
    deserialize: deserializeIntegration,
    save: schema.integrations.add,
  }),
};
