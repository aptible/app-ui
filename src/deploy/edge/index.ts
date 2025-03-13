import { api, cacheMinTimer } from "@app/api";
import { createSelector } from "@app/fx";
import { defaultEntity } from "@app/hal";
import { type WebState, schema } from "@app/schema";
import type { ResourceType } from "@app/types";

export interface DeployEdge {
  id: string;
  relationshipType: string;
  sourceResourceId: string;
  sourceResourceType: ResourceType;
  destinationResourceId: string;
  destinationResourceType: ResourceType;
  createdAt: string;
  updatedAt: string;
}

export interface DeployEdgeResponse {
  id: number;
  relationship_type: string;
  created_at: string;
  updated_at: string;
  _links: {
    source_resource: { href: string };
    destination_resource: { href: string };
    self: { href: string };
  };
  _embedded: {
    source_resource: {
      id: number;
      _type: ResourceType;
    };
    destination_resource: {
      id: number;
      _type: ResourceType;
    };
  };
  _type: "edge";
}

export const deserializeDeployEdge = (
  payload: DeployEdgeResponse,
): DeployEdge => {
  return {
    id: `${payload.id}`,
    relationshipType: payload.relationship_type,
    sourceResourceId: `${payload._embedded.source_resource.id}`,
    sourceResourceType: payload._embedded.source_resource._type as ResourceType,
    destinationResourceId: `${payload._embedded.destination_resource.id}`,
    destinationResourceType: payload._embedded.destination_resource
      ._type as ResourceType,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
};

// Basic selectors
export const selectEdges = schema.edges.selectTableAsList;

// Custom selectors
export const selectEdgesBySourceResourceId = createSelector(
  selectEdges,
  (_: WebState, props: { sourceResourceId: string }) => props.sourceResourceId,
  (edges, sourceResourceId) => {
    if (sourceResourceId === "") {
      return edges;
    }
    return edges.filter((edge) => edge.sourceResourceId === sourceResourceId);
  },
);

export const selectEdgesByDestinationResourceId = createSelector(
  selectEdges,
  (_: WebState, props: { destinationResourceId: string }) =>
    props.destinationResourceId,
  (edges, destinationResourceId) => {
    if (destinationResourceId === "") {
      return edges;
    }
    return edges.filter(
      (edge) => edge.destinationResourceId === destinationResourceId,
    );
  },
);

export const selectEdgesByRelationshipType = createSelector(
  selectEdges,
  (_: WebState, props: { relationshipType: string }) => props.relationshipType,
  (edges, relationshipType) => {
    if (relationshipType === "") {
      return edges;
    }
    return edges.filter((edge) => edge.relationshipType === relationshipType);
  },
);

export const selectEdgesForResource = createSelector(
  selectEdges,
  (_: WebState, props: { resourceId: string; resourceType: ResourceType }) =>
    props,
  (edges, { resourceId, resourceType }) => {
    if (resourceId === "" || resourceType === "unknown") {
      return edges;
    }

    return edges.filter(
      (edge) =>
        (edge.sourceResourceId === resourceId &&
          edge.sourceResourceType === resourceType) ||
        (edge.destinationResourceId === resourceId &&
          edge.destinationResourceType === resourceType),
    );
  },
);

// API operations
export const fetchEdges = api.get(
  "/edges?per_page=5000",
  {
    supervisor: cacheMinTimer(),
  },
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }
    yield* schema.update(schema.edges.reset());
  },
);

export const fetchEdgesByResource = api.get<{
  resourceId: string;
  resourceType: ResourceType;
}>("/edges?resource_id=:resourceId&resource_type=:resourceType&per_page=5000");

export const createEdge = api.post<
  {
    sourceResourceId: string;
    sourceResourceType: ResourceType;
    destinationResourceId: string;
    destinationResourceType: ResourceType;
    relationshipType: string;
  },
  DeployEdgeResponse
>("/edges", function* (ctx, next) {
  const {
    sourceResourceId,
    sourceResourceType,
    destinationResourceId,
    destinationResourceType,
    relationshipType,
  } = ctx.payload;

  const body = {
    source_resource_id: sourceResourceId,
    source_resource_type: sourceResourceType,
    destination_resource_id: destinationResourceId,
    destination_resource_type: destinationResourceType,
    relationship_type: relationshipType,
  };

  ctx.request = ctx.req({
    body: JSON.stringify(body),
  });

  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  ctx.loader = { meta: { edgeId: ctx.json.value.id } };
});

export const edgeEntities = {
  edge: defaultEntity({
    id: "edge",
    deserialize: deserializeDeployEdge,
    save: schema.edges.add,
  }),
};
