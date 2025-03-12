import {
  fetchIntegrations,
  selectIntegrationsAsList,
} from "@app/deploy/integration";
import { useQuery, useSelector } from "@app/react";
import {
  teamDiagnosticsIntegrationsAddUrl,
  teamDiagnosticsIntegrationsEditUrl,
} from "@app/routes";
import type { DeployIntegration } from "@app/types";
import {
  ActionBar,
  ButtonLink,
  EmptyTr,
  Group,
  IconPlusCircle,
  TBody,
  THead,
  Table,
  Td,
  Th,
  TitleBar,
  Tr,
  tokens,
} from "../shared";

// Format the integration type for display
function formatIntegrationType(type: string): string {
  if (type === "ElasticsearchIntegration") return "Elasticsearch";
  return type.replace("Integration", "");
}

function IntegrationRow({ integration }: { integration: DeployIntegration }) {
  return (
    <Tr key={integration.id}>
      <Td>
        <div className={tokens.type.darker}>
          {formatIntegrationType(integration.type)}
        </div>
        {integration.host && (
          <div className="text-sm text-black-500">{integration.host}</div>
        )}
      </Td>
      <Td variant="right">
        <ButtonLink
          to={teamDiagnosticsIntegrationsEditUrl(integration.id)}
          size="sm"
          className="w-fit justify-self-end inline-flex"
        >
          Edit
        </ButtonLink>
      </Td>
    </Tr>
  );
}

export function SettingsTeamDiagnosticsIntegrationsPage() {
  useQuery(fetchIntegrations());
  const integrations = useSelector(selectIntegrationsAsList);

  return (
    <Group>
      <TitleBar description="Manage external system integrations for diagnostics features">
        Diagnostics Integrations
      </TitleBar>

      <div className="flex justify-end mb-4">
        <ActionBar>
          <ButtonLink to={teamDiagnosticsIntegrationsAddUrl()}>
            <IconPlusCircle variant="sm" className="mr-2" />
            Add Integration
          </ButtonLink>
        </ActionBar>
      </div>

      <Table>
        <THead>
          <Th>Integration</Th>
          <Th variant="right">Actions</Th>
        </THead>

        <TBody>
          {integrations.length === 0 ? (
            <EmptyTr colSpan={2}>
              No integrations found. Add an integration to connect external
              systems.
            </EmptyTr>
          ) : (
            integrations.map((integration) => (
              <IntegrationRow key={integration.id} integration={integration} />
            ))
          )}
        </TBody>
      </Table>
    </Group>
  );
}
