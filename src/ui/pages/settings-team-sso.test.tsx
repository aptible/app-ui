import { setupIntegrationTest, waitForBootup } from "@app/test";
import {
  act,
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { defaultSamlConfigurationResponse } from "@app/auth";
import { defaultHalHref } from "@app/hal";
import {
  createId,
  server,
  testEnv,
  testOrg,
  testSaml,
  testUser,
} from "@app/mocks";
import { defaultOrgResponse } from "@app/organizations";
import { TEAM_SSO_PATH, teamSsoUrl } from "@app/routes";
import { rest } from "msw";
import { TeamSsoPage } from "./settings-team-sso";

const testMetadataXml = `<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata" entityID="urn:example:idp">
  <IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <KeyDescriptor use="signing">
      <KeyInfo xmlns="http://www.w3.org/2000/09/xmldsig#">
        <X509Data>
          <X509Certificate>MIIDZjCCAk6gAwIBAgIBATANBgkqhkiG9w0BAQsFADBEMRMwEQYKCZImiZPyLGQBGRYDY29tMRcwFQYKCZImiZPyLGQBGRYHYXB0aWJsZTEUMBIGA1UEAwwLQXB0aWJsZSBJZFAwHhcNMjMxMTI4MTkwMDAwWhcNMzMxMTI1MTkwMDAwWjBEMRMwEQYKCZImiZPyLGQBGRYDY29tMRcwFQYKCZImiZPyLGQBGRYHYXB0aWJsZTEUMBIGA1UEAwwLQXB0aWJsZSBJZFAwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDDYvCLke2CvCOG2ie8xpxbMKTpvTfGc6PKhPBW0rETLtEFSlCSG3MA5/zN9NYoo+Xi8QDgGyyQMMpS5v1h3r3BXfyByORUjYcL1n7DUCJYD+s0deep/NkzkL2E5UNmliZ21BJOKpSmH3xcFeiU4VBiZarJsKBEB6gXPXnOLWDyyhfoCQXr25eJI4Qp0g2L3krtgOA+K+MZY+hubhe1BYd0Ruao0/9v/s7hT0MXyW2CT7ft3Z08+DEkwdXHdsgVhWsJpxHwVk71b8nszd5qAz5WBfVjZaFJOdT9jstqxonuaPtvi30hfI4RH4ZQUP8k3bU6jlpjqCSH1MgsCYRCpoMxAgMBAAGjYzBhMA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgGGMB0GA1UdDgQWBBRfeJyZuocNpw35Suwwey9kxgHFOzAfBgNVHSMEGDAWgBRfeJyZuocNpw35Suwwey9kxgHFOzANBgkqhkiG9w0BAQsFAAOCAQEANI0IcUAB9ldXsLS0BAbqzjNMbBNf1+BcIz0Gm3XnIq+gevKjwz8mj0CELChw1Ym26SRIQo0OPmjOTxE22dXv5wprjIZR5dKIWCf3BNHOdiB/CIShRt+FX4JY6i4/lSk5SrVw5bgHLlbfm2IeL0DrDptvcnWzXgkmR9XWCYC1ws79509boTcTrueBPAP93LWsN7lHg558XtmwavZWxHvEw1IYHyCuYEjPEtplT0hSzfGC036N+qkfAn2GnaADt5bz8/ko7T0TnVxQnnl5aec1roWHWCeoUAW/q1WGJg0kRLuqf7Fogml/L/VYRRnQkVHWehqW6n/jKrCXzMgGMtgTag==</X509Certificate>
        </X509Data>
      </KeyInfo>
    </KeyDescriptor>
    <SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="http://idp.oktadev.com/logout"/>
    <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
    <NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:persistent</NameIDFormat>
    <NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:transient</NameIDFormat>
    <SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="http://idp.oktadev.com"/>
    <Attribute xmlns="urn:oasis:names:tc:SAML:2.0:assertion" Name="Email" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri" FriendlyName="E-Mail Address"/>
    <Attribute xmlns="urn:oasis:names:tc:SAML:2.0:assertion" Name="FirstName" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri" FriendlyName="First Name"/>
    <Attribute xmlns="urn:oasis:names:tc:SAML:2.0:assertion" Name="LastName" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri" FriendlyName="Last Name"/>
  </IDPSSODescriptor>
</EntityDescriptor>`;

describe("TeamSsoPage", () => {
  describe("when saml configuration exists for org", () => {
    it("should let admin change login ID", async () => {
      let counter = 0;
      server.use(
        rest.get(
          `${testEnv.authUrl}/saml_configurations`,
          async (_, res, ctx) => {
            counter += 1;
            if (counter === 1) {
              return res(
                ctx.json({ _embedded: { saml_configurations: [testSaml] } }),
              );
            }

            return res(
              ctx.json({
                _embedded: {
                  saml_configurations: [{ ...testSaml, handle: "wownice" }],
                },
              }),
            );
          },
        ),
      );

      const { TestProvider, store } = setupIntegrationTest({
        path: TEAM_SSO_PATH,
        initEntries: [teamSsoUrl()],
      });

      await waitForBootup(store);

      render(
        <TestProvider>
          <TeamSsoPage />
        </TestProvider>,
      );

      await screen.findByText(/SSO Login ID/);

      const inp = await screen.findByRole("textbox", { name: /saml-handle/ });
      await act(() => userEvent.type(inp, "wownice"));

      const btn = await screen.findByRole("button", {
        name: /Update Login ID/,
      });
      fireEvent.click(btn);

      await screen.findByText(/sso\/wownice/);
    });

    it("should let admin enforce SSO", async () => {
      server.use(
        rest.get(`${testEnv.authUrl}/saml_configurations`, (_, res, ctx) => {
          return res(
            ctx.json({ _embedded: { saml_configurations: [testSaml] } }),
          );
        }),
      );

      const { TestProvider, store } = setupIntegrationTest({
        path: TEAM_SSO_PATH,
        initEntries: [teamSsoUrl()],
      });

      await waitForBootup(store);

      render(
        <TestProvider>
          <TeamSsoPage />
        </TestProvider>,
      );

      await screen.findByText(/Edit SSO Configuration/);
      const btn = await screen.findByRole("button", { name: /Enable/ });
      fireEvent.click(btn);
      await screen.findByText(/SSO must not be enforced to be removed/);
    });

    describe("when org has SSO enforced", () => {
      it("should let admin add members to SSO exception list", async () => {
        let counter = 0;
        server.use(
          rest.get(`${testEnv.authUrl}/organizations`, (_, res, ctx) => {
            const org = defaultOrgResponse({
              ...testOrg,
              sso_enforced: true,
            });
            return res(ctx.json({ _embedded: { organizations: [org] } }));
          }),
          rest.get(`${testEnv.authUrl}/saml_configurations`, (_, res, ctx) => {
            return res(
              ctx.json({ _embedded: { saml_configurations: [testSaml] } }),
            );
          }),
          rest.get(
            `${testEnv.authUrl}/organizations/:id/whitelist_memberships`,
            (_, res, ctx) => {
              counter += 1;
              if (counter === 1) {
                return res(
                  ctx.json({ _embedded: { whitelist_memberships: [] } }),
                );
              }

              const membership = {
                id: "",
                _links: {
                  user: defaultHalHref(
                    `${testEnv.authUrl}/users/${testUser.id}`,
                  ),
                },
              };

              return res(
                ctx.json({
                  _embedded: {
                    whitelist_memberships: [membership],
                  },
                }),
              );
            },
          ),
        );

        const { TestProvider, store } = setupIntegrationTest({
          path: TEAM_SSO_PATH,
          initEntries: [teamSsoUrl()],
        });

        await waitForBootup(store);

        render(
          <TestProvider>
            <TeamSsoPage />
          </TestProvider>,
        );

        await screen.findByText(/Edit SSO Configuration/);
        const selector = await screen.findByRole("combobox", {
          name: /allowlist-membership/,
        });
        await act(() =>
          userEvent.selectOptions(
            selector,
            `${testUser.name} (${testUser.email})`,
          ),
        );
        const btn = await screen.findByRole("button", { name: /Add/ });
        fireEvent.click(btn);

        await screen.findByText(testUser.email);
      });

      it("should let admin remove member from SSO exception list", async () => {
        let counter = 0;
        server.use(
          rest.get(`${testEnv.authUrl}/organizations`, (_, res, ctx) => {
            const org = defaultOrgResponse({
              ...testOrg,
              sso_enforced: true,
            });
            return res(ctx.json({ _embedded: { organizations: [org] } }));
          }),
          rest.get(`${testEnv.authUrl}/saml_configurations`, (_, res, ctx) => {
            return res(
              ctx.json({ _embedded: { saml_configurations: [testSaml] } }),
            );
          }),
          rest.get(
            `${testEnv.authUrl}/organizations/:id/whitelist_memberships`,
            (_, res, ctx) => {
              counter += 1;
              if (counter === 1) {
                const membership = {
                  id: "",
                  _links: {
                    user: defaultHalHref(
                      `${testEnv.authUrl}/users/${testUser.id}`,
                    ),
                  },
                };

                return res(
                  ctx.json({
                    _embedded: {
                      whitelist_memberships: [membership],
                    },
                  }),
                );
              }

              return res(
                ctx.json({ _embedded: { whitelist_memberships: [] } }),
              );
            },
          ),
        );

        const { TestProvider, store } = setupIntegrationTest({
          path: TEAM_SSO_PATH,
          initEntries: [teamSsoUrl()],
        });

        await waitForBootup(store);

        render(
          <TestProvider>
            <TeamSsoPage />
          </TestProvider>,
        );

        await screen.findByText(/Edit SSO Configuration/);
        const btn = await screen.findByRole("button", { name: /Remove user/ });
        fireEvent.click(btn);
        const confirmBtn = await screen.findByRole("button", {
          name: /Confirm/,
        });
        fireEvent.click(confirmBtn);

        await waitForElementToBeRemoved(() => screen.getByText(testUser.email));
      });

      it("should let admin remove SSO enforcement", async () => {
        server.use(
          rest.get(`${testEnv.authUrl}/organizations`, (_, res, ctx) => {
            const org = defaultOrgResponse({
              ...testOrg,
              sso_enforced: true,
            });
            return res(ctx.json({ _embedded: { organizations: [org] } }));
          }),
          rest.get(`${testEnv.authUrl}/saml_configurations`, (_, res, ctx) => {
            return res(
              ctx.json({ _embedded: { saml_configurations: [testSaml] } }),
            );
          }),
        );

        const { TestProvider, store } = setupIntegrationTest({
          path: TEAM_SSO_PATH,
          initEntries: [teamSsoUrl()],
        });

        await waitForBootup(store);

        render(
          <TestProvider>
            <TeamSsoPage />
          </TestProvider>,
        );

        await screen.findByText(/Edit SSO Configuration/);
        const btn = await screen.findByRole("button", { name: /Disable/ });
        fireEvent.click(btn);
        await screen.findByText(/Remove SSO Config/);
      });

      it("should *not* let admin remove saml configuration", async () => {
        server.use(
          rest.get(`${testEnv.authUrl}/organizations`, (_, res, ctx) => {
            const org = defaultOrgResponse({
              ...testOrg,
              sso_enforced: true,
            });
            return res(ctx.json({ _embedded: { organizations: [org] } }));
          }),
          rest.get(`${testEnv.authUrl}/saml_configurations`, (_, res, ctx) => {
            return res(
              ctx.json({ _embedded: { saml_configurations: [testSaml] } }),
            );
          }),
        );

        const { TestProvider, store } = setupIntegrationTest({
          path: TEAM_SSO_PATH,
          initEntries: [teamSsoUrl()],
        });

        await waitForBootup(store);

        render(
          <TestProvider>
            <TeamSsoPage />
          </TestProvider>,
        );

        await screen.findByText(/Edit SSO Configuration/);
        await screen.findByText(/SSO must not be enforced to be removed/);
      });
    });

    it("should let admin remove saml configuration", async () => {
      let counter = 0;
      server.use(
        rest.get(`${testEnv.authUrl}/saml_configurations`, (_, res, ctx) => {
          counter += 1;
          if (counter === 1) {
            return res(
              ctx.json({ _embedded: { saml_configurations: [testSaml] } }),
            );
          } else {
            return res(ctx.json({ _embedded: { saml_configurations: [] } }));
          }
        }),
      );

      const { TestProvider, store } = setupIntegrationTest({
        path: TEAM_SSO_PATH,
        initEntries: [teamSsoUrl()],
      });

      await waitForBootup(store);

      render(
        <TestProvider>
          <TeamSsoPage />
        </TestProvider>,
      );

      await screen.findByText(/Edit SSO Configuration/);

      const btn = await screen.findByRole("button", {
        name: /Remove SSO Config/,
      });
      fireEvent.click(btn);
      const confirmBtn = await screen.findByRole("button", { name: /Confirm/ });
      fireEvent.click(confirmBtn);

      await screen.findByText(/To configure an SSO Provider/);
    });

    it("should let admin provide a metadata URL to edit saml configuration", async () => {
      let counter = 0;
      server.use(
        rest.get(`${testEnv.authUrl}/saml_configurations`, (_, res, ctx) => {
          counter += 1;
          if (counter === 1) {
            return res(
              ctx.json({ _embedded: { saml_configurations: [testSaml] } }),
            );
          } else {
            const saml = defaultSamlConfigurationResponse({
              id: testSaml.id,
              entity_id: "updated-entity-id",
              sign_in_url: "http://updated.url",
              name_format: "updated-name-format",
              _links: {
                organization: defaultHalHref(
                  `${testEnv.authUrl}/organizations/${testOrg.id}`,
                ),
              },
            });
            return res(
              ctx.json({ _embedded: { saml_configurations: [saml] } }),
            );
          }
        }),
      );

      const { TestProvider, store } = setupIntegrationTest({
        path: TEAM_SSO_PATH,
        initEntries: [teamSsoUrl()],
      });

      await waitForBootup(store);

      render(
        <TestProvider>
          <TeamSsoPage />
        </TestProvider>,
      );

      await screen.findByText(/Edit SSO Configuration/);

      await screen.findByText(/fake-entity-id/);
      await screen.findByText("http://fake.url");
      await screen.findByText(/fake-name-format/);

      const inp = await screen.findByRole("textbox", { name: /metadata-url/ });
      await act(() => userEvent.type(inp, "http://ipd.oktadev.com/metadata"));

      const btn = await screen.findByRole("button", { name: /Save/ });
      fireEvent.click(btn);

      await screen.findByText(/updated-entity-id/);
      await screen.findByText("http://updated.url");
      await screen.findByText(/updated-name-format/);
    });

    it("should let admin provide metadata XML to edit saml configuration", async () => {
      let counter = 0;
      server.use(
        rest.get(`${testEnv.authUrl}/saml_configurations`, (_, res, ctx) => {
          counter += 1;
          if (counter === 1) {
            return res(
              ctx.json({ _embedded: { saml_configurations: [testSaml] } }),
            );
          } else {
            const saml = defaultSamlConfigurationResponse({
              id: testSaml.id,
              entity_id: "updated-entity-id",
              sign_in_url: "http://updated.url",
              name_format: "updated-name-format",
              _links: {
                organization: defaultHalHref(
                  `${testEnv.authUrl}/organizations/${testOrg.id}`,
                ),
              },
            });
            return res(
              ctx.json({ _embedded: { saml_configurations: [saml] } }),
            );
          }
        }),
      );

      const { TestProvider, store } = setupIntegrationTest({
        path: TEAM_SSO_PATH,
        initEntries: [teamSsoUrl()],
      });

      await waitForBootup(store);

      render(
        <TestProvider>
          <TeamSsoPage />
        </TestProvider>,
      );

      await screen.findByText(/Edit SSO Configuration/);

      await screen.findByText(/fake-entity-id/);
      await screen.findByText("http://fake.url");
      await screen.findByText(/fake-name-format/);

      const inp = await screen.findByRole("textbox", { name: /metadata-xml/ });
      fireEvent.change(inp, { target: { value: testMetadataXml } });

      const btn = await screen.findByRole("button", { name: /Save/ });
      fireEvent.click(btn);

      await screen.findByText(/updated-entity-id/);
      await screen.findByText("http://updated.url");
      await screen.findByText(/updated-name-format/);
    });
  });

  describe("when no saml configuration exists for org", () => {
    it("should let admin provide a metadata URL to create a saml configuration", async () => {
      let counter = 0;
      server.use(
        rest.get(`${testEnv.authUrl}/saml_configurations`, (_, res, ctx) => {
          counter += 1;
          if (counter === 1) {
            return res(ctx.json({ _embedded: { saml_configurations: [] } }));
          }

          const saml = defaultSamlConfigurationResponse({
            id: `${createId()}`,
            _links: {
              organization: defaultHalHref(
                `${testEnv.authUrl}/organizations/${testOrg.id}`,
              ),
            },
          });
          return res(ctx.json({ _embedded: { saml_configurations: [saml] } }));
        }),
      );

      const { TestProvider, store } = setupIntegrationTest({
        path: TEAM_SSO_PATH,
        initEntries: [teamSsoUrl()],
      });

      await waitForBootup(store);

      render(
        <TestProvider>
          <TeamSsoPage />
        </TestProvider>,
      );

      await screen.findByText(/To configure an SSO Provider/);

      const inp = await screen.findByRole("textbox", { name: /metadata-url/ });
      await act(() => userEvent.type(inp, "http://ipd.oktadev.com/metadata"));

      const btn = await screen.findByRole("button", { name: /Save/ });
      fireEvent.click(btn);

      await screen.findByText(/Edit SSO Configuration/);
    });

    it("should let admin provide metadata XML to create a saml configuration", async () => {
      let counter = 0;
      server.use(
        rest.get(`${testEnv.authUrl}/saml_configurations`, (_, res, ctx) => {
          counter += 1;
          if (counter === 1) {
            return res(ctx.json({ _embedded: { saml_configurations: [] } }));
          }

          const saml = defaultSamlConfigurationResponse({
            id: `${createId()}`,
            _links: {
              organization: defaultHalHref(
                `${testEnv.authUrl}/organizations/${testOrg.id}`,
              ),
            },
          });
          return res(ctx.json({ _embedded: { saml_configurations: [saml] } }));
        }),
      );

      const { TestProvider, store } = setupIntegrationTest({
        path: TEAM_SSO_PATH,
        initEntries: [teamSsoUrl()],
      });

      await waitForBootup(store);

      render(
        <TestProvider>
          <TeamSsoPage />
        </TestProvider>,
      );

      await screen.findByText(/To configure an SSO Provider/);

      const inp = await screen.findByRole("textbox", { name: /metadata-xml/ });
      fireEvent.change(inp, { target: { value: testMetadataXml } });

      const btn = await screen.findByRole("button", { name: /Save/ });
      fireEvent.click(btn);

      await screen.findByText(/Edit SSO Configuration/);
    });
  });
});
