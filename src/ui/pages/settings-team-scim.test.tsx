import { server, testEnv, testScim } from "@app/mocks";
import { TEAM_SCIM_PATH, teamScimUrl } from "@app/routes";
import { setupIntegrationTest, waitForBootup } from "@app/test";
import { render, screen } from "@testing-library/react";
import { rest } from "msw";
import { TeamScimPage } from "./settings-team-scim";

describe("Team SCIM Page", () => {
  describe("when scim configuration exists for org", () => {
    it("should show org owners the edit option", async () => {
      let counter = 0;
      server.use(
        rest.get(
          `${testEnv.authUrl}/scim_configurations`,
          async (_, res, ctx) => {
            counter += 1;
            if (counter === 1) {
              return res(
                ctx.json({ _embedded: { scim_configurations: [testScim] } }),
              );
            }

            return res(
              ctx.json({
                _embedded: {
                  scim_configurations: [{ ...testScim }],
                },
              }),
            );
          },
        ),
      );

      const { TestProvider, store } = setupIntegrationTest({
        path: TEAM_SCIM_PATH,
        initEntries: [teamScimUrl()],
      });

      await waitForBootup(store);

      render(
        <TestProvider>
          <TeamScimPage />
        </TestProvider>,
      );

      await screen.findByText(/Edit SCIM Configuration/);
    });
  });
});
