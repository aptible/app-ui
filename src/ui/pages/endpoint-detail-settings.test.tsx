import {
  defaultCertificateResponse,
  defaultEndpointResponse,
  defaultOperationResponse,
} from "@app/deploy";
import { defaultHalHref } from "@app/hal";
import {
  createId,
  server,
  stacksWithResources,
  testAccount,
  testApp,
  testEndpoint,
  testEnv,
  testServiceRails,
  verifiedUserHandlers,
} from "@app/mocks";
import { endpointDetailSettingsUrl } from "@app/routes";
import { setupAppIntegrationTest, waitForBootup } from "@app/test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";

describe("EndpointSettings for an Endpoint associated with an App", () => {
  describe("when user edits ip allowlist", () => {
    it("should update the ip allowlist", async () => {
      server.use(
        ...verifiedUserHandlers(),
        ...stacksWithResources({
          accounts: [testAccount],
          apps: [testApp],
          services: [testServiceRails],
        }),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [endpointDetailSettingsUrl(`${testEndpoint.id}`)],
      });
      await waitForBootup(store);
      render(<App />);

      const input = await screen.findByLabelText("IP Allowlist");
      await act(() => userEvent.type(input, "127.0.0.1"));

      const btn = await screen.findByRole("button", { name: /Save Changes/ });
      fireEvent.click(btn);

      await screen.findByText(/Operations show real-time changes to resources/);
      await screen.findByText(/127.0.0.1/);
      expect(screen.queryByText(/127.0.0.1/)).toBeInTheDocument();
    });
  });

  describe("when user edits container port", () => {
    it("should update the container port", async () => {
      server.use(
        ...verifiedUserHandlers(),
        ...stacksWithResources({
          accounts: [testAccount],
          apps: [testApp],
          services: [testServiceRails],
        }),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [endpointDetailSettingsUrl(`${testEndpoint.id}`)],
      });
      await waitForBootup(store);
      render(<App />);

      const input = await screen.findByRole("textbox", { name: "port" });
      await act(() => userEvent.type(input, "5000"));

      const btn = await screen.findByRole("button", { name: /Save Changes/ });
      fireEvent.click(btn);

      await screen.findByText(/Current container port: 5000/);
      expect(
        screen.queryByText(/Current container port: 5000/),
      ).toBeInTheDocument();
      await screen.findByText(/Operations show real-time changes to resources/);
    });
  });

  describe("when endpoint does not require a cert", () => {
    it("should *not* display cert selector", async () => {
      server.use(...verifiedUserHandlers());

      const { App, store } = setupAppIntegrationTest({
        initEntries: [endpointDetailSettingsUrl(`${testEndpoint.id}`)],
      });
      await waitForBootup(store);
      render(<App />);

      expect(screen.queryByText(/Certificate/)).not.toBeInTheDocument();
    });
  });

  describe("when endpoint requires as cert", () => {
    it("should display cert selector", async () => {
      const curCert = defaultCertificateResponse({
        id: createId(),
        common_name: "cur cert",
        _links: {
          account: defaultHalHref(
            `${testEnv.apiUrl}/accounts/${testAccount.id}`,
          ),
        },
      });

      const enp = defaultEndpointResponse({
        id: createId(),
        default: false,
        acme: false,
        type: "http",
        _links: {
          service: defaultHalHref(
            `${testEnv.apiUrl}/services/${testServiceRails.id}`,
          ),
          certificate: defaultHalHref(
            `${testEnv.apiUrl}/certificates/${curCert.id}`,
          ),
        },
      });

      server.use(
        ...verifiedUserHandlers(),
        ...stacksWithResources({
          accounts: [testAccount],
          apps: [testApp],
          services: [testServiceRails],
        }),
        rest.get(`${testEnv.apiUrl}/vhosts/:id`, (_, res, ctx) => {
          return res(ctx.json(enp));
        }),
        rest.get(`${testEnv.apiUrl}/vhosts`, (_, res, ctx) => {
          return res(ctx.json({ _embedded: { vhosts: [enp] } }));
        }),
        rest.get(`${testEnv.apiUrl}/certificates/:id`, async (_, res, ctx) => {
          return res(ctx.json(curCert));
        }),
        rest.get(
          `${testEnv.apiUrl}/accounts/:id/certificates`,
          async (_, res, ctx) => {
            return res(ctx.json({ _embedded: { certificates: [curCert] } }));
          },
        ),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [endpointDetailSettingsUrl(`${enp.id}`)],
      });
      await waitForBootup(store);
      render(<App />);

      await screen.findAllByText(/Certificate/);
      expect(screen.queryAllByText(/Certificate/)[0]).toBeInTheDocument();
      await screen.findByText(/cur cert/);
      expect(screen.queryByText(/cur cert/)).toBeInTheDocument();
    });
  });

  describe("when user changes current cert", () => {
    describe("when user adds new cert", () => {
      it("should replace current cert with a new one", async () => {
        const certActual = {
          certificate_body: "",
          private_key: "",
          certificate: "",
        };
        const curCert = defaultCertificateResponse({
          id: createId(),
          common_name: "cur cert",
          _links: {
            account: defaultHalHref(
              `${testEnv.apiUrl}/accounts/${testAccount.id}`,
            ),
          },
        });

        const nextCert = defaultCertificateResponse({
          id: createId(),
          common_name: "next cert",
          _links: {
            account: defaultHalHref(
              `${testEnv.apiUrl}/accounts/${testAccount.id}`,
            ),
          },
        });

        const enp = defaultEndpointResponse({
          id: createId(),
          default: false,
          acme: false,
          type: "http",
          _links: {
            service: defaultHalHref(
              `${testEnv.apiUrl}/services/${testServiceRails.id}`,
            ),
            certificate: defaultHalHref(
              `${testEnv.apiUrl}/certificates/${curCert.id}`,
            ),
          },
        });

        server.use(
          ...verifiedUserHandlers(),
          ...stacksWithResources({
            accounts: [testAccount],
            apps: [testApp],
            services: [testServiceRails],
          }),
          rest.get(`${testEnv.apiUrl}/vhosts/:id`, (_, res, ctx) => {
            return res(ctx.json(enp));
          }),
          rest.get(`${testEnv.apiUrl}/vhosts`, (_, res, ctx) => {
            return res(ctx.json({ _embedded: { vhosts: [enp] } }));
          }),
          rest.get(
            `${testEnv.apiUrl}/certificates/:id`,
            async (_, res, ctx) => {
              return res(ctx.json(curCert));
            },
          ),
          rest.get(
            `${testEnv.apiUrl}/accounts/:id/certificates`,
            async (_, res, ctx) => {
              return res(ctx.json({ _embedded: { certificates: [curCert] } }));
            },
          ),
          rest.get(`${testEnv.apiUrl}/vhosts/:id/operations`, (_, res, ctx) => {
            return res(
              ctx.json({
                _embedded: {
                  operations: [
                    defaultOperationResponse({
                      id: createId(),
                      type: "provision",
                      status: "succeeded",
                      _links: {
                        resource: defaultHalHref(
                          `${testEnv.apiUrl}/vhosts/${enp.id}`,
                        ),
                        account: testApp._links.account,
                        code_scan_result: defaultHalHref(),
                        self: defaultHalHref(),
                        ssh_portal_connections: defaultHalHref(),
                        ephemeral_sessions: defaultHalHref(),
                        logs: defaultHalHref(),
                        user: defaultHalHref(),
                      },
                    }),
                  ],
                },
              }),
            );
          }),
          rest.post(
            `${testEnv.apiUrl}/accounts/:id/certificates`,
            async (req, res, ctx) => {
              const data = await req.json();
              certActual.certificate_body = data.certificate_body;
              certActual.private_key = data.private_key;
              return res(ctx.json(nextCert));
            },
          ),
          rest.patch(`${testEnv.apiUrl}/vhosts/:id`, async (req, res, ctx) => {
            const data = await req.json();
            certActual.certificate = data.certificate;
            return res(
              ctx.json({
                ...enp,
                _links: {
                  service: defaultHalHref(
                    `${testEnv.apiUrl}/services/${testServiceRails.id}`,
                  ),
                  certificate: defaultHalHref(
                    `${testEnv.apiUrl}/certificates/${nextCert.id}`,
                  ),
                },
              }),
            );
          }),
        );

        const { App, store } = setupAppIntegrationTest({
          initEntries: [endpointDetailSettingsUrl(`${enp.id}`)],
        });
        await waitForBootup(store);
        render(<App />);

        await screen.findAllByText(/Certificate/);
        const newBtn = await screen.findByRole("checkbox", {
          name: "new-cert",
        });
        fireEvent.click(newBtn);

        const certStr = "wow";
        const port = await screen.findByRole("textbox", { name: /cert/ });
        await act(() => userEvent.type(port, certStr));

        const privStr = "zzz";
        const priv = await screen.findByRole("textbox", {
          name: /private-key/,
        });
        await act(() => userEvent.type(priv, privStr));

        const btn = await screen.findByRole("button", { name: /Save Changes/ });
        fireEvent.click(btn);

        await screen.findByText(
          /Operations show real-time changes to resources/,
        );

        expect(certActual.certificate_body).toEqual(certStr);
        expect(certActual.private_key).toEqual(privStr);
        expect(certActual.certificate).toEqual(
          `${testEnv.apiUrl}/certificates/${nextCert.id}`,
        );
      });
    });

    describe("when user changes cert to an already existing cert", () => {
      it("should replace current cert with an already existing one", async () => {
        const curCert = defaultCertificateResponse({
          id: createId(),
          common_name: "cur cert",
          _links: {
            account: defaultHalHref(
              `${testEnv.apiUrl}/accounts/${testAccount.id}`,
            ),
          },
        });

        const otherCert = defaultCertificateResponse({
          id: createId(),
          common_name: "other cert",
          _links: {
            account: defaultHalHref(
              `${testEnv.apiUrl}/accounts/${testAccount.id}`,
            ),
          },
        });

        const enp = defaultEndpointResponse({
          id: createId(),
          default: false,
          acme: false,
          type: "http",
          _links: {
            service: defaultHalHref(
              `${testEnv.apiUrl}/services/${testServiceRails.id}`,
            ),
            certificate: defaultHalHref(
              `${testEnv.apiUrl}/certificates/${curCert.id}`,
            ),
          },
        });

        server.use(
          ...verifiedUserHandlers(),
          ...stacksWithResources({
            accounts: [testAccount],
            apps: [testApp],
            services: [testServiceRails],
          }),
          rest.get(`${testEnv.apiUrl}/vhosts/:id`, (_, res, ctx) => {
            return res(ctx.json(enp));
          }),
          rest.get(`${testEnv.apiUrl}/vhosts`, (_, res, ctx) => {
            return res(ctx.json({ _embedded: { vhosts: [enp] } }));
          }),
          rest.get(
            `${testEnv.apiUrl}/certificates/:id`,
            async (_, res, ctx) => {
              return res(ctx.json(curCert));
            },
          ),
          rest.get(
            `${testEnv.apiUrl}/accounts/:id/certificates`,
            async (_, res, ctx) => {
              return res(
                ctx.json({ _embedded: { certificates: [curCert, otherCert] } }),
              );
            },
          ),
          rest.get(`${testEnv.apiUrl}/vhosts/:id/operations`, (_, res, ctx) => {
            return res(
              ctx.json({
                _embedded: {
                  operations: [
                    defaultOperationResponse({
                      id: createId(),
                      type: "provision",
                      status: "succeeded",
                      _links: {
                        resource: defaultHalHref(
                          `${testEnv.apiUrl}/vhosts/${enp.id}`,
                        ),
                        account: testApp._links.account,
                        code_scan_result: defaultHalHref(),
                        self: defaultHalHref(),
                        ssh_portal_connections: defaultHalHref(),
                        ephemeral_sessions: defaultHalHref(),
                        logs: defaultHalHref(),
                        user: defaultHalHref(),
                      },
                    }),
                  ],
                },
              }),
            );
          }),
        );

        const { App, store } = setupAppIntegrationTest({
          initEntries: [endpointDetailSettingsUrl(`${enp.id}`)],
        });
        await waitForBootup(store);
        render(<App />);

        await screen.findAllByText(/Certificate/);

        await screen.findByText(/other cert/);
        const certSelector = await screen.findByRole("combobox", {
          name: /existing-cert/,
        });
        await act(() =>
          userEvent.selectOptions(certSelector, "other cert - Unknown Issuer"),
        );

        const btn = await screen.findByRole("button", { name: /Save Changes/ });
        fireEvent.click(btn);

        await screen.findByText(
          /Operations show real-time changes to resources/,
        );
      });
    });
  });
});
