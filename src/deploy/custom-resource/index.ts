import { api } from "@app/api";
import { createSelector } from "@app/fx";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import { type WebState, schema } from "@app/schema";
import type { DeployCustomResource, LinkResponse } from "@app/types";

export interface DeployCustomResourceResponse {
  id: number;
  handle: string;
  resource_type: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  _links: {
    organization: LinkResponse;
    self: LinkResponse;
  };
  _type: "custom_resource";
}

export const deserializeDeployCustomResource = (
  payload: DeployCustomResourceResponse,
): DeployCustomResource => {
  const links = payload._links;

  return {
    id: `${payload.id}`,
    handle: payload.handle,
    resourceType: payload.resource_type,
    organizationId: extractIdFromLink(links.organization),
    data: payload.data || {},
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
};

export const defaultCustomResourceResponse = (
  p: Partial<DeployCustomResourceResponse> = {},
): DeployCustomResourceResponse => {
  const now = new Date().toISOString();
  return {
    id: 1,
    handle: "",
    resource_type: "",
    data: {},
    created_at: now,
    updated_at: now,
    deleted_at: null,
    _links: {
      organization: { href: "" },
      self: { href: "" },
      ...p._links,
    },
    ...p,
    _type: "custom_resource",
  };
};

export const selectCustomResourceById = schema.customResources.selectById;
export const selectCustomResourcesAsList =
  schema.customResources.selectTableAsList;

export const selectCustomResourcesByResourceType = createSelector(
  selectCustomResourcesAsList,
  (_: WebState, props: { resourceType: string }) => props.resourceType,
  (resources, resourceType) => {
    if (resourceType === "") {
      return resources;
    }
    return resources.filter(
      (resource) => resource.resourceType === resourceType,
    );
  },
);

export const fetchCustomResources = api.get("/custom_resources");

export const fetchCustomResource = api.get<{ id: string }>(
  "/custom_resources/:id",
);

export interface CreateCustomResourceProps {
  handle: string;
  organizationId: string;
  resourceType: string;
  data: Record<string, any>;
}

export const createCustomResource = api.post<
  CreateCustomResourceProps,
  DeployCustomResourceResponse
>("/custom_resources", function* (ctx, next) {
  const { handle, organizationId, resourceType, data } = ctx.payload;
  const body = {
    handle,
    organization_id: organizationId,
    resource_type: resourceType,
    data,
  };
  ctx.request = ctx.req({
    body: JSON.stringify(body),
  });

  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  ctx.loader = { meta: { customResourceId: ctx.json.value.id } };
});

export const customResourceEntities = {
  custom_resource: defaultEntity({
    id: "custom_resource",
    deserialize: deserializeDeployCustomResource,
    save: schema.customResources.add,
  }),
};
