import { createLlmIntegration } from "@app/deploy/llm-integration";
import { selectOrganizationSelected } from "@app/organizations";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useSelector,
} from "@app/react";
import { teamLlmIntegrationsUrl } from "@app/routes";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useValidator } from "../hooks";
import {
  BannerMessages,
  Box,
  Breadcrumbs,
  Button,
  FormGroup,
  Group,
  Input,
  Select,
} from "../shared";

// Define LLM integration types
const LLM_INTEGRATION_TYPES = [
  { value: "", label: "Select LLM Provider" },
  { value: "OpenaiIntegration", label: "OpenAI" },
  { value: "AzureIntegration", label: "Azure" },
  { value: "AnthropicIntegration", label: "Anthropic" },
  { value: "BedrockIntegration", label: "AWS Bedrock" },
];

// Define form data interface
interface FormData {
  provider_type: string;
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
  provider_type: (data: FormData) =>
    data.provider_type ? undefined : "Please select a provider type",

  // OpenAI and Anthropic validators
  api_key: (data: FormData) => {
    if (
      (data.provider_type === "OpenaiIntegration" ||
        data.provider_type === "AzureIntegration" ||
        data.provider_type === "AnthropicIntegration") &&
      !data.api_key
    ) {
      return "API Key is required";
    }
    return undefined;
  },

  // Azure validators
  base_url: (data: FormData) => {
    if (data.provider_type === "AzureIntegration" && !data.base_url) {
      return "Base URL is required";
    }
    return undefined;
  },
  api_version: (data: FormData) => {
    if (data.provider_type === "AzureIntegration" && !data.api_version) {
      return "API Version is required";
    }
    return undefined;
  },

  // AWS Bedrock validators
  aws_access_key_id: (data: FormData) => {
    if (
      data.provider_type === "BedrockIntegration" &&
      !data.aws_access_key_id
    ) {
      return "AWS Access Key ID is required";
    }
    return undefined;
  },
  aws_secret_access_key: (data: FormData) => {
    if (
      data.provider_type === "BedrockIntegration" &&
      !data.aws_secret_access_key
    ) {
      return "AWS Secret Access Key is required";
    }
    return undefined;
  },
  aws_region: (data: FormData) => {
    if (data.provider_type === "BedrockIntegration" && !data.aws_region) {
      return "AWS Region is required";
    }
    return undefined;
  },
};

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
      >
        <Input
          id="api_key"
          name="api_key"
          type="password"
          value={formData.api_key || ""}
          onChange={(e) =>
            setFormData({ ...formData, api_key: e.currentTarget.value })
          }
          placeholder="Your OpenAI API key"
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
      >
        <Input
          id="api_key"
          name="api_key"
          type="password"
          value={formData.api_key || ""}
          onChange={(e) =>
            setFormData({ ...formData, api_key: e.currentTarget.value })
          }
          placeholder="Your Azure OpenAI API key"
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
          placeholder="e.g., https://example-endpoint.openai.azure.com"
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
      >
        <Input
          id="api_key"
          name="api_key"
          type="password"
          value={formData.api_key || ""}
          onChange={(e) =>
            setFormData({ ...formData, api_key: e.currentTarget.value })
          }
          placeholder="Your Anthropic API key"
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
          placeholder="Your AWS Secret Access Key"
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

export function SettingsTeamLlmIntegrationsAddPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const org = useSelector(selectOrganizationSelected);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    provider_type: "",
  });

  // Validation
  const [errors, validate] = useValidator<FormData, typeof validators>(
    validators,
  );

  // Set up API action
  const action = createLlmIntegration({
    provider_type: formData.provider_type,
    organization_id: org.id,
    api_key: formData.api_key,
    base_url: formData.base_url,
    openai_organization: formData.openai_organization,
    api_version: formData.api_version,
    aws_access_key_id: formData.aws_access_key_id,
    aws_secret_access_key: formData.aws_secret_access_key,
    aws_region: formData.aws_region,
  });

  const loader = useLoader(action);

  // Form submission
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate(formData)) {
      return;
    }
    dispatch(action);
  };

  // Handle success
  useLoaderSuccess(loader, () => {
    navigate(teamLlmIntegrationsUrl());
  });

  // Render form fields based on selected integration type
  const renderIntegrationForm = () => {
    switch (formData.provider_type) {
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
        return null;
    }
  };

  return (
    <Group>
      <Breadcrumbs
        crumbs={[
          {
            name: "LLM Integrations",
            to: teamLlmIntegrationsUrl(),
          },
          { name: "Add LLM Integration", to: null },
        ]}
      />

      <Box>
        <form onSubmit={onSubmit}>
          <Group>
            <BannerMessages {...loader} />

            <FormGroup
              label="LLM Provider"
              htmlFor="provider_type"
              feedbackMessage={errors.provider_type}
              feedbackVariant={errors.provider_type ? "danger" : "info"}
            >
              <Select
                id="provider_type"
                options={LLM_INTEGRATION_TYPES}
                onSelect={(opt) =>
                  setFormData({ ...formData, provider_type: opt.value })
                }
                value={formData.provider_type}
              />
            </FormGroup>

            {renderIntegrationForm()}

            <div className="mt-4">
              <Button
                type="submit"
                isLoading={loader.isLoading}
                disabled={formData.provider_type === ""}
              >
                Add LLM Integration
              </Button>
            </div>
          </Group>
        </form>
      </Box>
    </Group>
  );
}
