import { LoginPage } from "./login";
import { render, screen } from "@testing-library/react";
import { setupIntegrationTest } from "@app/test";

describe("Login page", () => {
	it("the log in button is visible", async () => {
		const { TestProvider } = setupIntegrationTest();
		render(
			<TestProvider>
				<LoginPage />
			</TestProvider>,
		);
		const el = await screen.findByRole("button");
		expect(el.textContent).toEqual("Sign in");
	});
});
