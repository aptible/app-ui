import { defaultEnvResponse, defaultStackResponse } from "@app/deploy";
import { defaultHalHref } from "@app/hal";
import {
  createId,
  server,
  stacksWithResources,
  testEnv,
  testRoleOwner,
  verifiedUserHandlers,
} from "@app/mocks";
import { deployUrl } from "@app/routes";
import { setupAppIntegrationTest, waitForBootup } from "@app/test";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("Environment selector and creator flow", () => {
  describe("when there is no stack_id in query param", () => {
    it("should allow user to select environments within stack", async () => {
      const stack1 = defaultStackResponse({
        id: createId(),
        name: "stack-1-stack",
      });
      const stack2 = defaultStackResponse({
        id: createId(),
        name: "stack-2-stack",
      });
      server.use(
        ...verifiedUserHandlers({ role: testRoleOwner }),
        ...stacksWithResources({
          stacks: [stack1, stack2],
          accounts: [
            defaultEnvResponse({
              id: createId(),
              handle: "stack-1-env-1",
              _links: {
                stack: defaultHalHref(`${testEnv.apiUrl}/stacks/${stack1.id}`),
              },
            }),
            defaultEnvResponse({
              id: createId(),
              handle: "stack-1-env-2",
              _links: {
                stack: defaultHalHref(`${testEnv.apiUrl}/stacks/${stack1.id}`),
              },
            }),
            defaultEnvResponse({
              id: createId(),
              handle: "stack-2-env-1",
              _links: {
                stack: defaultHalHref(`${testEnv.apiUrl}/stacks/${stack2.id}`),
              },
            }),
            defaultEnvResponse({
              id: createId(),
              handle: "stack-2-env-2",
              _links: {
                stack: defaultHalHref(`${testEnv.apiUrl}/stacks/${stack2.id}`),
              },
            }),
          ],
        }),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [deployUrl()],
      });

      await waitForBootup(store);

      render(<App />);

      const selectors = await screen.findAllByRole("combobox");

      const stackSelector = selectors[0];
      await act(() => userEvent.selectOptions(stackSelector, "stack-2-stack"));

      const envSelector = selectors[1];
      await act(() => userEvent.selectOptions(envSelector, "stack-2-env-1"));

      await screen.findByRole("button", {
        name: /Next/,
      });

      await screen.findByText(/stack-2-stack/);
      await screen.findByText(/stack-2-env-1/);

      expect(true).toBe(true);
    });
  });

  describe("when there is a valid stack_id in query param", () => {
    it("should allow user to select environments within stack preselected", async () => {
      const stack1 = defaultStackResponse({
        id: createId(),
        name: "stack-1-stack",
      });
      const stack2 = defaultStackResponse({
        id: createId(),
        name: "stack-2-stack",
      });
      server.use(
        ...verifiedUserHandlers({ role: testRoleOwner }),
        ...stacksWithResources({
          stacks: [stack1, stack2],
          accounts: [
            defaultEnvResponse({
              id: createId(),
              handle: "stack-1-env-1",
              _links: {
                stack: defaultHalHref(`${testEnv.apiUrl}/stacks/${stack1.id}`),
              },
            }),
            defaultEnvResponse({
              id: createId(),
              handle: "stack-1-env-2",
              _links: {
                stack: defaultHalHref(`${testEnv.apiUrl}/stacks/${stack1.id}`),
              },
            }),
            defaultEnvResponse({
              id: createId(),
              handle: "stack-2-env-1",
              _links: {
                stack: defaultHalHref(`${testEnv.apiUrl}/stacks/${stack2.id}`),
              },
            }),
            defaultEnvResponse({
              id: createId(),
              handle: "stack-2-env-2",
              _links: {
                stack: defaultHalHref(`${testEnv.apiUrl}/stacks/${stack2.id}`),
              },
            }),
          ],
        }),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [deployUrl(`${stack2.id}`)],
      });

      await waitForBootup(store);

      render(<App />);

      const selectors = await screen.findAllByRole("combobox");

      const envSelector = selectors[1];
      await act(() => userEvent.selectOptions(envSelector, "stack-2-env-1"));

      await screen.findByRole("button", {
        name: /Next/,
      });

      await screen.findByText(/stack-2-stack/);
      await screen.findByText(/stack-2-env-1/);

      expect(true).toBe(true);
    });
  });
});
