import { schema } from "@app/schema";
import { api, combinePages } from "@app/api";
import { DeployCustomResource } from "@app/types";

export interface CustomResourceIdProp {
  id: string;
}

export interface CustomResourceResponse {
  id: string;
  name: string;
  description: string;
  status: string;
  resource_type: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  _links: {
    organization: {
      href: string;
    };
  };
  _type: "custom_resource";
}

export const fetchCustomResources = api.get(
  "/custom_resources?per_page=100",
  {},
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }
    
    yield* schema.update(schema.customResources.reset());
    
    yield* combinePages(ctx.json.json, fetchCustomResourcesPage);
  }
);

export const fetchCustomResourcesPage = api.get<{url: string}>(
  (props) => props.url,
  function* (ctx, next) {
    yield* next();
  }
);

export const fetchCustomResource = api.get<CustomResourceIdProp>(
  "/custom_resources/:id"
);

// Format the custom resource type for display
export const formatCustomResourceType = (type: string): string => {
  if (type === "custom_resource") {
    return "Custom Resource";
  }
  return type;
};

export interface CustomResourceProps {
  organizationId: string;
  name: string;
  description: string;
  resourceType: string;
  metadata: Record<string, any>;
}

export const createCustomResource = api.post<CustomResourceProps, CustomResourceResponse>(
  "/organizations/:organizationId/custom_resources",
  function* (ctx, next) {
    const { name, description, resourceType, metadata } = ctx.req.props;
    ctx.req.json = {
      name,
      description,
      resource_type: resourceType,
      metadata
    };
    yield* next();
  }
);

export const updateCustomResource = api.put<CustomResourceIdProp & Partial<CustomResourceProps>, CustomResourceResponse>(
  "/custom_resources/:id",
  function* (ctx, next) {
    const { name, description, resourceType, metadata } = ctx.req.props;
    ctx.req.json = {
      ...(name && { name }),
      ...(description && { description }),
      ...(resourceType && { resource_type: resourceType }),
      ...(metadata && { metadata })
    };
    yield* next();
  }
);

export const deleteCustomResource = api.delete<CustomResourceIdProp>(
  "/custom_resources/:id"
);