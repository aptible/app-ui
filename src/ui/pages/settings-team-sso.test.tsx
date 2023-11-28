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
          <X509Certificate>MIIDPDCCAiQCCQDydJgOlszqbzANBgkqhkiG9w0BAQUFADBgMQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZyYW5jaXNjbzEQMA4GA1UEChMHSmFua3lDbzESMBAGA1UEAxMJbG9jYWxob3N0MB4XDTE0MDMxMjE5NDYzM1oXDTI3MTExOTE5NDYzM1owYDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBGcmFuY2lzY28xEDAOBgNVBAoTB0phbmt5Q28xEjAQBgNVBAMTCWxvY2FsaG9zdDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMGvJpRTTasRUSPqcbqCG+ZnTAurnu0vVpIG9lzExnh11o/BGmzu7lB+yLHcEdwrKBBmpepDBPCYxpVajvuEhZdKFx/Fdy6j5mH3rrW0Bh/zd36CoUNjbbhHyTjeM7FN2yF3u9lcyubuvOzr3B3gX66IwJlU46+wzcQVhSOlMk2tXR+fIKQExFrOuK9tbX3JIBUqItpI+HnAow509CnM134svw8PTFLkR6/CcMqnDfDK1m993PyoC1Y+N4X9XkhSmEQoAlAHPI5LHrvuujM13nvtoVYvKYoj7ScgumkpWNEvX652LfXOnKYlkB8ZybuxmFfIkzedQrbJsyOhfL03cMECAwEAATANBgkqhkiG9w0BAQUFAAOCAQEAeHwzqwnzGEkxjzSD47imXaTqtYyETZow7XwBc0ZaFS50qRFJUgKTAmKS1xQBP/qHpStsROT35DUxJAE6NY1Kbq3ZbCuhGoSlY0L7VzVT5tpu4EY8+Dq/u2EjRmmhoL7UkskvIZ2n1DdERtd+YUMTeqYl9co43csZwDno/IKomeN5qaPc39IZjikJ+nUC6kPFKeu/3j9rgHNlRtocI6S1FdtFz9OZMQlpr0JbUt2T3xS/YoQJn6coDmJL5GTiiKM6cOe+Ur1VwzS1JEDbSS2TWWhzq8ojLdrotYLGd9JOsoQhElmz+tMfCFQUFLExinPAyy7YHlSiVX13QH2XTu/iQQ==</X509Certificate>
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

      await screen.findByText(/You haven't configured an SSO provider/);
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

      await screen.findByText(/You haven't configured an SSO provider/);

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

      await screen.findByText(/You haven't configured an SSO provider/);

      const inp = await screen.findByRole("textbox", { name: /metadata-xml/ });
      fireEvent.change(inp, { target: { value: testMetadataXml } });

      const btn = await screen.findByRole("button", { name: /Save/ });
      fireEvent.click(btn);

      await screen.findByText(/Edit SSO Configuration/);
    });
  });
});
