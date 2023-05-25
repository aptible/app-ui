import { SignupPage } from "./signup";
import { VerifyEmailPage } from "./verify-email";
import { server, testEmail, testEnv } from "@app/mocks";
import { verifyEmailRequestUrl } from "@app/routes";
import { setupIntegrationTest } from "@app/test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { rest } from "msw";

describe("Signup page", () => {
  it("the sign up page should render", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <SignupPage />
      </TestProvider>,
    );
    const el = await screen.findByRole("button", { name: "Create Account" });
    expect(el.textContent).toEqual("Create Account");
  });

  it("after successful signup, redirects to verify page", async () => {
    const { TestProvider } = setupIntegrationTest({
      additionalRoutes: [
        {
          path: verifyEmailRequestUrl(),
          element: <VerifyEmailPage />,
        },
      ],
    });
    render(
      <TestProvider>
        <SignupPage />
      </TestProvider>,
    );
    const el = await screen.findByRole("button", { name: "Create Account" });
    expect(el.textContent).toEqual("Create Account");

    const name = await screen.findByRole("textbox", { name: "name" });
    await act(async () => {
      await userEvent.type(name, "mock name");
    });
    const company = await screen.findByRole("textbox", { name: "company" });
    await act(async () => {
      await userEvent.type(company, "mock company");
    });
    const email = await screen.findByRole("textbox", { name: "email" });
    await act(async () => {
      await userEvent.type(email, testEmail);
    });
    const pass = await screen.findByLabelText("password");
    await act(async () => {
      await userEvent.type(pass, "Aptible!1234");
    });
    const btn = await screen.findByRole("button");
    fireEvent.click(btn);

    expect(await screen.findByText("Check your Email")).toBeInTheDocument();
  });

  it("during signup expect validation to guard against submission", async () => {
    const { TestProvider } = setupIntegrationTest({
      additionalRoutes: [
        {
          path: verifyEmailRequestUrl(),
          element: <VerifyEmailPage />,
        },
      ],
    });
    render(
      <TestProvider>
        <SignupPage />
      </TestProvider>,
    );

    const setValidPassword = async () =>
      await act(async () => {
        await userEvent.type(pass, "Aptible!1234");
      });

    const btn = await screen.findByRole("button", { name: "Create Account" });

    // disabled with no inputs set, does not redirect
    expect(btn.textContent).toEqual("Create Account");
    fireEvent.click(btn);
    expect(await screen.findByText("Get started for free")).toBeInTheDocument();

    const name = await screen.findByRole("textbox", { name: "name" });
    await act(async () => {
      await userEvent.type(name, "mock name");
    });

    // will not redirect yet
    fireEvent.click(btn);
    expect(await screen.findByText("Get started for free")).toBeInTheDocument();

    const company = await screen.findByRole("textbox", { name: "company" });
    await act(async () => {
      await userEvent.type(company, "mock company");
    });

    // will not redirect yet
    fireEvent.click(btn);
    expect(await screen.findByText("Get started for free")).toBeInTheDocument();

    const email = await screen.findByRole("textbox", { name: "email" });
    const pass = await screen.findByLabelText("password");

    await setValidPassword();
    await act(async () => {
      await userEvent.type(email, "invalid");
    });
    fireEvent.click(btn);
    expect(await screen.findByText("Get started for free")).toBeInTheDocument();

    // set valid email
    await act(async () => {
      await userEvent.clear(pass);
      await userEvent.type(email, testEmail);
    });

    await act(async () => {
      await userEvent.type(pass, "a");
    });
    fireEvent.click(btn);
    expect(await screen.findByText("Get started for free")).toBeInTheDocument();

    await setValidPassword();
    fireEvent.click(btn);
    expect(await screen.findByText("Check your Email")).toBeInTheDocument();
  });

  // TODO - this currently does not work, we need to make this work, it continues on to verify even if user fails to create
  // it SHOULD kick you back out to login but this is WEIRD
  test.skip("errors properly when signup fails (create user)", async () => {
    const { TestProvider } = setupIntegrationTest({});
    render(
      <TestProvider>
        <SignupPage />
      </TestProvider>,
    );

    server.use(
      rest.post(`${testEnv.authUrl}/user`, (_, res, ctx) => {
        return res(
          ctx.status(401),
          ctx.set("Content-Type", "application/json"),
          ctx.json({
            code: 401,
            exception_context: {},
            error: "invalid_credentials",
            message: "mock error message",
          }),
        );
      }),
    );

    const el = await screen.findByRole("button", { name: "Create Account" });
    expect(el.textContent).toEqual("Create Account");

    const name = await screen.findByRole("textbox", { name: "name" });
    await act(async () => {
      await userEvent.type(name, "mock name");
    });
    const company = await screen.findByRole("textbox", { name: "company" });
    await act(async () => {
      await userEvent.type(company, "mock company");
    });
    const email = await screen.findByRole("textbox", { name: "email" });
    await act(async () => {
      await userEvent.type(email, testEmail);
    });
    const pass = await screen.findByLabelText("password");
    await act(async () => {
      await userEvent.type(pass, "Aptible!1234");
    });
    const btn = await screen.findByRole("button");
    fireEvent.click(btn);

    expect(await screen.findByText("mock error message")).toBeInTheDocument();
  });

  // TODO - this works but yikes, we really need to find a way to let the user know they're in a dead state
  it("errors properly when signup fails (create organization)", async () => {
    const { TestProvider } = setupIntegrationTest({});
    render(
      <TestProvider>
        <SignupPage />
      </TestProvider>,
    );

    server.use(
      rest.post(`${testEnv.authUrl}/organizations`, (_, res, ctx) => {
        return res(
          ctx.status(401),
          ctx.set("Content-Type", "application/json"),
          ctx.json({
            code: 401,
            exception_context: {},
            error: "invalid_credentials",
            message: "mock error message",
          }),
        );
      }),
    );

    const el = await screen.findByRole("button", { name: "Create Account" });
    expect(el.textContent).toEqual("Create Account");

    const name = await screen.findByRole("textbox", { name: "name" });
    await act(async () => {
      await userEvent.type(name, "mock name");
    });
    const company = await screen.findByRole("textbox", { name: "company" });
    await act(async () => {
      await userEvent.type(company, "mock company");
    });
    const email = await screen.findByRole("textbox", { name: "email" });
    await act(async () => {
      await userEvent.type(email, testEmail);
    });
    const pass = await screen.findByLabelText("password");
    await act(async () => {
      await userEvent.type(pass, "Aptible!1234");
    });
    const btn = await screen.findByRole("button");
    fireEvent.click(btn);

    expect(await screen.findByText("mock error message")).toBeInTheDocument();
  });
});
