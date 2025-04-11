import {
  fetchCustomResources,
  selectCustomResourceById,
} from "@app/deploy/custom-resource";
import { useQuery, useSelector } from "@app/react";
import { softwareCatalogUrl } from "@app/routes";
import type { ResourceItem } from "@app/search";
import { useParams } from "react-router-dom";
import { AppSidebarLayout } from "../layouts";
import {
  Box,
  ButtonLink,
  Code,
  FormGroup,
  Group,
  Input,
  TitleBar,
} from "../shared";
import { SingleResourceDependencyGraph } from "../shared/dependencies";
import { DiagnosticsCreateForm } from "./diagnostics-create";

export const CustomResourceDetailPage = () => {
  const { id = "" } = useParams();

  const { isSuccess: isResourcesLoaded } = useQuery(fetchCustomResources());
  const resource = useSelector((s) => selectCustomResourceById(s, { id }));

  if (!resource) {
    return (
      <AppSidebarLayout>
        <TitleBar description="Loading resource details...">
          Software Catalog Details
        </TitleBar>
      </AppSidebarLayout>
    );
  }

  // Convert the custom resource to a generic resource item
  const resourceItem: ResourceItem = {
    type: "custom_resource",
    id: resource.id,
    data: resource,
  };

  return (
    <AppSidebarLayout>
      <TitleBar description="View resource details">{resource.handle}</TitleBar>

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

        <h2 className="text-lg font-medium my-4">Resource Data</h2>
        <div className="font-mono flex w-fit">
          <Code className="bg-gray-50">
            <pre className="p-2 whitespace-pre-wrap">
              {JSON.stringify(resource.data, null, 2)}
            </pre>
          </Code>
        </div>
      </Box>

      <Box>
        <h2 className="text-lg font-medium mb-4">Relationships</h2>
        {isResourcesLoaded && (
          <SingleResourceDependencyGraph resourceItem={resourceItem} />
        )}
      </Box>

      <Box>
        <DiagnosticsCreateForm
          resourceId={id}
          resourceType="CustomResource"
          resourceName={resource.handle}
        />
      </Box>

      <Group className="mt-4 flex w-fit">
        <ButtonLink to={softwareCatalogUrl()} size="md">
          Back to Software Catalog
        </ButtonLink>
      </Group>
    </AppSidebarLayout>
  );
};
