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
  updateSamlConfiguration,
  updateSsoForOrganization,
} from "@app/auth";
import { selectEnv } from "@app/env";
import { extractIdFromLink } from "@app/hal";
import {
  selectOrganizationSelected,
  selectOrganizationSelectedId,
} from "@app/organizations";
import { Organization } from "@app/types";
import { selectUsersAsList } from "@app/users";
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
    <Box>
      <Group>
        <h3 className={tokens.type.h3}>
          You haven't configured an SSO provider.
        </h3>

        <p>
          In order to configure an SSO Provider, you will need to enter the
          below information into your SSO Provider's setup process. The
          terminology and acronyms vary between SSO providers. We have tried to
          provide the most common below. If you use Okta, please follow our{" "}
          <ExternalLink
            variant="default"
            href="https://www.aptible.com/docs/sso-setup#okta-walkthrough"
          >
            guided walkthrough
          </ExternalLink>{" "}
          with additional details.
        </p>

        <BannerMessages {...loader} />

        <div>
          <h4 className={tokens.type.h4}>
            Single sign on URL (Assertion Consumer Service [ACS] URL)
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
            Application username (NameID attribute)
          </h4>
          <div>
            <strong>Email</strong> is required. The email sent by the SSO
            provider must exactly match the Aptible account.
          </div>
        </div>

        <hr />

        <form onSubmit={onSubmit}>
          <Group>
            <p>
              After completing your SSO provider setup, it should generate an
              XML metadata file for you. If you use Okta, please follow our{" "}
              <ExternalLink
                variant="default"
                href="https://www.aptible.com/docs/sso-setup#okta-walkthrough"
              >
                guided walkthrough
              </ExternalLink>{" "}
              with additional details.
            </p>

            <Banner>
              Please enter either the URL of the file <strong>or</strong> the
              file contents.
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
    <Box>
      <Group>
        <h3>Edit SSO Configuration</h3>

        <div>
          <h4 className={tokens.type.h4}>Entity ID</h4>
          <CopyText text={saml.entity_id} />
        </div>

        <div>
          <h4 className={tokens.type.h4}>Sign-in URL</h4>
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
              <Button type="submit" isLoading={loader.isLoading}>
                Save Changes
              </Button>
            </div>
          </Group>
        </form>

        <Group>
          <BannerMessages {...rmLoader} />

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
              Remove SSO Config
            </Button>
          )}
        </Group>
      </Group>
    </Box>
  );
}

function SsoBypass({ orgId }: { orgId: string }) {
  const dispatch = useDispatch();
  const allowlist = useCache<FetchAllowlistMemberships>(
    fetchAllowlistMemberships({ orgId }),
  );
  const members = allowlist.data?._embedded.whitelist_memberships || [];
  const userIds = members.map((m) => {
    return extractIdFromLink(m._links.user);
  });
  const users = useSelector(selectUsersAsList);
  const allowlistUsers = users.filter((u) => userIds.includes(u.id));

  const options = users
    .filter((u) => userIds.includes(u.id) === false)
    .map((u) => ({ label: `${u.name} (${u.email})`, value: u.id }));
  options.unshift({ label: "Add user to SSO Bypass", value: "" });
  const [selected, setSelected] = useState("");
  const addLoader = useLoader(addAllowlistMembership);
  const rmLoader = useLoader(deleteAllowlistMembership);

  const onSelect = (opt: SelectOption) => {
    setSelected(opt.value);
  };
  const onAdd = () => {
    dispatch(addAllowlistMembership({ orgId }));
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
                      onClick={() => onRemove(u.id)}
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

        <div>
          <Select
            options={options}
            onSelect={onSelect}
            value={selected}
            ariaLabel="allowlist-membership"
          />
          <Button onClick={onAdd} isLoading={addLoader.isLoading}>
            Add
          </Button>
        </div>
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

        <Button
          onClick={onToggle}
          isLoading={loader.isLoading}
          variant={org.ssoEnforced ? "delete" : "primary"}
        >
          {org.ssoEnforced ? "Disable" : "Enable"}
        </Button>
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
      <EnforceSso org={org} />
      {org.ssoEnforced ? <SsoBypass orgId={org.id} /> : null}
    </Group>
  );
};
