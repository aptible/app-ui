import {
  type CreateScimConfiguration,
  type ScimConfigurationResponse,
  createScimConfiguration,
  deleteScimConfiguration,
  fetchScimConfigurations,
  generateScimToken,
  resetScimToken,
  selectScimToken,
  updateScimConfiguration,
} from "@app/auth";
import { selectRolesEditable } from "@app/deploy";
import { selectOrganizationSelectedId } from "@app/organizations";
import {
  useCache,
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useQuery,
  useSelector,
} from "@app/react";
import { fetchRoles } from "@app/roles";
import { selectCurrentUserId } from "@app/users";
import { useState } from "react";
import { useValidator } from "../hooks";
import {
  Banner,
  BannerMessages,
  Box,
  Button,
  Code,
  CopyText,
  ExternalLink,
  FormGroup,
  Group,
  Loading,
  Select,
  tokens,
} from "../shared";

const validators = {
  roles: (data: Pick<CreateScimConfiguration, "defaultRoleId">) => {
    if (!data.defaultRoleId) {
      return "must select Default Role";
    }
  },
};

function ScimCreate({ onSuccess }: { onSuccess: () => void }) {
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
      <SharedScimTitle />
      <Box>
        <Group>
          <SharedScimInfo />
          <form onSubmit={onSubmit}>
            <Group>
              <FormGroup
                label="Default Aptible Role"
                htmlFor="default-role"
                feedbackMessage={errors.roles}
                feedbackVariant={errors.roles ? "danger" : "info"}
              >
                <div>
                  Default Aptible Role <br />
                  <Select
                    id="default-role"
                    options={options}
                    onSelect={(opt) => setDefaultRoleId(opt.value)}
                    value={defaultRoleId}
                    ariaLabel="default-role"
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
  const scimToken = useSelector(selectScimToken);
  const [defaultRoleId, setDefaultRoleId] = useState(
    scim.default_role_id || "",
  );
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [isLoading] = useState(false);

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
    try {
      await dispatch(generateTokenAction);
    } catch (error) {
      console.error("Error generating token:", error);
    }
  };

  const handleCloseModal = () => {
    setShowTokenModal(false);
    dispatch(resetScimToken());
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
    if (scimToken) {
      setShowTokenModal(true);
    } else {
      console.error("undefined scimToken");
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
      <SharedScimTitle />
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
                    id="default-role-edit"
                    options={options}
                    onSelect={(opt) => setDefaultRoleId(opt.value)}
                    value={defaultRoleId}
                    ariaLabel="default-role-edit"
                  />
                </div>
              </FormGroup>

              <div>
                <Button onClick={handleGenerateToken} isLoading={isLoading}>
                  Generate New Token
                </Button>
              </div>

              {showTokenModal && scimToken !== "" && (
                <div className="modal">
                  <div className="modal-content">
                    <h4 className={tokens.type.h4}>
                      Your New SCIM Bearer Token
                    </h4>
                    <p>
                      This token is displayed once only. If you lose access to
                      this token you will need to generate a new token.
                    </p>
                    <FormGroup description="" htmlFor="scim-token" label="">
                      <CopyText text={scimToken}>
                        <textarea
                          id="scim-token"
                          name="scimToken"
                          className={`${tokens.type.textarea} min-w-[400px] mb-4`}
                          value={scimToken}
                          readOnly={true}
                        />
                      </CopyText>
                    </FormGroup>
                    <Button onClick={handleCloseModal}>Hide Token</Button>
                  </div>
                </div>
              )}
            </Group>

            <div className="py-8">
              <hr />
            </div>
            <Group variant="horizontal">
              <div>
                <Button type="submit" isLoading={loader.isLoading}>
                  Save Changes
                </Button>
              </div>

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
          </form>
        </Group>
      </Box>
    </Group>
  );
}

const SharedScimTitle = () => (
  <h2 className={tokens.type.h2}>Provisioning (SCIM)</h2>
);

const SharedScimInfo = () => (
  <>
    <Banner>
      To configure System for Cross-domain Identity Management (SCIM), enter the
      required information below. Terminology and acronyms vary between
      providers. For Okta, follow our{" "}
      <ExternalLink variant="default" href="https://www.aptible.com/docs/">
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
      <CopyText text="https://auth.aptible.com/scim_v2" />
    </div>
    <div>
      <h4 className={tokens.type.h4}>Unique Identifier</h4>
      <CopyText text="email" />
    </div>
  </>
);

export const TeamScimPage = () => {
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
  return <ScimCreate onSuccess={() => scim.trigger()} />;
};
