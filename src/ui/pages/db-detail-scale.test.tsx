import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  server,
  stacksWithResources,
  testAccount,
  testDatabaseId,
  testDatabasePostgres,
} from "@app/mocks";
import { DATABASE_SCALE_PATH, databaseScaleUrl } from "@app/routes";
import { setupIntegrationTest, waitForToken } from "@app/test";

import { DatabaseScalePage } from "./db-detail-scale";

describe("DatabaseScalePage", () => {
  it("should successfully show database scale page happy path", async () => {
    server.use(
      ...stacksWithResources({
        accounts: [testAccount],
        databases: [testDatabasePostgres],
      }),
    );
    const { TestProvider, store } = setupIntegrationTest({
      initEntries: [databaseScaleUrl(`${testDatabaseId}`)],
      path: DATABASE_SCALE_PATH,
    });

    await waitForToken(store);

    render(
      <TestProvider>
        <DatabaseScalePage />
      </TestProvider>,
    );

    await screen.findByText(
      /Optimize container performance with a custom profile./,
    );
  });
});
