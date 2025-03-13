import {
  fetchCustomResources,
  selectCustomResourceById,
  selectCustomResourcesByIds,
} from "@app/deploy/custom-resource";
import { fetchEdgesByResource, selectEdgesForResource } from "@app/deploy/edge";
import { useQuery, useSelector } from "@app/react";
import { customResourcesUrl } from "@app/routes";
import type { DeployCustomResource, DeployEdge } from "@app/types";
import { useParams } from "react-router-dom";
import { AppSidebarLayout } from "../layouts";
import {
  Box,
  ButtonLink,
  FormGroup,
  Group,
  Input,
  KeyValueGroup,
  Pill,
  TitleBar,
} from "../shared";

const CUSTOM_RESOURCE_TYPE = "custom_resource";

const getRelatedCustomResourceIds = (edges: DeployEdge[]) => {
  const relatedCustomResourceIds: Set<string> = new Set();

  for (const edge of edges) {
    if (edge.sourceResourceType === CUSTOM_RESOURCE_TYPE) {
      relatedCustomResourceIds.add(edge.sourceResourceId);
    }

    if (edge.destinationResourceType === CUSTOM_RESOURCE_TYPE) {
      relatedCustomResourceIds.add(edge.destinationResourceId);
    }
  }

  return Array.from(relatedCustomResourceIds);
};

export const CustomResourceDetailPage = () => {
  const { id = "" } = useParams();

  useQuery(fetchCustomResources());
  useQuery(
    fetchEdgesByResource({
      resourceId: id,
      resourceType: CUSTOM_RESOURCE_TYPE,
    }),
  );

  const resource = useSelector((s) => selectCustomResourceById(s, { id }));
  const edges = useSelector((s) =>
    selectEdgesForResource(s, {
      resourceId: id,
      resourceType: CUSTOM_RESOURCE_TYPE,
    }),
  );
  const relatedCustomResourceIds = getRelatedCustomResourceIds(edges);
  const customResources = useSelector((s) =>
    selectCustomResourcesByIds(s, { ids: relatedCustomResourceIds }),
  );

  if (!resource) {
    return (
      <AppSidebarLayout>
        <TitleBar description="Loading custom resource details...">
          Custom Resource Details
        </TitleBar>
      </AppSidebarLayout>
    );
  }

  // Convert data object to array of { key, value } objects
  const dataEntries = Object.entries(resource.data).map(([key, value]) => ({
    key,
    value: typeof value === "string" ? value : JSON.stringify(value),
  }));

  return (
    <AppSidebarLayout>
      <TitleBar description="View custom resource details">
        {resource.handle}
      </TitleBar>

      <Box className="mb-4">
        <h2 className="text-lg font-medium mb-4">Resource Details</h2>
        <form>
          <FormGroup label="Handle" htmlFor="handle">
            <Input id="handle" type="text" value={resource.handle} disabled />
          </FormGroup>
          <FormGroup label="Type" htmlFor="resourceType" className="mt-4">
            <Input
              id="resourceType"
              type="text"
              value={resource.resourceType}
              disabled
            />
          </FormGroup>
        </form>
      </Box>

      <Box>
        <h2 className="text-lg font-medium mb-4">Resource Data</h2>
        <div className="font-mono flex w-fit">
          <KeyValueGroup data={dataEntries} />
        </div>
      </Box>

      <Box>
        <h2 className="text-lg font-medium mb-4">Relationships</h2>
        <div className="flex w-fit">
          {edges.map((edge) => (
            <ResourceRelationship
              key={edge.id}
              edge={edge}
              customResources={customResources}
            />
          ))}
        </div>
      </Box>

      <Group className="mt-4 flex w-fit">
        <ButtonLink to={customResourcesUrl()} size="md">
          Back to Custom Resources
        </ButtonLink>
      </Group>
    </AppSidebarLayout>
  );
};

const ResourceRelationship = ({
  edge,
  customResources,
}: {
  edge: DeployEdge;
  customResources: Record<string, DeployCustomResource>;
}) => {
  return (
    <div className="flex items-center gap-2">
      {customResources[edge.sourceResourceId]?.handle}
      <Pill>{edge.relationshipType}</Pill>
      {customResources[edge.destinationResourceId]?.handle}
    </div>
  );
};
