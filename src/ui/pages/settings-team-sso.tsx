import {
  FetchAllowlistMemberships,
  FetchSamlConfigurations,
  SamlConfigurationResponse,
  fetchAllowlistMemberships,
  fetchSamlConfigurations,
} from "@app/auth";
import { extractIdFromLink } from "@app/hal";
import { selectOrganizationSelected } from "@app/organizations";
import { Organization } from "@app/types";
import { selectUsersAsList } from "@app/users";
import { useCache, useSelector } from "starfx/react";
import {
  Banner,
  Box,
  Button,
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

function ConfigureSso() {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // TODO
    e.preventDefault();
  };

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

        <form onSubmit={onSubmit}>
          <Group>
            <FormGroup
              label="Single sign on URL (Assertion Consumer Service [ACS] URL)"
              htmlFor="sso-url"
            >
              <Input id="sso-url" name="sso-url" />
            </FormGroup>

            <FormGroup
              label="Audience URI (Service Provider Entity ID)"
              htmlFor="audience-uri"
            >
              <Input id="audience-uri" name="audience-uri" />
            </FormGroup>

            <div>
              <h4 className={tokens.type.h4}>Name ID format</h4>
              <div>
                EmailAddress is preferred. Unspecified is also acceptible.
              </div>
            </div>

            <div>
              <h4 className={tokens.type.h4}>
                Application username (NameID attribute)
              </h4>
              <div>
                Email is required. The email sent by the SSO provider must
                exactly match the Aptible account.
              </div>
            </div>

            <FormGroup label="Metadata URL" htmlFor="metadata-url">
              <Input id="metadata-url" name="metadata-url" />
            </FormGroup>

            <FormGroup label="Metadata File XML Content" htmlFor="metadata-xml">
              <TextArea id="metadata-xml" name="metadata-xml" />
            </FormGroup>

            <div>
              <Button type="submit">Configure SSO Provider</Button>
            </div>
          </Group>
        </form>
      </Group>
    </Box>
  );
}

function SsoBypass({ orgId }: { orgId: string }) {
  const allowlist = useCache<FetchAllowlistMemberships>(
    fetchAllowlistMemberships({ orgId }),
  );

  if (allowlist.isLoading) {
    return <Loading />;
  }

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

  const onSelect = (opt: SelectOption) => {
    // TODO
    console.log("select", opt);
  };
  const onAdd = () => {
    // TODO
    allowlist.trigger();
  };
  const onRemove = () => {
    // TODO
    allowlist.trigger();
  };

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
                    <Button variant="delete" requireConfirm onClick={onRemove}>
                      Remove
                    </Button>
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>

        <div>
          <Select options={options} onSelect={onSelect} />
          <Button onClick={onAdd}>Add</Button>
        </div>
      </Group>
    </Box>
  );
}

function SsoEdit({
  saml,
  org,
}: { saml: SamlConfigurationResponse; org: Organization }) {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // TODO
    e.preventDefault();
  };

  return (
    <Box>
      <Group>
        <div>
          <h3>Entity ID</h3>
          <div>{saml.entity_id}</div>
        </div>

        <div>
          <h3>Sign-in URL</h3>
          <div>{saml.sign_in_url}</div>
        </div>

        <div>
          <h3>Name Format</h3>
          <div>{saml.name_format}</div>
        </div>

        <form onSubmit={onSubmit}>
          <Group>
            <FormGroup label="Metadata URL" htmlFor="metadata-url">
              <Input id="metadata-url" name="metadata-url" />
            </FormGroup>

            <FormGroup label="Metadata File XML Content" htmlFor="metadata-xml">
              <TextArea id="metadata-xml" name="metadata-xml" />
            </FormGroup>

            <Button type="submit">Save Changes</Button>
          </Group>
        </form>

        {org.ssoEnforced ? (
          <Banner variant="info">SSO must not be enforced to be removed</Banner>
        ) : (
          <Button>Remove SSO Config</Button>
        )}
      </Group>
    </Box>
  );
}

export const TeamSsoPage = () => {
  const org = useSelector(selectOrganizationSelected);
  const saml = useCache<FetchSamlConfigurations>(fetchSamlConfigurations());

  if (saml.isLoading) {
    return <Loading />;
  }

  const configs = saml.data?._embedded?.saml_configurations || [];

  if (configs.length === 0) {
    return <ConfigureSso />;
  }

  return (
    <Group>
      <SsoEdit saml={configs[0]} org={org} />
      <SsoBypass orgId={org.id} />
    </Group>
  );
};
