import {
  deleteIntegration,
  fetchIntegration,
  fetchIntegrations,
  selectIntegrationById,
  updateIntegration,
} from "@app/deploy/integration";
import {
  useCache,
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useQuery,
  useSelector,
} from "@app/react";
import { teamDiagnosticsIntegrationsUrl } from "@app/routes";
import type { DeployIntegration } from "@app/types";
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
  host?: string;
  port?: string;
  username?: string;
  password?: string;
}

// Form validators
const validators = {
  host: (data: FormData) => (!data.host ? "Host is required" : undefined),
};

// Format integration type for display
function formatIntegrationType(type: string): string {
  if (type === "ElasticsearchIntegration") return "Elasticsearch";
  return type.replace("Integration", "");
}

// Elasticsearch integration form component
function ElasticsearchForm({
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
        label="Host"
        htmlFor="host"
        feedbackMessage={errors.host}
        feedbackVariant={errors.host ? "danger" : "info"}
      >
        <Input
          id="host"
          name="host"
          value={formData.host || ""}
          onChange={(e) =>
            setFormData({ ...formData, host: e.currentTarget.value })
          }
          placeholder="e.g., es.example.com"
        />
      </FormGroup>

      <FormGroup label="Port" htmlFor="port">
        <Input
          id="port"
          name="port"
          value={formData.port || ""}
          onChange={(e) =>
            setFormData({ ...formData, port: e.currentTarget.value })
          }
          placeholder="e.g., 9200"
        />
      </FormGroup>

      <FormGroup label="Username" htmlFor="username">
        <Input
          id="username"
          name="username"
          value={formData.username || ""}
          onChange={(e) =>
            setFormData({ ...formData, username: e.currentTarget.value })
          }
        />
      </FormGroup>

      <FormGroup label="Password" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password || ""}
          onChange={(e) =>
            setFormData({ ...formData, password: e.currentTarget.value })
          }
          placeholder="Leave blank to keep current password"
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
  integration: DeployIntegration;
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
    host: integration.host,
    port: integration.port,
    username: integration.username,
    password: "", // Don't prefill password for security reasons
  });

  // Update form data when integration data loads
  useEffect(() => {
    setFormData({
      host: integration.host,
      port: integration.port,
      username: integration.username,
      password: "", // Don't prefill password
    });
  }, [
    integration.id,
    integration.host,
    integration.port,
    integration.username,
  ]);

  // Validation
  const [errors, validate] = useValidator<FormData, typeof validators>(
    validators,
  );

  // Form submission handler
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate(formData)) {
      return;
    }
    onSubmit(formData);
  };

  // Render the appropriate form based on integration type
  const renderTypeSpecificForm = () => {
    switch (integration.type) {
      case "ElasticsearchIntegration":
        return (
          <ElasticsearchForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        );
      default:
        return <div>Unsupported integration type: {integration.type}</div>;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Group>
        <BannerMessages {...loader} />

        <FormGroup
          label="Integration Type"
          htmlFor="type"
          description="Integration type cannot be changed after creation."
        >
          <Input
            id="type"
            name="type"
            value={formatIntegrationType(integration.type)}
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

export function SettingsTeamDiagnosticsIntegrationsEditPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id = "" } = useParams<{ id: string }>();

  useQuery(fetchIntegration({ id }));
  const integration = useSelector((s) => selectIntegrationById(s, { id }));

  // Set up API actions
  const [updateAction, setUpdateAction] = useState(() =>
    updateIntegration({ id }),
  );
  const loader = useLoader(updateAction);

  // Set up delete action
  const deleteAction = deleteIntegration({ id });
  const deleteLoader = useLoader(deleteAction);

  // Set up integrations fetch for refreshing the list
  const integrationsCache = useCache(fetchIntegrations());

  // Handle success for update
  useLoaderSuccess(loader, () => {
    navigate(teamDiagnosticsIntegrationsUrl());
  });

  // Handle success for delete
  useLoaderSuccess(deleteLoader, () => {
    // Refresh the integrations list before navigating
    integrationsCache.trigger();
    navigate(teamDiagnosticsIntegrationsUrl());
  });

  // Submission handler - update the action with form data
  const handleSubmit = (formData: FormData) => {
    const action = updateIntegration({
      id,
      host: formData.host,
      port: formData.port,
      username: formData.username,
      ...(formData.password ? { password: formData.password } : {}),
    });
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
      navigate(teamDiagnosticsIntegrationsUrl());
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
            name: "Diagnostics Integrations",
            to: teamDiagnosticsIntegrationsUrl(),
          },
          { name: "Edit Integration", to: null },
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

          <h3 className={tokens.type.h3}>Delete Integration</h3>

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
