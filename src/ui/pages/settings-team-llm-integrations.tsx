import {
  fetchLlmIntegrations,
  selectLlmIntegrationsAsList,
} from "@app/deploy/llm-integration";
import { useQuery, useSelector } from "@app/react";
import {
  teamLlmIntegrationsAddUrl,
  teamLlmIntegrationsEditUrl,
} from "@app/routes";
import type { DeployLlmIntegration } from "@app/types";
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

// Format the provider type for display
function formatProviderType(type: string): string {
  if (type === "OpenaiIntegration") return "OpenAI";
  if (type === "AzureIntegration") return "Azure OpenAI";
  if (type === "AnthropicIntegration") return "Anthropic";
  if (type === "BedrockIntegration") return "AWS Bedrock";
  return type.replace("Integration", "");
}

function LlmIntegrationRow({
  integration,
}: { integration: DeployLlmIntegration }) {
  return (
    <Tr key={integration.id}>
      <Td>
        <div className={tokens.type.darker}>
          {formatProviderType(integration.providerType)}
        </div>
        {integration.baseUrl && (
          <div className="text-sm text-black-500">{integration.baseUrl}</div>
        )}
      </Td>
      <Td variant="right">
        <ButtonLink
          to={teamLlmIntegrationsEditUrl(integration.id)}
          size="sm"
          className="w-fit justify-self-end inline-flex"
        >
          Edit
        </ButtonLink>
      </Td>
    </Tr>
  );
}

export function SettingsTeamLlmIntegrationsPage() {
  useQuery(fetchLlmIntegrations());
  const integrations = useSelector(selectLlmIntegrationsAsList);

  return (
    <Group>
      <TitleBar description="Manage LLM integrations for advanced features">
        LLM Integrations
      </TitleBar>

      <div className="flex justify-end mb-4">
        <ActionBar>
          <ButtonLink to={teamLlmIntegrationsAddUrl()}>
            <IconPlusCircle variant="sm" className="mr-2" />
            Add LLM Integration
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
              No LLM integrations found. Add an integration to use LLM features.
            </EmptyTr>
          ) : (
            integrations.map((integration) => (
              <LlmIntegrationRow
                key={integration.id}
                integration={integration}
              />
            ))
          )}
        </TBody>
      </Table>
    </Group>
  );
}
