import {
  fetchCustomResource,
  selectCustomResourceById,
} from "@app/deploy/custom-resource";
import { useQuery, useSelector } from "@app/react";
import { customResourcesUrl } from "@app/routes";
import { useParams } from "react-router-dom";
import { AppSidebarLayout } from "../layouts";
import {
  Box,
  ButtonLink,
  FormGroup,
  Group,
  Input,
  KeyValueGroup,
  TitleBar,
} from "../shared";

export const CustomResourceDetailPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchCustomResource({ id }));

  const resource = useSelector((s) => selectCustomResourceById(s, { id }));

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

      <Group className="mt-4 flex w-fit">
        <ButtonLink to={customResourcesUrl()} size="md">
          Back to Custom Resources
        </ButtonLink>
      </Group>
    </AppSidebarLayout>
  );
};
