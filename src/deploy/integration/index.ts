import { api, cacheMinTimer } from "@app/api";
import { createSelector } from "@app/fx";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import type { WebState } from "@app/schema";
import { defaultDeployIntegration } from "@app/schema/factory";
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
export const selectIntegrationsTable = (state: WebState) => state.integrations;
export const selectIntegrations = (state: WebState) =>
  Object.values(state.integrations);

export const selectIntegrationById = (state: WebState, id: string) =>
  state.integrations[id] || defaultDeployIntegration({ id });

// Selector to get integrations for a specific organization
export const selectOrganizationIntegrations = createSelector(
  [selectIntegrations, (_: WebState, organizationId: string) => organizationId],
  (integrations, organizationId) =>
    integrations.filter(
      (integration) => integration.organizationId === organizationId,
    ),
);

// API Functions

// Get all integrations
export const getIntegrations = api.get<
  never,
  {
    _embedded: { integrations: DeployIntegrationResponse[] };
    current_page: number;
    total_count: number;
  }
>("/integrations", { supervisor: cacheMinTimer() });

// Get a single integration by ID
export const getIntegration = api.get<
  { id: string },
  DeployIntegrationResponse
>("/integrations/:id", { supervisor: cacheMinTimer() });

// Create a new integration
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
>("/integrations");

// Update an existing integration
export interface UpdateIntegrationParams {
  id: string;
  name?: string;
}

export const updateIntegration = api.put<
  UpdateIntegrationParams,
  DeployIntegrationResponse
>("/integrations/:id");

// Delete an integration
export const deleteIntegration = api.delete<{ id: string }>(
  "/integrations/:id",
);

// Entity registration
export const entity = {
  name: "integration",
  url: "/integrations",
  urlId: extractIdFromLink,
  apiFunc: getIntegration,
  defaultEntity: defaultEntity({
    id: "integration",
    deserialize: deserializeIntegration,
    save: () => () => {},
  }),
  deserialize: deserializeIntegration,
};

// Exporting integrations entities for easy import elsewhere
export const integrationEntities = {
  integration: entity,
};
