import {
    type CreateScimConfiguration,
    type ScimConfigurationResponse,
    type UpdateScimConfiguration,
    createScimConfiguration,
    deleteScimConfiguration,
    fetchScimConfigurations,
    updateScimConfiguration,
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
    tokens
} from "../shared"

const validators = {
    metadata: (
      data: Pick<CreateScimConfiguration, "defaultRoleId">,
    ) => {
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
    const [roleId, setRole] = useState("");

    return (
      <Group>
        <h2 className={tokens.type.h2}>SCIM</h2>
        <Box>
            <Group>
                <Banner>
                    To configure System for Cross-domain Identity Management (SCIM),
                    enter the required information below. Terminology and acronyms
                    vary between providers. For Okta, follow our{" "}
                    <ExternalLink
                    variant="default"
                    href="https://www.aptible.com/docs/"
                    >
                    guided walkthrough.
                    </ExternalLink>
                </Banner>
                <div>
                    Supported SCIM Version:
                    <Code>
                        2.0
                    </Code>
                </div>

                <div>
                    Supported Features:
                    <ol>
                        <li>- Create Users</li>
                        <li>- Update Users</li>
                    </ol>
                </div>

            <form onSubmit={onSubmit}>
              <Group>

                <FormGroup
                  label="Default Aptible Role"
                  htmlFor=""
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
    const defaultRoleId = useState("");
    const [errors, validate] = useValidator<
      UpdateScimConfiguration,
      typeof validators
    >(validators);
    const data = {
      scimId: scim.id,
      defaultRoleId: scim.default_role_id
    };
    const action = updateScimConfiguration(data);
    const loader = useLoader(action);
    const rmLoader = useLoader(deleteScimConfiguration);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validate(data)) return;
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

    return (
      <Group>
        <h2 className={tokens.type.h2}>SCIM</h2>
        <Box>
          <Group>
            <h3 className={tokens.type.h3}>Edit SCIM Configuration</h3>

            <form onSubmit={onSubmit}>
              <Group>
                <BannerMessages {...loader} />


                <div>
                  <Button
                    type="submit"
                    isLoading={loader.isLoading}
                  >
                    Save Changes
                  </Button>
                </div>
              </Group>
            </form>

            <Group>
              <BannerMessages {...rmLoader} />

              <div>
                {org.ssoEnforced ? (
                  <Banner variant="info">
                    SSO must not be enforced to be removed
                  </Banner>
                ) : (
                  <Button
                    variant="delete"
                    requireConfirm
                    onClick={onRemove}
                    isLoading={rmLoader.isLoading}
                  >
                    Remove SSO Configuration
                  </Button>
                )}
              </div>
            </Group>
          </Group>
        </Box>
      </Group>
    );
}

export const TeamScimPage = () => {
  const org = useSelector(selectOrganizationSelected);
  const saml = useCache(fetchScimConfigurations());
  if (saml.isLoading) {
  return <Loading />;
  }
  const configs = saml.data?._embedded?.saml_configurations || [];
  if (configs.length === 0) {
  return <ConfigureScim onSuccess={() => saml.trigger()} />;
  }
  return (
  <Group>
      <ScimEdit scim={configs[0]} org={org} onSuccess={() => scim.trigger()} />
  </Group>
  );
};
