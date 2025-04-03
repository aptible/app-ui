import {
  deleteLlmIntegration,
  fetchLlmIntegration,
  fetchLlmIntegrations,
  selectLlmIntegrationById,
  updateLlmIntegration,
} from "@app/deploy/llm-integration";
import {
  useCache,
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useQuery,
  useSelector,
} from "@app/react";
import { teamLlmIntegrationsUrl } from "@app/routes";
import type { DeployLlmIntegration } from "@app/types";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useValidator } from "../hooks";
import {
  BannerMessages,
  Box,
  Breadcrumbs,
  Button,
  FormGroup,
  Group,
  Input,
  tokens,
} from "../shared";

// Define form data interface
interface FormData {
  api_key?: string;
  base_url?: string;
  openai_organization?: string;
  api_version?: string;
  aws_access_key_id?: string;
  aws_secret_access_key?: string;
  aws_region?: string;
}

// Form validators
const validators = {
  // OpenAI and Anthropic validators
  api_key: (data: FormData, type?: string) => {
    if (
      (type === "OpenaiIntegration" ||
        type === "AzureIntegration" ||
        type === "AnthropicIntegration") &&
      !data.api_key
    ) {
      return "API Key is required";
    }
    return undefined;
  },

  // Azure validators
  base_url: (data: FormData, type?: string) => {
    if (type === "AzureIntegration" && !data.base_url) {
      return "Base URL is required";
    }
    return undefined;
  },
  api_version: (data: FormData, type?: string) => {
    if (type === "AzureIntegration" && !data.api_version) {
      return "API Version is required";
    }
    return undefined;
  },

  // AWS Bedrock validators
  aws_access_key_id: (data: FormData, type?: string) => {
    if (type === "BedrockIntegration" && !data.aws_access_key_id) {
      return "AWS Access Key ID is required";
    }
    return undefined;
  },
  aws_secret_access_key: (data: FormData, type?: string) => {
    if (
      type === "BedrockIntegration" &&
      data.aws_secret_access_key === "" // Only validate if it's empty string, not undefined (to allow keeping existing)
    ) {
      return "AWS Secret Access Key is required";
    }
    return undefined;
  },
  aws_region: (data: FormData, type?: string) => {
    if (type === "BedrockIntegration" && !data.aws_region) {
      return "AWS Region is required";
    }
    return undefined;
  },
};

// Format provider type for display
function formatProviderType(type: string): string {
  if (type === "OpenaiIntegration") return "OpenAI";
  if (type === "AzureIntegration") return "Azure OpenAI";
  if (type === "AnthropicIntegration") return "Anthropic";
  if (type === "BedrockIntegration") return "AWS Bedrock";
  return type.replace("Integration", "");
}

// OpenAI integration form component
function OpenAIForm({
  formData,
  setFormData,
  errors,
}: {
  formData: FormData;
  setFormData: (data: FormData) => void;
  errors: Record<string, string | undefined>;
}) {
  return (
    <>
      <FormGroup
        label="API Key"
        htmlFor="api_key"
        feedbackMessage={errors.api_key}
        feedbackVariant={errors.api_key ? "danger" : "info"}
        description="Enter a new API key or leave blank to keep the current one"
      >
        <Input
          id="api_key"
          name="api_key"
          type="password"
          value={formData.api_key || ""}
          onChange={(e) =>
            setFormData({ ...formData, api_key: e.currentTarget.value })
          }
          placeholder="Leave blank to keep current API key"
        />
      </FormGroup>

      <FormGroup label="Organization ID" htmlFor="openai_organization">
        <Input
          id="openai_organization"
          name="openai_organization"
          value={formData.openai_organization || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              openai_organization: e.currentTarget.value,
            })
          }
          placeholder="Optional: Your OpenAI organization ID"
        />
      </FormGroup>
    </>
  );
}

// Azure integration form component
function AzureForm({
  formData,
  setFormData,
  errors,
}: {
  formData: FormData;
  setFormData: (data: FormData) => void;
  errors: Record<string, string | undefined>;
}) {
  return (
    <>
      <FormGroup
        label="API Key"
        htmlFor="api_key"
        feedbackMessage={errors.api_key}
        feedbackVariant={errors.api_key ? "danger" : "info"}
        description="Enter a new API key or leave blank to keep the current one"
      >
        <Input
          id="api_key"
          name="api_key"
          type="password"
          value={formData.api_key || ""}
          onChange={(e) =>
            setFormData({ ...formData, api_key: e.currentTarget.value })
          }
          placeholder="Leave blank to keep current API key"
        />
      </FormGroup>

      <FormGroup
        label="Base URL"
        htmlFor="base_url"
        feedbackMessage={errors.base_url}
        feedbackVariant={errors.base_url ? "danger" : "info"}
      >
        <Input
          id="base_url"
          name="base_url"
          value={formData.base_url || ""}
          onChange={(e) =>
            setFormData({ ...formData, base_url: e.currentTarget.value })
          }
          placeholder="e.g., https://your-resource.openai.azure.com/openai"
        />
      </FormGroup>

      <FormGroup
        label="API Version"
        htmlFor="api_version"
        feedbackMessage={errors.api_version}
        feedbackVariant={errors.api_version ? "danger" : "info"}
      >
        <Input
          id="api_version"
          name="api_version"
          value={formData.api_version || ""}
          onChange={(e) =>
            setFormData({ ...formData, api_version: e.currentTarget.value })
          }
          placeholder="e.g., 2023-12-01-preview"
        />
      </FormGroup>
    </>
  );
}

