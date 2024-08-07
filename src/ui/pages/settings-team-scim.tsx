import {
  type CreateScimConfiguration,
  type ScimConfigurationResponse,
  type UpdateScimConfiguration,
  type GenerateScimToken,
  createScimConfiguration,
  deleteScimConfiguration,
  fetchScimConfigurations,
  updateScimConfiguration,
  generateScimToken,
} from "@app/auth";
import { selectRolesEditable } from "@app/deploy";
import {
  selectOrganizationSelected,
  selectOrganizationSelectedId,
} from "@app/organizations";
import {
  useCache,
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useQuery,
  useSelector,
} from "@app/react";
import { fetchRoles } from "@app/roles";
import { useState } from "react";
import { useValidator } from "../hooks";
import { selectCurrentUserId } from "@app/users";
import {
  Group,
  Banner,
  BannerMessages,
  Box,
  Button,
  ExternalLink,
  FormGroup,
  Loading,
  Select,
  Code,
  CopyText,
  tokens,
} from "../shared";

const validators = {
  metadata: (data: Pick<CreateScimConfiguration, "defaultRoleId">) => {
    if (!data.defaultRoleId) {
      return "must select Default Role";
    }
  },
};

function ConfigureScim({ onSuccess }: { onSuccess: () => void }) {
  const dispatch = useDispatch();
  const orgId = useSelector(selectOrganizationSelectedId);
  const [defaultRoleId, setDefaultRoleId] = useState("");
  const [errors, validate] = useValidator<
    CreateScimConfiguration,
    typeof validators
  >(validators);
  const data = {
    orgId,
    defaultRoleId,
  };
  const action = createScimConfiguration(data);
  const loader = useLoader(action);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate(data)) return;
    dispatch(action);
  };

  useLoaderSuccess(loader, () => {
    onSuccess();
  });

  useQuery(fetchRoles({ orgId }));
  const roles = useSelector((s) => selectRolesEditable(s, { orgId }));
  const options = [
    { value: "", label: "Select a Role" },
    ...roles.map((role) => {
      return { value: role.id, label: role.name };
    }),
  ];

  return (
    <Group>
      <h2 className={tokens.type.h2}>SCIM</h2>
      <Box>
        <Group>
        <SharedScimInfo />
          <form onSubmit={onSubmit}>
            <Group>
              <FormGroup
                label="Default Aptible Role"
                htmlFor="default-role"
                feedbackMessage={errors.defaultRoleId}
                feedbackVariant={errors.defaultRoleId ? "danger" : "info"}
              >
                <div>
                  Default Aptible Role <br />
                  <Select
                    options={options}
                    onSelect={(opt) => setDefaultRoleId(opt.value)}
                    value={defaultRoleId}
                  />
                </div>
              </FormGroup>

              <div>
                <Button type="submit" isLoading={loader.isLoading}>
                  Save
                </Button>
              </div>
            </Group>
          </form>
        </Group>
      </Box>
    </Group>
  );
}

