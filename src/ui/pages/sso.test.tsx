import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  SSO_DIRECT_PATH,
  SSO_ORG_FAILURE_PATH,
  SSO_PATH,
  ssoFailureUrl,
  ssoUrl,
} from "@app/routes";
import { setupIntegrationTest, waitForBootup } from "@app/test";

import { SsoFailurePage, SsoLoginPage } from "./sso";

describe("SsoLoginPage", () => {
  it("should redirect to SsoDirectPage", async () => {
    const { TestProvider, store } = setupIntegrationTest({
      initEntries: [ssoUrl()],
      path: SSO_PATH,
      additionalRoutes: [
        {
          path: SSO_DIRECT_PATH,
          element: <div>sso direct page</div>,
        },
      ],
    });

    await waitForBootup(store);

    render(
      <TestProvider>
        <SsoLoginPage />
      </TestProvider>,
    );

    const btn = await screen.findByRole("button");
    expect(btn).toBeDisabled();

    const org = await screen.findByRole("textbox");
    await act(async () => await userEvent.type(org, "1234"));

    fireEvent.click(btn);

    await screen.findByText("sso direct page");
    expect(screen.getByText("sso direct page")).toBeInTheDocument();
  });
});

describe("SsoFailurePage", () => {
  it("should display the error from the URL", async () => {
    const { TestProvider, store } = setupIntegrationTest({
      initEntries: [ssoFailureUrl("something happened")],
      path: SSO_ORG_FAILURE_PATH,
    });

    await waitForBootup(store);

    render(
      <TestProvider>
        <SsoFailurePage />
      </TestProvider>,
    );

    await screen.findByText(/something happened/);
    expect(screen.queryByText(/something happened/)).toBeInTheDocument();
  });
});
