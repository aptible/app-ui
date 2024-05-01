import { selectOrganizationSelectedId } from "@app/organizations";
import { useSelector } from "@app/react";
import { settingsUrl, teamRolesUrl } from "@app/routes";
import { Box, Breadcrumbs, Group } from "@app/ui/shared";
import { useParams } from "react-router";

export const GithubIntegrationPage = () => {
  const params = useParams();
  const orgId = useSelector(selectOrganizationSelectedId);

  return (
    <Group>
      <Breadcrumbs
        crumbs={[
          {
            name: "Settings",
            to: settingsUrl(),
          },
          {
            name: "GitHub Integration",
            to: teamRolesUrl(),
          },
        ]}
      />
      <Box>
        <pre>{orgId}</pre>
        <pre>{JSON.stringify(params, null, 2)}</pre>
      </Box>
    </Group>
  );
};