function ScimEdit({
  onSuccess,
  scim,
}: {
  onSuccess: () => void;
  scim: ScimConfigurationResponse;
}) {
  const dispatch = useDispatch();
  const orgId = useSelector(selectOrganizationSelectedId);
  const userId = useSelector(selectCurrentUserId);
  const [defaultRoleId, setDefaultRoleId] = useState(scim.default_role_id || "");
  const [token, setToken] = useState<string | null>(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const data = {
    scimId: scim.id,
    orgId,
    defaultRoleId,
  };
  const action = updateScimConfiguration(data);
  const loader = useLoader(action);
  const rmLoader = useLoader(deleteScimConfiguration);

  const generateTokenAction = generateScimToken({
    scimConfigurationId: scim.id,
    userId,
  });

  const generateTokenLoader = useLoader(generateTokenAction);

  const handleGenerateToken = async () => {
    setIsLoading(true);
    try {
      dispatch(generateTokenAction);
    } catch (error) {
      console.error("Error generating token:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      alert("Token copied to clipboard!");
    }
  };

  const handleCloseModal = () => {
    setShowTokenModal(false);
    setToken(null);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(action);
  };

  const onRemove = () => {
    dispatch(deleteScimConfiguration({ id: scim.id }));
  };

  useLoaderSuccess(loader, () => {
    onSuccess();
  });

  useLoaderSuccess(rmLoader, () => {
    onSuccess();
  });

  useLoaderSuccess(generateTokenLoader, () => {
    const token = generateTokenLoader.token;
    if (token) {
      setToken(token);
      setShowTokenModal(true);
    } else {
      console.error("Token generation failed, received undefined token");
    }
  });

  useQuery(fetchRoles({ orgId }));
  const roles = useSelector((s) => selectRolesEditable(s, { orgId }));
  const options = [
    { value: "", label: "Select a Role" },
    ...roles.map((role) => {
      return { value: role.id, label: role.name };
    }),
  ];

  return (
    <Group>
      <h2 className={tokens.type.h2}>SCIM</h2>
      <Box>
        <Group>
          <h3 className={tokens.type.h3}>Edit SCIM Configuration</h3>
          <SharedScimInfo />
          <form onSubmit={onSubmit}>
            <Group>
              <BannerMessages {...loader} />

              <FormGroup
                label="Default Aptible Role"
                htmlFor="default-role-edit"
                feedbackMessage={null}
                feedbackVariant="info"
              >
                <div>
                  <Select
                    options={options}
                    onSelect={(opt) => setDefaultRoleId(opt.value)}
                    value={defaultRoleId}
                  />
                </div>
              </FormGroup>

              <div>
                <Button
                  onClick={handleGenerateToken}
                  isLoading={isLoading}
                >
                  Generate New Token
                </Button>
              </div>

              {showTokenModal && token && (
                <div className="modal">
                  <div className="modal-content">
                    <h4 className={tokens.type.h4}>Your New SCIM Bearer Token</h4>
                    <p>This token is displayed once only. If you lose access to this token
                      you will need to generate a new token.
                    </p>
                    <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', overflowWrap: 'break-word' }}
                      className="text-gray-500 text-sm flex flex-row gap-1">
                      <CopyText text={token} />
                    </div>
                    <Button onClick={handleCloseModal}>Hide Token</Button>
                  </div>
                </div>
              )}

              <div>
                <Button type="submit" isLoading={loader.isLoading}>
                  Save Changes
                </Button>
              </div>
            </Group>
          </form>

          <Group>
            <BannerMessages {...rmLoader} />

            <div>
              <Button
                variant="delete"
                requireConfirm
                onClick={onRemove}
                isLoading={rmLoader.isLoading}
              >
                Remove SCIM Configuration
              </Button>
            </div>
          </Group>
        </Group>
      </Box>
    </Group>
  );
}

const SharedScimInfo = () => (
  <>
    <Banner>
      To configure System for Cross-domain Identity Management (SCIM),
      enter the required information below. Terminology and acronyms vary
      between providers. For Okta, follow our{" "}
      <ExternalLink
        variant="default"
        href="https://www.aptible.com/docs/"
      >
        guided walkthrough.
      </ExternalLink>
    </Banner>
    <div>
      <h4 className={tokens.type.h4}>Supported SCIM Version</h4>
      <Code>2.0</Code>
    </div>
    <div>
      <h4 className={tokens.type.h4}>Supported Features</h4>
      <ol>
        <ul>
          <li>Create/Update/Delete Users</li>
          <li>Create/Update/Delete Groups (Aptible Roles)</li>
        </ul>
      </ol>
    </div>
    <div>
      <h4 className={tokens.type.h4}>SCIM Connector Base URL</h4>
      <CopyText text="https://auth.aptible.com/scim_v2"/>
    </div>
    <div>
      <h4 className={tokens.type.h4}>Unique Identifier</h4>
      <CopyText text="email"/>
    </div>
  </>
);

export const TeamScimPage = () => {
  const org = useSelector(selectOrganizationSelected);
  const scim = useCache(fetchScimConfigurations());

  if (scim.isLoading) {
    return <Loading />;
  }
  const configs = scim.data?._embedded?.scim_configurations || [];

  // Check if there is an existing SCIM configuration
  if (configs.length > 0) {
    return (
      <Group>
        <ScimEdit
          scim={configs[0]} // Pass the existing SCIM configuration
          onSuccess={() => scim.trigger()}
        />
      </Group>
    );
  }

  // If no configuration exists, show the configuration form
  return <ConfigureScim onSuccess={() => scim.trigger()} />;
};
