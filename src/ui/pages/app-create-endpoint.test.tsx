import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSelector } from "react-redux";
import { useParams } from "react-router";

import {
  defaultDeployCertificate,
  defaultEndpointResponse,
  selectEndpointById,
} from "@app/deploy";
import {
  createId,
  server,
  stacksWithResources,
  testAccount,
  testApp,
  testEnv,
  verifiedUserHandlers,
} from "@app/mocks";
import {
  APP_ENDPOINTS_PATH,
  ENDPOINT_DETAIL_PATH,
  appEndpointsUrl,
} from "@app/routes";
import { setupIntegrationTest, waitForBootup } from "@app/test";
import { AppState } from "@app/types";

import { defaultHalHref } from "@app/hal";
import { rest } from "msw";
import { AppCreateEndpointPage } from "./app-create-endpoint";

const TestDetailPage = () => {
  const { id = "" } = useParams();
  const enp = useSelector((s: AppState) => selectEndpointById(s, { id }));
  return (
    <div>
      <div>Endpoint detail page</div>
      <div>id: {enp.id}</div>
      <div>host: {enp.externalHost}</div>
      <div>ip: {enp.ipWhitelist.join(",")}</div>
      <div>port: {enp.containerPort}</div>
      <div>acme: {enp.acmeStatus}</div>
      <div>cert: {enp.certificateId}</div>
    </div>
  );
};

const testId = createId();
const certId = createId();
const setupTests = () => {
  const enp = defaultEndpointResponse({
    id: testId,
    status: "provisioned",
  });
  server.use(
    rest.post(
      `${testEnv.apiUrl}/services/:serviceId/vhosts`,
      async (req, res, ctx) => {
        const jso = await req.json();
        const data = {
          ...enp,
          acme_status: "pending",
          external_host: jso.user_domain,
          _links: {
            ...enp._links,
            certificate: defaultHalHref(
              `${testEnv.apiUrl}/certificates/${certId}`,
            ),
          },
          ...jso,
        };
        return res(ctx.json(data));
      },
    ),
    rest.post(
      `${testEnv.apiUrl}/accounts/:id/certificates`,
      async (_, res, ctx) => {
        return res(ctx.json(defaultDeployCertificate({ id: `${certId}` })));
      },
    ),
    ...stacksWithResources({ accounts: [testAccount], apps: [testApp] }),
    ...verifiedUserHandlers(),
  );

  const tester = setupIntegrationTest({
    initEntries: [appEndpointsUrl(`${testApp.id}`)],
    path: APP_ENDPOINTS_PATH,
    additionalRoutes: [
      {
        path: ENDPOINT_DETAIL_PATH,
        element: <TestDetailPage />,
      },
    ],
  });

  return tester;
};

