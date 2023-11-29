import {
  CreateSamlConfiguration,
  FetchAllowlistMemberships,
  FetchSamlConfigurations,
  SamlConfigurationResponse,
  UpdateSamlConfiguration,
  addAllowlistMembership,
  createSamlConfiguration,
  deleteAllowlistMembership,
  deleteSamlConfiguration,
  fetchAllowlistMemberships,
  fetchSamlConfigurations,
  fetchUsersForRole,
  updateSamlConfiguration,
  updateSamlHandle,
  updateSsoForOrganization,
} from "@app/auth";
import { selectEnv } from "@app/env";
import { extractIdFromLink } from "@app/hal";
import {
  selectOrganizationSelected,
  selectOrganizationSelectedId,
} from "@app/organizations";
import { selectRolesByOrgId } from "@app/roles";
import { ssoUrl } from "@app/routes";
import { AppState, HalEmbedded, Organization } from "@app/types";
import { UserResponse, selectUsersAsList } from "@app/users";
import { existValidtor } from "@app/validator";
import { useState } from "react";
import {
  useCache,
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useSelector,
} from "starfx/react";
import { useValidator } from "../hooks";
import {
  Banner,
  BannerMessages,
  Box,
  Button,
  CopyText,
  EmptyTr,
  ExternalLink,
  FormGroup,
  Group,
  Input,
  Loading,
  Select,
  SelectOption,
  TBody,
  THead,
  Table,
  Td,
  TextArea,
  Th,
  Tr,
  tokens,
} from "../shared";

const validators = {
  metadata: (
    data: Pick<CreateSamlConfiguration, "metadata" | "metadataUrl">,
  ) => {
    if (!data.metadataUrl && !data.metadata) {
      return "must provide either metadata URL or metadata XML";
    }
  },
};

