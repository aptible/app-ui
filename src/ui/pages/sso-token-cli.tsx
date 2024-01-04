import { fetchCurrentToken } from "@app/auth";
import { selectEnv } from "@app/config";
import { selectOrganizationSelectedId } from "@app/organizations";
import { useApi, useSelector } from "@app/react";
import { selectAccessToken } from "@app/token";
import { useState } from "react";
import { AppSidebarLayout, HeroBgLayout } from "../layouts";
import {
  Banner,
  Box,
  Button,
  ExternalLink,
  FormGroup,
  Group,
  PreCode,
  Select,
  SelectOption,
  listToInvertedTextColor,
  tokens,
} from "../shared";

const durations: SelectOption[] = [
  { label: "1 Hour", value: "3600" },
  { label: "4 Hours", value: "14400" },
  { label: "12 Hours", value: "43200" },
  { label: "24 Hours", value: "86400" },
  { label: "5 Days", value: "432000" },
  { label: "1 Week", value: "604800" },
];

export const SsoTokenCliPage = () => {
  const env = useSelector(selectEnv);
  const [dur, setDur] = useState(durations[durations.length - 1].value);
  const orgId = useSelector(selectOrganizationSelectedId);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const failure_page = encodeURIComponent(
      "https://app.aptible.com/sso/failure",
    );
    window.location.replace(
      `${env.authUrl}/organizations/${orgId}/saml/login?landing_page=clitoken&duration=${dur}&redirect_uri=${failure_page}`,
    );
  };
  const onSelect = (opt: SelectOption) => setDur(opt.value);

  return (
    <HeroBgLayout>
      <Box>
        <Group>
          <h1 className={tokens.type.h1}>
            Single Sign-On Token for Aptible CLI
          </h1>
          <div>
            To use the{" "}
            <ExternalLink variant="info" href="https://aptible.com/docs/cli">
              Aptible CLI
            </ExternalLink>{" "}
            with SSO, you must generate a new token. The selected lifetime is
            the maximum duration the token will be valid. If your SSO provider
            is configured to use a shorter session duration, that will be
            applied to the token instead. The security best practice is to
            select the shortest lifetime that will meet your needs.{" "}
            <strong>
              Logging out of your browser session will revoke the token,
              regardless of the lifetime you select.
            </strong>
          </div>

          <form onSubmit={onSubmit}>
            <FormGroup htmlFor="token-duration" label="Token Duration">
              <Select
                options={durations}
                onSelect={onSelect}
                value={dur}
                ariaLabel="token-duration"
              />
              <Button className="mt-4" type="submit">
                Generate Token
              </Button>
            </FormGroup>
          </form>
        </Group>
      </Box>
    </HeroBgLayout>
  );
};

export const SsoTokenCliReadPage = () => {
  const accessToken = useSelector(selectAccessToken);
  const query = useApi(fetchCurrentToken());

  return (
    <AppSidebarLayout>
      <Box>
        <Group>
          <h1 className={tokens.type.h1}>SSO Token for CLI</h1>

          <div>
            To use the{" "}
            <ExternalLink variant="info" href="https://aptible.com/docs/cli">
              Aptible CLI
            </ExternalLink>{" "}
            with SSO, enter the below command into your terminal.{" "}
            <strong>
              Logging out of your browser session will revoke the token,
              regardless of the lifetime you select.
            </strong>
          </div>

          <Group>
            {accessToken === "" && !query.isLoading ? (
              <Banner variant="error">
                <div className="flex gap-2 items-center">
                  Failed to fetch token, try again.{" "}
                  <Button
                    variant="delete"
                    onClick={() => query.trigger()}
                    isLoading={query.isLoading}
                  >
                    Retry
                  </Button>
                </div>
              </Banner>
            ) : null}

            <PreCode
              allowCopy
              segments={listToInvertedTextColor([
                "aptible login --sso",
                accessToken,
              ])}
            />
          </Group>
        </Group>
      </Box>
    </AppSidebarLayout>
  );
};