describe("AppCreateEndpointPage", () => {
  describe("when provisioning a managed https endpoint", () => {
    it("should display error when no domain provided", async () => {
      const { store, TestProvider } = setupTests();

      await waitForBootup(store);

      render(
        <TestProvider>
          <AppCreateEndpointPage />
        </TestProvider>,
      );

      await waitForBootup(store);

      await screen.findByText(
        /This Endpoint will accept HTTP and HTTPS traffic/,
      );

      const cmdRadio = await screen.findByRole("radio", { name: /rails s/ });
      fireEvent.click(cmdRadio);

      const enpType = await screen.findByRole("combobox", {
        name: /Endpoint Type/,
      });
      await act(() => userEvent.selectOptions(enpType, "managed"));

      const btn = await screen.findByRole("button", { name: /Save Endpoint/ });
      fireEvent.click(btn);

      await screen.findByText(/A domain is required/);
      expect(screen.queryByText(/A domain is required/)).toBeInTheDocument();
    });

    it("should navigate to endpoint detail page", async () => {
      const { store, TestProvider } = setupTests();

      await waitForBootup(store);

      render(
        <TestProvider>
          <AppCreateEndpointPage />
        </TestProvider>,
      );

      await waitForBootup(store);

      await screen.findByText(
        /This Endpoint will accept HTTP and HTTPS traffic/,
      );

      const cmdRadio = await screen.findByRole("radio", { name: /rails s/ });
      fireEvent.click(cmdRadio);

      const enpType = await screen.findByRole("combobox", {
        name: /Endpoint Type/,
      });
      await act(() => userEvent.selectOptions(enpType, "managed"));

      const domainStr = "test.aptible.com";
      const domain = await screen.findByRole("textbox", { name: /domain/ });
      await act(() => userEvent.type(domain, domainStr));

      const portStr = "5432";
      const port = await screen.findByRole("textbox", { name: /port/ });
      await act(() => userEvent.type(port, portStr));

      const ipStr = "1.1.1.1\n2.2.2.2\n3.3.3.3";
      const ip = await screen.findByRole("textbox", { name: /ip-allowlist/ });
      await act(() => userEvent.type(ip, ipStr));

      const btn = await screen.findByRole("button", { name: /Save Endpoint/ });
      fireEvent.click(btn);

      await screen.findByText(/Endpoint detail page/);
      expect(screen.getByText(`id: ${testId}`));
      expect(screen.getByText(`host: ${domainStr}`));
      expect(screen.getByText(`port: ${portStr}`));
      expect(screen.getByText(`ip: ${ipStr.replaceAll("\n", ",")}`));
    });
  });

  describe("when provisioning a custom https endpoint", () => {
    it("should display error when no cert provided", async () => {
      const { store, TestProvider } = setupTests();

      await waitForBootup(store);

      render(
        <TestProvider>
          <AppCreateEndpointPage />
        </TestProvider>,
      );

      await waitForBootup(store);

      await screen.findByText(
        /This Endpoint will accept HTTP and HTTPS traffic/,
      );

      const cmdRadio = await screen.findByRole("radio", { name: /rails s/ });
      fireEvent.click(cmdRadio);

      const enpType = await screen.findByRole("combobox", {
        name: /Endpoint Type/,
      });
      await act(() => userEvent.selectOptions(enpType, "custom"));

      const newCert = await screen.findByLabelText(/Create a New Certificate/);
      fireEvent.click(newCert);

      const btn = await screen.findByRole("button", { name: /Save Endpoint/ });
      fireEvent.click(btn);

      await screen.findAllByText(/A certificate is required/);
      expect(
        screen.queryAllByText(/A certificate is required/)[0],
      ).toBeInTheDocument();

      await screen.findByText(/A private key is required/);
      expect(
        screen.queryByText(/A private key is required/),
      ).toBeInTheDocument();
    });

    it("should display error when no private key provided", async () => {
      const { store, TestProvider } = setupTests();

      await waitForBootup(store);

      render(
        <TestProvider>
          <AppCreateEndpointPage />
        </TestProvider>,
      );

      await waitForBootup(store);

      await screen.findByText(
        /This Endpoint will accept HTTP and HTTPS traffic/,
      );

      const cmdRadio = await screen.findByRole("radio", { name: /rails s/ });
      fireEvent.click(cmdRadio);

      const enpType = await screen.findByRole("combobox", {
        name: /Endpoint Type/,
      });
      await act(() => userEvent.selectOptions(enpType, "custom"));

      const newCert = await screen.findByLabelText(/Create a New Certificate/);
      fireEvent.click(newCert);

      const certStr = "wow";
      const port = await screen.findByRole("textbox", { name: /cert/ });
      await act(() => userEvent.type(port, certStr));

      const btn = await screen.findByRole("button", { name: /Save Endpoint/ });
      fireEvent.click(btn);

      await screen.findByText(/A private key is required/);
      expect(
        screen.queryByText(/A private key is required/),
      ).toBeInTheDocument();

      expect(
        screen.queryByText(/A certificate is required/),
      ).not.toBeInTheDocument();
    });

    it("should navigate to endpoint detail page", async () => {
      const { store, TestProvider } = setupTests();

      await waitForBootup(store);

      render(
        <TestProvider>
          <AppCreateEndpointPage />
        </TestProvider>,
      );

      await waitForBootup(store);

      await screen.findByText(
        /This Endpoint will accept HTTP and HTTPS traffic/,
      );

      const cmdRadio = await screen.findByRole("radio", { name: /rails s/ });
      fireEvent.click(cmdRadio);

      const enpType = await screen.findByRole("combobox", {
        name: /Endpoint Type/,
      });
      await act(() => userEvent.selectOptions(enpType, "custom"));

      const newCert = await screen.findByLabelText(/Create a New Certificate/);
      fireEvent.click(newCert);

      const certStr = "wow";
      const cert = await screen.findByRole("textbox", { name: /cert/ });
      await act(() => userEvent.type(cert, certStr));

      const privStr = "zzz";
      const priv = await screen.findByRole("textbox", { name: /private-key/ });
      await act(() => userEvent.type(priv, privStr));

      const btn = await screen.findByRole("button", { name: /Save Endpoint/ });
      fireEvent.click(btn);

      await screen.findByText(/Endpoint detail page/);
      expect(screen.getByText(`id: ${testId}`));
      expect(screen.getByText(`cert: ${certId}`));
    });
  });
});
