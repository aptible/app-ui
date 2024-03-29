import { defaultEndpointResponse, selectEndpointById } from "@app/deploy";
import {
  createId,
  server,
  stacksWithResources,
  testAccount,
  testDatabasePostgres,
  testEnv,
  verifiedUserHandlers,
} from "@app/mocks";
import { useSelector } from "@app/react";
import {
  DATABASE_ENDPOINT_CREATE_PATH,
  ENDPOINT_DETAIL_PATH,
  databaseEndpointCreateUrl,
} from "@app/routes";
import { setupIntegrationTest, waitForBootup, waitForEnv } from "@app/test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { useParams } from "react-router";
import { DatabaseCreateEndpointPage } from "./database-create-endpoint";

const TestDetailPage = () => {
  const { id = "" } = useParams();
  const enp = useSelector((s) => selectEndpointById(s, { id }));
  return (
    <div>
      <div>Endpoint detail page</div>
      <div>id: {enp.id}</div>
      <div>ip: {enp.ipWhitelist.join(",")}</div>
    </div>
  );
};

const testId = createId();
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
          _links: {
            ...enp._links,
          },
          ...jso,
        };
        return res(ctx.json(data));
      },
    ),
    ...stacksWithResources({
      accounts: [testAccount],
      databases: [testDatabasePostgres],
    }),
    ...verifiedUserHandlers(),
  );

  const tester = setupIntegrationTest({
    initEntries: [databaseEndpointCreateUrl(`${testDatabasePostgres.id}`)],
    path: DATABASE_ENDPOINT_CREATE_PATH,
    additionalRoutes: [
      {
        path: ENDPOINT_DETAIL_PATH,
        element: <TestDetailPage />,
      },
    ],
  });

  return tester;
};

describe("DatabaseCreateEndpointPage", () => {
  describe("when ip allowlist is provided", () => {
    it("should navigate to endpoint detail page", async () => {
      const { store, TestProvider } = setupTests();

      await waitForBootup(store);

      render(
        <TestProvider>
          <DatabaseCreateEndpointPage />
        </TestProvider>,
      );

      await waitForEnv(store, testAccount.id);

      await screen.findByText(
        /If you only need to access your database from apps/,
      );

      const ipStr = "192.168.1.1";
      const ip = await screen.findByRole("textbox", { name: /ip-allowlist/ });
      await act(() => userEvent.type(ip, ipStr));

      const btn = await screen.findByRole("button", { name: /Save Endpoint/ });
      fireEvent.click(btn);

      await screen.findByText(/Endpoint detail page/);
      expect(screen.getByText(`id: ${testId}`));
      expect(screen.getByText(`ip: ${ipStr}`));
    });
  });

  describe("when ip allowlist is *not* provided", () => {
    it("should navigate to endpoint detail page", async () => {
      const { store, TestProvider } = setupTests();

      await waitForBootup(store);

      render(
        <TestProvider>
          <DatabaseCreateEndpointPage />
        </TestProvider>,
      );

      await waitForEnv(store, testAccount.id);

      await screen.findByText(
        /If you only need to access your database from apps/,
      );

      const btn = await screen.findByRole("button", { name: /Save Endpoint/ });
      fireEvent.click(btn);

      await screen.findByText(/Endpoint detail page/);
      expect(screen.getByText(`id: ${testId}`));
      expect(screen.getByText("ip:"));
    });
  });
});
