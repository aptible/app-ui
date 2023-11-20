import { TEAM_CONTACTS_PATH, teamContactsUrl } from "@app/routes";
import { setupIntegrationTest, waitForBootup } from "@app/test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TeamContactsPage } from "./settings-team-contacts";

describe("TeamContactsPage", () => {
  it("should update org information", async () => {
    const { TestProvider, store } = setupIntegrationTest({
      path: TEAM_CONTACTS_PATH,
      initEntries: [teamContactsUrl()],
    });
    await waitForBootup(store);
    render(
      <TestProvider>
        <TeamContactsPage />
      </TestProvider>,
    );

    await screen.findByText(/Organization Settings/);

    const securityEmail = await screen.findByRole("textbox", {
      name: "security-alert-email",
    });
    await act(() => userEvent.type(securityEmail, "team.security@aptible.com"));
    const opsEmail = await screen.findByRole("textbox", {
      name: "ops-alert-email",
    });
    await act(() => userEvent.type(opsEmail, "team.ops@aptible.com"));

    const name = await screen.findByRole("textbox", { name: "org-name" });
    await act(() => userEvent.type(name, "new-org-name"));
    const phone = await screen.findByRole("textbox", { name: "phone" });
    await act(() => userEvent.type(phone, "1111111111"));
    const emergency = await screen.findByRole("textbox", {
      name: "emergency-phone",
    });
    await act(() => userEvent.type(emergency, "2222222222"));

    const address = await screen.findByRole("textbox", { name: "address" });
    await act(() => userEvent.type(address, "123 maple st"));
    const city = await screen.findByRole("textbox", { name: "city" });
    await act(() => userEvent.type(city, "san fran"));
    const state = await screen.findByRole("textbox", { name: "state" });
    await act(() => userEvent.type(state, "CA"));
    const zip = await screen.findByRole("textbox", { name: "zip" });
    await act(() => userEvent.type(zip, "45214"));

    const btn = await screen.findByRole("button", { name: /Save/ });
    fireEvent.click(btn);

    await screen.findByText(/Successfully updated contact settings!/);
  });
});