function ConfigureSso({ onSuccess }: { onSuccess: () => void }) {
  const dispatch = useDispatch();
  const env = useSelector(selectEnv);
  const orgId = useSelector(selectOrganizationSelectedId);
  const baseUrl = `${env.authUrl}/organizations/${orgId}`;
  const ssoUrl = `${baseUrl}/saml/consume`;
  const audienceUrl = `${baseUrl}/saml/metadata`;
  const [metadataUrl, setMetadataUrl] = useState("");
  const [metadata, setMetadata] = useState("");
  const [errors, validate] = useValidator<
    CreateSamlConfiguration,
    typeof validators
  >(validators);
  const data = {
    orgId,
    metadata,
    metadataUrl,
  };
  const action = createSamlConfiguration(data);
  const loader = useLoader(action);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate(data)) return;
    dispatch(action);
  };

  useLoaderSuccess(loader, () => {
    onSuccess();
  });

  return (
    <Group>
      <h2 className={tokens.type.h2}>Single Sign-On</h2>
      <Box>
        <Group>
          <Banner>
            To configure an SSO Provider, enter the required information into
            the provider's setup process. Terminology and acronyms vary between
            providers. For Okta, follow our{" "}
            <ExternalLink
              variant="default"
              href="https://www.aptible.com/docs/sso-setup#okta-walkthrough"
            >
              guided walkthrough.
            </ExternalLink>
          </Banner>

          <BannerMessages {...loader} />

          <div>
            <h4 className={tokens.type.h4}>
              Single Sign-On URL (Assertion Consumer Service [ACS] URL)
            </h4>
            <CopyText text={ssoUrl} />
          </div>

          <div>
            <h4 className={tokens.type.h4}>
              Audience URI (Service Provider Entity ID)
            </h4>
            <CopyText text={audienceUrl} />
          </div>

          <div>
            <h4 className={tokens.type.h4}>Name ID format</h4>
            <div>
              <strong>EmailAddress</strong> is preferred. Unspecified is also
              acceptible.
            </div>
          </div>

          <div>
            <h4 className={tokens.type.h4}>
              Application Username (NameID attribute)
            </h4>
            <div>
              <strong>Email</strong> is required. The email sent by the SSO
              provider must exactly match the Aptible account.
            </div>
          </div>

          <hr />

          <form onSubmit={onSubmit}>
            <Group>
              <Banner>
                After completing your SSO provider setup, it should generate an
                XML metadata file for you. Please enter either the{" "}
                <strong>Metadata URL</strong> OR{" "}
                <strong>Metadata File XML Content.</strong>
              </Banner>

              <FormGroup
                label="Metadata URL"
                htmlFor="metadata-url"
                feedbackMessage={errors.metadata}
                feedbackVariant={errors.metadata ? "danger" : "info"}
              >
                <Input
                  id="metadata-url"
                  name="metadata-url"
                  value={metadataUrl}
                  onChange={(e) => setMetadataUrl(e.currentTarget.value)}
                />
              </FormGroup>

              <h4 className={tokens.type.h4}>- OR -</h4>

              <FormGroup
                label="Metadata File XML Content"
                htmlFor="metadata-xml"
                feedbackMessage={errors.metadata}
                feedbackVariant={errors.metadata ? "danger" : "info"}
              >
                <TextArea
                  id="metadata-xml"
                  aria-label="metadata-xml"
                  value={metadata}
                  onChange={(e) => setMetadata(e.currentTarget.value)}
                />
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

function SsoEdit({
  onSuccess,
  saml,
  org,
}: {
  onSuccess: () => void;
  saml: SamlConfigurationResponse;
  org: Organization;
}) {
  const dispatch = useDispatch();
  const [metadataUrl, setMetadataUrl] = useState("");
  const [metadata, setMetadata] = useState("");
  const [errors, validate] = useValidator<
    UpdateSamlConfiguration,
    typeof validators
  >(validators);
  const data = {
    samlId: saml.id,
    metadata,
    metadataUrl,
  };
  const action = updateSamlConfiguration(data);
  const loader = useLoader(action);
  const rmLoader = useLoader(deleteSamlConfiguration);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate(data)) return;
    dispatch(action);
  };

  const onRemove = () => {
    dispatch(deleteSamlConfiguration({ id: saml.id }));
  };

  useLoaderSuccess(loader, () => {
    onSuccess();
  });

  useLoaderSuccess(rmLoader, () => {
    onSuccess();
  });

  return (
    <Group>
      <h2 className={tokens.type.h2}>Single Sign-On</h2>
      <Box>
        <Group>
          <h3 className={tokens.type.h3}>Edit SSO Configuration</h3>

          <div>
            <h4 className={tokens.type.h4}>Entity ID</h4>
            <CopyText text={saml.entity_id} />
          </div>

          <div>
            <h4 className={tokens.type.h4}>Sign-In URL</h4>
            <CopyText text={saml.sign_in_url} />
          </div>

          <div>
            <h4 className={tokens.type.h4}>Name Format</h4>
            <CopyText text={saml.name_format} />
          </div>

          <form onSubmit={onSubmit}>
            <Group>
              <BannerMessages {...loader} />

              <FormGroup
                label="Metadata URL"
                htmlFor="metadata-url"
                feedbackMessage={errors.metadata}
                feedbackVariant={errors.metadata ? "danger" : "info"}
              >
                <Input
                  id="metadata-url"
                  name="metadata-url"
                  value={metadataUrl}
                  onChange={(e) => setMetadataUrl(e.currentTarget.value)}
                />
              </FormGroup>

              <FormGroup
                label="Metadata File XML Content"
                htmlFor="metadata-xml"
                feedbackMessage={errors.metadata}
                feedbackVariant={errors.metadata ? "danger" : "info"}
              >
                <TextArea
                  id="metadata-xml"
                  aria-label="metadata-xml"
                  value={metadata}
                  onChange={(e) => setMetadata(e.currentTarget.value)}
                />
              </FormGroup>

              <div>
                <Button
                  type="submit"
                  isLoading={loader.isLoading}
                  disabled={!metadataUrl && !metadata}
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

function useOrgOwnerIds(orgId: string) {
  const roles = useSelector((s: AppState) => selectRolesByOrgId(s, { orgId }));
  const ownerRole = roles.find((r) => r.type === "owner");
  const ownersReq = useCache<HalEmbedded<{ users: UserResponse[] }>>(
    fetchUsersForRole({ roleId: ownerRole?.id || "" }),
  );
  const init: string[] = [];
  if (!ownersReq.data) return init;
  if (typeof ownersReq.data === "string") return init;
  const owners = ownersReq.data?._embedded.users || [];
  return owners.map((u) => `${u.id}`);
}

const allowlistValidators = {
  add: (data: { userId: string }) => existValidtor(data.userId, "user"),
};

function useAllowlistMembers(orgId: string) {
  const allowlist = useCache<FetchAllowlistMemberships>(
    fetchAllowlistMemberships({ orgId }),
  );
  const ownerIds = useOrgOwnerIds(orgId);
  const members = allowlist.data?._embedded.whitelist_memberships || [];
  // get relevant info from membership
  const memberUserMap = members.map((m) => {
    return { id: m.id, userId: extractIdFromLink(m._links.user) };
  });
  const users = useSelector(selectUsersAsList);
  const allowlistUsers = users
    // find users within allowlist group
    .map((u) => {
      const member = memberUserMap.find((mp) => mp.userId === u.id);
      return { ...u, memberId: member?.id || "" };
    })
    // filter out users without an allowlist membership
    .filter((u) => u.memberId !== "");

  const options = users
    // exclude users already inside allowlist membership
    .filter((u) => {
      return !allowlistUsers.find((a) => a.id === u.id);
    })
    // exclude owners since they are implicitly inside allowlist
    .filter((u) => !ownerIds.includes(u.id))
    // turn it into an option
    .map((u) => ({ label: `${u.name} (${u.email})`, value: u.id }));
  // add empty selection to first item in select options
  options.unshift({ label: "Add user to SSO Bypass", value: "" });

  return { allowlist, allowlistUsers, options };
}

function SsoBypass({ orgId }: { orgId: string }) {
  const dispatch = useDispatch();
  const { allowlist, allowlistUsers, options } = useAllowlistMembers(orgId);
  const [selected, setSelected] = useState("");
  const addLoader = useLoader(addAllowlistMembership);
  const rmLoader = useLoader(deleteAllowlistMembership);

  const [errors, validate] = useValidator<
    { userId: string },
    typeof allowlistValidators
  >(allowlistValidators);
  const data = { orgId, userId: selected };

  const onSelect = (opt: SelectOption) => {
    setSelected(opt.value);
  };
  const onAdd = () => {
    if (!validate(data)) return;
    dispatch(addAllowlistMembership(data));
  };
  const onRemove = (id: string) => {
    dispatch(deleteAllowlistMembership({ id }));
  };

  useLoaderSuccess(addLoader, () => {
    allowlist.trigger();
  });

  useLoaderSuccess(rmLoader, () => {
    allowlist.trigger();
  });

  return (
    <Box>
      <Group>
        <h3 className={tokens.type.h3}>SSO Bypass Allow List</h3>

        <p>
          Account owners can always access the account and can not be added
          here.
        </p>

        <Table>
          <THead>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>2FA</Th>
            <Th>Actions</Th>
          </THead>

          <TBody>
            {allowlistUsers.length === 0 ? (
              <EmptyTr colSpan={4}>
                No users added to SSO exception list
              </EmptyTr>
            ) : null}

            {allowlistUsers.map((u) => {
              return (
                <Tr key={u.id}>
                  <Td>{u.name}</Td>
                  <Td>{u.email}</Td>
                  <Td>{u.otpEnabled}</Td>
                  <Td>
                    <Button
                      variant="delete"
                      requireConfirm
                      onClick={() => onRemove(u.memberId)}
                      isLoading={rmLoader.isLoading}
                    >
                      Remove user
                    </Button>
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>

        {errors.add ? <Banner variant="error">{errors.add}</Banner> : null}

        <Group variant="horizontal">
          <Select
            options={options}
            onSelect={onSelect}
            value={selected}
            ariaLabel="allowlist-membership"
          />
          <Button onClick={onAdd} isLoading={addLoader.isLoading}>
            Add
          </Button>
        </Group>
      </Group>
    </Box>
  );
}

const EnforceSso = ({ org }: { org: Organization }) => {
  const dispatch = useDispatch();
  const loader = useLoader(updateSsoForOrganization);
  const onToggle = () => {
    dispatch(
      updateSsoForOrganization({ id: org.id, ssoEnforced: !org.ssoEnforced }),
    );
  };

  return (
    <Box>
      <Group>
        <h3 className={tokens.type.h3}>Require SSO for Access</h3>

        <div>
          Your members will be able to access this organization's resources by
          using SSO. Organization owners and anyone added to the allow list are
          exempt. They can continue to use Aptible credentials and SSH keys to
          access your resources.
        </div>

        <BannerMessages {...loader} />

        <div>
          <Button
            onClick={onToggle}
            isLoading={loader.isLoading}
            variant={org.ssoEnforced ? "delete" : "primary"}
          >
            {org.ssoEnforced ? "Disable" : "Enable"}
          </Button>
        </div>
      </Group>
    </Box>
  );
};

const LoginSso = ({
  org,
  saml,
  onSuccess,
}: {
  org: Organization;
  saml: SamlConfigurationResponse;
  onSuccess: () => void;
}) => {
  const dispatch = useDispatch();
  const curHandle = saml.handle || org.id;
  const [handle, setHandle] = useState(curHandle);
  const loader = useLoader(updateSamlHandle);
  const env = useSelector(selectEnv);
  const url = `${env.appUrl}/sso/${curHandle}`;
  const shouldDisable = !handle || handle === curHandle;

  useLoaderSuccess(loader, () => {
    onSuccess();
  });

  return (
    <Box>
      <Group>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            dispatch(updateSamlHandle({ samlId: saml.id, handle }));
          }}
        >
          <Group>
            <BannerMessages {...loader} />

            <FormGroup
              htmlFor="saml-handle"
              label="SSO Login ID"
              description={
                <div>
                  Your members must enter this login ID on the{" "}
                  <ExternalLink variant="info" href={ssoUrl()}>
                    SSO login page
                  </ExternalLink>
                  . We suggest picking a memorable, unique value such as your
                  company's primary email domain.
                </div>
              }
            >
              <Input
                value={handle}
                onChange={(e) => setHandle(e.currentTarget.value)}
                id="saml-handle"
                name="saml-handle"
              />
            </FormGroup>

            <div>
              <Button
                type="submit"
                disabled={shouldDisable}
                isLoading={loader.isLoading}
              >
                Update Login ID
              </Button>
            </div>
          </Group>
        </form>

        <hr />

        <Group>
          <h4 className={tokens.type.h4}>Shortcut SSO login URL</h4>
          <div>
            Your members may also use this direct link to login to your Aptible
            organization via SSO.
          </div>
          <CopyText text={url} />
        </Group>
      </Group>
    </Box>
  );
};

export const TeamSsoPage = () => {
  const org = useSelector(selectOrganizationSelected);
  const saml = useCache<FetchSamlConfigurations>(fetchSamlConfigurations());

  if (saml.isLoading) {
    return <Loading />;
  }

  const configs = saml.data?._embedded?.saml_configurations || [];

  if (configs.length === 0) {
    return <ConfigureSso onSuccess={() => saml.trigger()} />;
  }

  return (
    <Group>
      <SsoEdit saml={configs[0]} org={org} onSuccess={() => saml.trigger()} />
      <LoginSso saml={configs[0]} org={org} onSuccess={() => saml.trigger()} />
      <EnforceSso org={org} />
      {org.ssoEnforced ? <SsoBypass orgId={org.id} /> : null}
    </Group>
  );
};