// Anthropic integration form component
function AnthropicForm({
  formData,
  setFormData,
  errors,
}: {
  formData: FormData;
  setFormData: (data: FormData) => void;
  errors: Record<string, string | undefined>;
}) {
  return (
    <>
      <FormGroup
        label="API Key"
        htmlFor="api_key"
        feedbackMessage={errors.api_key}
        feedbackVariant={errors.api_key ? "danger" : "info"}
        description="Enter a new API key or leave blank to keep the current one"
      >
        <Input
          id="api_key"
          name="api_key"
          type="password"
          value={formData.api_key || ""}
          onChange={(e) =>
            setFormData({ ...formData, api_key: e.currentTarget.value })
          }
          placeholder="Leave blank to keep current API key"
        />
      </FormGroup>

      <FormGroup label="Base URL" htmlFor="base_url">
        <Input
          id="base_url"
          name="base_url"
          value={formData.base_url || ""}
          onChange={(e) =>
            setFormData({ ...formData, base_url: e.currentTarget.value })
          }
          placeholder="Optional: Custom base URL for Anthropic API"
        />
      </FormGroup>
    </>
  );
}

// AWS Bedrock integration form component
function BedrockForm({
  formData,
  setFormData,
  errors,
}: {
  formData: FormData;
  setFormData: (data: FormData) => void;
  errors: Record<string, string | undefined>;
}) {
  return (
    <>
      <FormGroup
        label="AWS Access Key ID"
        htmlFor="aws_access_key_id"
        feedbackMessage={errors.aws_access_key_id}
        feedbackVariant={errors.aws_access_key_id ? "danger" : "info"}
      >
        <Input
          id="aws_access_key_id"
          name="aws_access_key_id"
          value={formData.aws_access_key_id || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              aws_access_key_id: e.currentTarget.value,
            })
          }
          placeholder="Your AWS Access Key ID"
        />
      </FormGroup>

      <FormGroup
        label="AWS Secret Access Key"
        htmlFor="aws_secret_access_key"
        feedbackMessage={errors.aws_secret_access_key}
        feedbackVariant={errors.aws_secret_access_key ? "danger" : "info"}
        description="Enter a new secret key or leave blank to keep the current one"
      >
        <Input
          id="aws_secret_access_key"
          name="aws_secret_access_key"
          type="password"
          value={formData.aws_secret_access_key || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              aws_secret_access_key: e.currentTarget.value,
            })
          }
          placeholder="Leave blank to keep current secret key"
        />
      </FormGroup>

      <FormGroup
        label="AWS Region"
        htmlFor="aws_region"
        feedbackMessage={errors.aws_region}
        feedbackVariant={errors.aws_region ? "danger" : "info"}
      >
        <Input
          id="aws_region"
          name="aws_region"
          value={formData.aws_region || ""}
          onChange={(e) =>
            setFormData({ ...formData, aws_region: e.currentTarget.value })
          }
          placeholder="e.g., us-east-1"
        />
      </FormGroup>
    </>
  );
}

