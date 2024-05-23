import { selectPortalUrl } from "@app/config";
import {
  createGithubIntegration,
  deleteGithubIntegration,
  fetchGithubIntegrations,
  selectGithubIntegrationsAsList,
} from "@app/github-integration";
import { useLoader, useQuery, useSelector } from "@app/react";
import { settingsUrl, teamGithubIntegrationUrl } from "@app/routes";
import {
  ActionBar,
  Banner,
  Breadcrumbs,
  Button,
  ButtonLink,
  EmptyTr,
  FilterBar,
  Group,
  IconGithub,
  LoadingBar,
  LoadingSpinner,
  Pill,
  TBody,
  THead,
  Table,
  Td,
  Th,
  Tr,
} from "@app/ui/shared";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch } from "starfx/react";

export const GithubIntegrationPage = () => {
  const dispatch = useDispatch();
  const { isLoading } = useQuery(fetchGithubIntegrations());
  const githubIntegrations = useSelector(selectGithubIntegrationsAsList);

  const portalUrl = useSelector(selectPortalUrl);
  const installUrl = `${portalUrl}/github_integrations/install`;

  /*
   * If an installation_id is provided as a query parameter (i.e. the user
   * was redirected back to this page after installing the GitHub App) and
   * there are no existing integrations, create a new one for the
   * organization.
   */
  const [searchParams] = useSearchParams();
  const installationId = searchParams.get("installation_id") || "";
  const installAction = createGithubIntegration({ installationId });
  const {
    isLoading: isInstalling,
    isError: isInstallError,
    message: installError,
  } = useLoader(installAction);
  useEffect(() => {
    if (!isLoading && installationId) {
      dispatch(installAction);
    }
  }, [isLoading, searchParams]);

  return (
    <Group>
      <Group size="sm">
        <Breadcrumbs
          crumbs={[
            {
              name: "Settings",
              to: settingsUrl(),
            },
            {
              name: "GitHub Integration",
              to: teamGithubIntegrationUrl(),
            },
          ]}
        />

        <FilterBar>
          <div className="flex justify-end">
            <ActionBar>
              <ButtonLink to={installUrl}>
                <IconGithub variant="sm" className="mr-2" />
                Connect a GitHub Account
              </ButtonLink>
            </ActionBar>
          </div>

          <Group variant="horizontal" size="sm" className="items-center">
            <LoadingBar isLoading={isLoading} />
          </Group>
        </FilterBar>
      </Group>

      <Table>
        <THead>
          <Th>Account</Th>
          <Th>Status</Th>
          <Th variant="center">Actions</Th>
        </THead>
        <TBody>
          {isInstalling && (
            <EmptyTr colSpan={3}>
              <Group variant="horizontal" className="justify-center">
                <LoadingSpinner variant="sm" />
                Installing GitHub Integration...
              </Group>
            </EmptyTr>
          )}
          {isInstallError && (
            <EmptyTr colSpan={3}>
              <Banner variant="error">
                An error occurred while installing the GitHub Integration:{" "}
                {installError}
              </Banner>
            </EmptyTr>
          )}
          {!isInstalling && githubIntegrations.length === 0 ? (
            <EmptyTr colSpan={3}>No GitHub integrations configured</EmptyTr>
          ) : null}
          {githubIntegrations.map((gh) => (
            <Tr key={gh.id}>
              <Td>
                <div className="flex align-middle gap-2">
                  <img
                    className="w-6 h-6 rounded-full"
                    src={gh.avatarUrl}
                    alt="Rounded avatar"
                  />
                  <div>{gh.accountName}</div>
                </div>
              </Td>
              <Td>
                {gh.active && <Pill variant="success">Active</Pill>}
                {gh.installed && !gh.active && (
                  <Pill variant="pending">Suspended</Pill>
                )}
                {!gh.installed && !gh.active && (
                  <Pill variant="error">Not Installed</Pill>
                )}
              </Td>
              <Td className="w-48">
                <div className="flex flex-row gap-1 mx-4">
                  <ButtonLink
                    to={gh.installationUrl}
                    size="sm"
                    className="w-fit"
                  >
                    Manage
                  </ButtonLink>
                  <Button
                    variant="delete"
                    onClick={() =>
                      dispatch(deleteGithubIntegration({ id: gh.id }))
                    }
                    requireConfirm
                    size="sm"
                  >
                    Uninstall
                  </Button>
                </div>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </Group>
  );
};
