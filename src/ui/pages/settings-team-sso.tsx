import {
  FetchAllowlistMemberships,
  FetchSamlConfigurations,
  fetchAllowlistMemberships,
  fetchSamlConfigurations,
} from "@app/auth";
import { selectOrganizationSelected } from "@app/organizations";
import { useCache, useSelector } from "starfx/react";
import {
  Box,
  Button,
  ExternalLink,
  FormGroup,
  Group,
  Input,
  TextArea,
  tokens,
} from "../shared";

export const TeamSsoPage = () => {
  const org = useSelector(selectOrganizationSelected);
  const saml = useCache<FetchSamlConfigurations>(fetchSamlConfigurations());
  const allowlist = useCache<FetchAllowlistMemberships>(
    fetchAllowlistMemberships({ orgId: org.id }),
  );

  return (
    <Box>
      <h3 className={tokens.type.h3}>
        You haven't configured an SSO provider.
      </h3>

      <p>
        In order to configure an SSO Provider, you will need to enter the below
        information into your SSO Provider's setup process. The terminology and
        acronyms vary between SSO providers. We have tried to provide the most
        common below. If you use Okta, please follow our{" "}
        <ExternalLink
          variant="default"
          href="https://www.aptible.com/docs/sso-setup#okta-walkthrough"
        >
          guided walkthrough
        </ExternalLink>{" "}
        with additional details.
      </p>

      <form>
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
              Email is required. The email sent by the SSO provider must exactly
              match the Aptible account.
            </div>
          </div>

          <FormGroup label="Metadata URL" htmlFor="metadata-url">
            <Input id="metadata-url" name="metadata-url" />
          </FormGroup>

          <FormGroup label="Metadata File XML Content" htmlFor="metadata-xml">
            <TextArea id="metadata-xml" name="metadata-xml" />
          </FormGroup>

          <div>
            <Button>Configure SSO Provider</Button>
          </div>
        </Group>
      </form>
    </Box>
  );
};