// Render form fields based on integration type
function IntegrationForm({
  integration,
  onSubmit,
  loader,
}: {
  integration: DeployLlmIntegration;
  onSubmit: (formData: FormData) => void;
  loader: {
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    message: string;
  };
}) {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    api_key: "",
    base_url: integration.baseUrl,
    openai_organization: integration.openaiOrganization,
    api_version: integration.apiVersion,
    aws_access_key_id: integration.awsAccessKeyId,
    aws_secret_access_key: "",
    aws_region: integration.awsRegion,
  });

  // Update form data when integration data loads
  useEffect(() => {
    setFormData({
      api_key: "", // Don't prefill sensitive data
      base_url: integration.baseUrl,
      openai_organization: integration.openaiOrganization,
      api_version: integration.apiVersion,
      aws_access_key_id: integration.awsAccessKeyId,
      aws_secret_access_key: "", // Don't prefill sensitive data
      aws_region: integration.awsRegion,
    });
  }, [
    integration.id,
    integration.baseUrl,
    integration.openaiOrganization,
    integration.apiVersion,
    integration.awsAccessKeyId,
    integration.awsRegion,
  ]);

  // Validation
  const [errors, validate] = useValidator<FormData, typeof validators>(
    validators,
  );

  // Form submission handler
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validate form with the selected provider type
    if (!validate(formData, integration.providerType)) {
      return;
    }
    onSubmit(formData);
  };

  // Render the appropriate form based on integration type
  const renderTypeSpecificForm = () => {
    switch (integration.providerType) {
      case "OpenaiIntegration":
        return (
          <OpenAIForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        );
      case "AzureIntegration":
        return (
          <AzureForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        );
      case "AnthropicIntegration":
        return (
          <AnthropicForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        );
      case "BedrockIntegration":
        return (
          <BedrockForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        );
      default:
        return (
          <div>Unsupported integration type: {integration.providerType}</div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Group>
        <BannerMessages {...loader} />

        <FormGroup
          label="LLM Provider"
          htmlFor="provider_type"
          description="Provider type cannot be changed after creation."
        >
          <Input
            id="provider_type"
            name="provider_type"
            value={formatProviderType(integration.providerType)}
            disabled
          />
        </FormGroup>

        {renderTypeSpecificForm()}

        <div className="mt-4">
          <Button type="submit" isLoading={loader.isLoading}>
            Save Changes
          </Button>
        </div>
      </Group>
    </form>
  );
}

export function SettingsTeamLlmIntegrationsEditPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id = "" } = useParams<{ id: string }>();

  useQuery(fetchLlmIntegration({ id }));
  const integration = useSelector((s) => selectLlmIntegrationById(s, { id }));

  // Set up API actions
  const [updateAction, setUpdateAction] = useState(() =>
    updateLlmIntegration({ id }),
  );
  const loader = useLoader(updateAction);

  // Set up delete action
  const deleteAction = deleteLlmIntegration({ id });
  const deleteLoader = useLoader(deleteAction);

  // Set up integrations fetch for refreshing the list
  const integrationsCache = useCache(fetchLlmIntegrations());

  // Handle success for update
  useLoaderSuccess(loader, () => {
    navigate(teamLlmIntegrationsUrl());
  });

  // Handle success for delete
  useLoaderSuccess(deleteLoader, () => {
    // Refresh the integrations list before navigating
    integrationsCache.trigger();
    navigate(teamLlmIntegrationsUrl());
  });

  // Submission handler - update the action with form data
  const handleSubmit = (formData: FormData) => {
    // Only include fields that are defined (to keep current values if not changed)
    const updatePayload: Record<string, any> = { id };

    // Only include api_key if it's not empty (to keep existing value)
    if (formData.api_key) {
      updatePayload.api_key = formData.api_key;
    }

    // Include other fields if they're defined
    if (formData.base_url !== undefined) {
      updatePayload.base_url = formData.base_url;
    }

    if (formData.openai_organization !== undefined) {
      updatePayload.openai_organization = formData.openai_organization;
    }

    if (formData.api_version !== undefined) {
      updatePayload.api_version = formData.api_version;
    }

    if (formData.aws_access_key_id !== undefined) {
      updatePayload.aws_access_key_id = formData.aws_access_key_id;
    }

    // Only include aws_secret_access_key if it's not empty (to keep existing value)
    if (formData.aws_secret_access_key) {
      updatePayload.aws_secret_access_key = formData.aws_secret_access_key;
    }

    if (formData.aws_region !== undefined) {
      updatePayload.aws_region = formData.aws_region;
    }

    const action = updateLlmIntegration({ id, ...updatePayload });
    setUpdateAction(action);
    dispatch(action);
  };

  // Handler for delete action
  const handleDelete = () => {
    dispatch(deleteAction);
  };

  // Navigate away if id is missing
  useEffect(() => {
    if (!id) {
      navigate(teamLlmIntegrationsUrl());
    }
  }, [id, navigate]);

  // Show nothing while navigating away for missing ID
  if (!id || !integration) {
    return null;
  }

  return (
    <Group>
      <Breadcrumbs
        crumbs={[
          {
            name: "AI/LLM Integrations",
            to: teamLlmIntegrationsUrl(),
          },
          { name: "Edit LLM Integration", to: null },
        ]}
      />

      <Box>
        <IntegrationForm
          integration={integration}
          onSubmit={handleSubmit}
          loader={loader}
        />
      </Box>

      <Box>
        <Group>
          <BannerMessages {...deleteLoader} />

          <h3 className={tokens.type.h3}>Delete LLM Integration</h3>

          <div>
            <Button
              variant="delete"
              onClick={handleDelete}
              requireConfirm
              isLoading={deleteLoader.isLoading}
            >
              Delete Integration
            </Button>
          </div>
        </Group>
      </Box>
    </Group>
  );
}
