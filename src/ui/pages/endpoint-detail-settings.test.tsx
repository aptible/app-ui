import {
  defaultCertificateResponse,
  defaultEndpointResponse,
} from "@app/deploy";
import { defaultHalHref } from "@app/hal";
import {
  createId,
  server,
  stacksWithResources,
  testAccount,
  testApp,
  testEnv,
  testServiceRails,
  verifiedUserHandlers,
} from "@app/mocks";
import { endpointDetailSettingsUrl } from "@app/routes";
import { setupAppIntegrationTest, waitForBootup } from "@app/test";
import { render, screen } from "@testing-library/react";
import { rest } from "msw";

describe("EndpointSettings", () => {
  describe("when endpoint does not require a cert", () => {
    it("should *not* display cert selector", async () => {

    });
  });

  describe("when user edits ip allowlist", () => {
    it("should update the ip allowlist", async () => {});
  });

  describe("when user edits container port", () => {
    it("should update the container port", async () => {});
  });

  describe("when endpoint requires as cert", () => {
    it("should display cert selector", async () => {
      const curCert = defaultCertificateResponse({
        id: createId(),
        common_name: "cur cert",
        _links: {
          account: defaultHalHref(`${testEnv.apiUrl}/accounts/${testAccount.id}`),
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
      expect(screen.queryByText(/cur cert/)).toBeInTheDocument()
    });
  });

  describe("when user changes current cert", () => {
    describe("when user adds new cert", () => {
      it("should replace current cert with a new one", async () => {});
    });
    describe("when user changes cert to an already existing cert", () => {
      it("should replace current cert with an already existing one", async () => {});
    });
  });
});
