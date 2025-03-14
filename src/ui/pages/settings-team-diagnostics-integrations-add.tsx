import { createIntegration } from "@app/deploy/integration";
import { selectOrganizationSelected } from "@app/organizations";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useSelector,
} from "@app/react";
import { teamDiagnosticsIntegrationsUrl } from "@app/routes";
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

// Define integration types
const INTEGRATION_TYPES = [
  { value: "", label: "Select Integration Type" },
  { value: "ElasticsearchIntegration", label: "Elasticsearch" },
];

// Define form data interface
interface FormData {
  type: string;
  host?: string;
  port?: string;
  username?: string;
  password?: string;
}

// Form validators
const validators = {
  type: (data: FormData) =>
    data.type ? undefined : "Please select an integration type",
  host: (data: FormData) =>
    data.type && !data.host ? "Host is required" : undefined,
};

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
        />
      </FormGroup>
    </>
  );
}

export function SettingsTeamDiagnosticsIntegrationsAddPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const org = useSelector(selectOrganizationSelected);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    type: "",
  });

  // Validation
  const [errors, validate] = useValidator<FormData, typeof validators>(
    validators,
  );

  // Set up API action
  const action = createIntegration({
    type: formData.type,
    organization_id: org.id,
    host: formData.host,
    port: formData.port,
    username: formData.username,
    password: formData.password,
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
    navigate(teamDiagnosticsIntegrationsUrl());
  });

  // Render form fields based on selected integration type
  const renderIntegrationForm = () => {
    switch (formData.type) {
      case "ElasticsearchIntegration":
        return (
          <ElasticsearchForm
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
            name: "Diagnostics Integrations",
            to: teamDiagnosticsIntegrationsUrl(),
          },
          { name: "Add Integration", to: null },
        ]}
      />

      <Box>
        <form onSubmit={onSubmit}>
          <Group>
            <BannerMessages {...loader} />

            <FormGroup
              label="Integration Type"
              htmlFor="type"
              feedbackMessage={errors.type}
              feedbackVariant={errors.type ? "danger" : "info"}
            >
              <Select
                id="type"
                options={INTEGRATION_TYPES}
                onSelect={(opt) =>
                  setFormData({ ...formData, type: opt.value })
                }
                value={formData.type}
              />
            </FormGroup>

            {renderIntegrationForm()}

            <div className="mt-4">
              <Button
                type="submit"
                isLoading={loader.isLoading}
                disabled={formData.type === ""}
              >
                Add Integration
              </Button>
            </div>
          </Group>
        </form>
      </Box>
    </Group>
  );
}
