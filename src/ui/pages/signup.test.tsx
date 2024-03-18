import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";

import { server, testEmail, testEnv } from "@app/mocks";
import { signupUrl } from "@app/routes";
import { setupAppIntegrationTest } from "@app/test";

describe("Signup page", () => {
  it("the sign up page should render", async () => {
    server.use(
      rest.get(`${testEnv.authUrl}/current_token`, (_, res, ctx) => {
        return res(ctx.status(401));
      }),
    );
    const { App } = setupAppIntegrationTest({
      initEntries: ["/"],
    });
    render(<App />);

    await screen.findAllByText(/Log In/);
    const link = await screen.findByRole("link", { name: /Sign up/ });
    fireEvent.click(link);

    const el = await screen.findByRole("button", { name: "Create Account" });
    expect(el.textContent).toEqual("Create Account");
  });

  it("should sanitize inputs", async () => {
    server.use(
      rest.get(`${testEnv.authUrl}/current_token`, (_, res, ctx) => {
        return res(ctx.status(401));
      }),
    );
    const { App } = setupAppIntegrationTest({
      initEntries: [signupUrl()],
    });
    render(<App />);

    const name = await screen.findByRole("textbox", { name: "name" });
    await act(() => userEvent.type(name, "<test>!#@"));
    const company = await screen.findByRole("textbox", { name: "company" });
    await act(() => userEvent.type(company, "<>> #!abc"));
    const email = await screen.findByRole("textbox", { name: "email" });
    await act(() => userEvent.type(email, testEmail));
    const pass = await screen.findByLabelText("password");
    await act(() => userEvent.type(pass, "Aptible!1234"));

    expect(name).toHaveValue("&lt;test&gt;!#@");
    expect(company).toHaveValue("&lt;&gt;&gt; #!abc");
  });

  it("should *not* allow symbols in Name", async () => {
    server.use(
      rest.get(`${testEnv.authUrl}/current_token`, (_, res, ctx) => {
        return res(ctx.status(401));
      }),
    );
    const { App } = setupAppIntegrationTest({
      initEntries: [signupUrl()],
    });
    render(<App />);

    const name = await screen.findByRole("textbox", { name: "name" });
    await act(() => userEvent.type(name, "@"));
    const company = await screen.findByRole("textbox", { name: "company" });
    await act(() => userEvent.type(company, "test"));
    const email = await screen.findByRole("textbox", { name: "email" });
    await act(() => userEvent.type(email, testEmail));
    const pass = await screen.findByLabelText("password");
    await act(() => userEvent.type(pass, "Aptible!1234"));

    const el = await screen.findByRole("button", { name: "Create Account" });
    fireEvent.click(el);

    expect(
      await screen.findByText("Cannot have symbols in name"),
    ).toBeInTheDocument();
  });

  it("should *not* allow symbols in Company", async () => {
    server.use(
      rest.get(`${testEnv.authUrl}/current_token`, (_, res, ctx) => {
        return res(ctx.status(401));
      }),
    );
    const { App } = setupAppIntegrationTest({
      initEntries: [signupUrl()],
    });
    render(<App />);

    const name = await screen.findByRole("textbox", { name: "name" });
    await act(() => userEvent.type(name, "test"));
    const company = await screen.findByRole("textbox", { name: "company" });
    await act(() => userEvent.type(company, "@"));
    const email = await screen.findByRole("textbox", { name: "email" });
    await act(() => userEvent.type(email, testEmail));
    const pass = await screen.findByLabelText("password");
    await act(() => userEvent.type(pass, "Aptible!1234"));

    const el = await screen.findByRole("button", { name: "Create Account" });
    fireEvent.click(el);

    expect(
      await screen.findByText("Cannot have symbols in name"),
    ).toBeInTheDocument();
  });

  it("after successful signup, redirects to verify page", async () => {
    server.use(
      rest.get(`${testEnv.authUrl}/current_token`, (_, res, ctx) => {
        return res(ctx.status(401));
      }),
    );
    const { App } = setupAppIntegrationTest({
      initEntries: [signupUrl()],
    });

    render(<App />);

    const name = await screen.findByRole("textbox", { name: "name" });
    await act(() => userEvent.type(name, "mock name"));
    const company = await screen.findByRole("textbox", { name: "company" });
    await act(() => userEvent.type(company, "mock company"));
    const email = await screen.findByRole("textbox", { name: "email" });
    await act(() => userEvent.type(email, testEmail));
    const pass = await screen.findByLabelText("password");
    await act(() => userEvent.type(pass, "Aptible!1234"));

    const btn = await screen.findByRole("button", { name: "Create Account" });
    fireEvent.click(btn);

    expect(await screen.findByText("Check your Email")).toBeInTheDocument();
  });

  it("during signup expect validation to guard against submission", async () => {
    server.use(
      rest.get(`${testEnv.authUrl}/current_token`, (_, res, ctx) => {
        return res(ctx.status(401), ctx.json({}));
      }),
    );
    const { App } = setupAppIntegrationTest({
      initEntries: [signupUrl()],
    });

    render(<App />);

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
    await act(() => userEvent.type(name, "mock name"));

    // will not redirect yet
    fireEvent.click(btn);
    expect(await screen.findByText("Get started for free")).toBeInTheDocument();

    const company = await screen.findByRole("textbox", { name: "company" });
    await act(() => userEvent.type(company, "mock company"));

    // will not redirect yet
    fireEvent.click(btn);
    expect(await screen.findByText("Get started for free")).toBeInTheDocument();

    const email = await screen.findByRole("textbox", { name: "email" });
    const pass = await screen.findByLabelText("password");

    await setValidPassword();
    await act(() => userEvent.type(email, "invalid"));
    fireEvent.click(btn);
    expect(await screen.findByText("Get started for free")).toBeInTheDocument();

    // set valid email
    await act(async () => {
      await userEvent.clear(pass);
      await userEvent.type(email, testEmail);
    });

    await act(async () => userEvent.type(pass, "a"));
    fireEvent.click(btn);
    expect(await screen.findByText("Get started for free")).toBeInTheDocument();

    await setValidPassword();
    fireEvent.click(btn);
    expect(await screen.findByText("Check your Email")).toBeInTheDocument();
  });

  it("errors properly when claim fails (check claim)", async () => {
    server.use(
      rest.get(`${testEnv.authUrl}/current_token`, (_, res, ctx) => {
        return res(ctx.status(400));
      }),
      rest.post(`${testEnv.authUrl}/claims/user`, (_, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({
            code: 400,
            exception_context: {},
            error: "use_invitation",
            message: "mock error message",
          }),
        );
      }),
    );

    const { App } = setupAppIntegrationTest({
      initEntries: [signupUrl()],
    });

    render(<App />);

    const name = await screen.findByRole("textbox", { name: "name" });
    await act(() => userEvent.type(name, "mock name"));
    const company = await screen.findByRole("textbox", { name: "company" });
    await act(() => userEvent.type(company, "mock company"));
    const email = await screen.findByRole("textbox", { name: "email" });
    await act(async () => userEvent.type(email, testEmail));
    const pass = await screen.findByLabelText("password");
    await act(() => userEvent.type(pass, "Aptible!1234"));

    const btn = await screen.findByRole("button", { name: /Create Account/ });
    fireEvent.click(btn);

    expect(await screen.findByText("mock error message")).toBeInTheDocument();
  });

  it("errors properly when signup fails (create user)", async () => {
    server.use(
      rest.get(`${testEnv.authUrl}/current_token`, (_, res, ctx) => {
        return res(ctx.status(401));
      }),
      rest.post(`${testEnv.authUrl}/users`, (_, res, ctx) => {
        return res(
          ctx.status(401),
          ctx.json({
            code: 401,
            exception_context: {},
            error: "invalid_credentials",
            message: "mock error message",
          }),
        );
      }),
    );

    const { App } = setupAppIntegrationTest({
      initEntries: [signupUrl()],
    });

    render(<App />);

    const name = await screen.findByRole("textbox", { name: "name" });
    await act(() => userEvent.type(name, "mock name"));
    const company = await screen.findByRole("textbox", { name: "company" });
    await act(() => userEvent.type(company, "mock company"));
    const email = await screen.findByRole("textbox", { name: "email" });
    await act(async () => userEvent.type(email, testEmail));
    const pass = await screen.findByLabelText("password");
    await act(() => userEvent.type(pass, "Aptible!1234"));

    const btn = await screen.findByRole("button", { name: /Create Account/ });
    fireEvent.click(btn);

    expect(await screen.findByText("mock error message")).toBeInTheDocument();
  });

  it("errors properly when signup fails (create organization)", async () => {
    server.use(
      rest.get(`${testEnv.authUrl}/current_token`, (_, res, ctx) => {
        return res(ctx.status(401));
      }),
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

    const { App } = setupAppIntegrationTest({
      initEntries: [signupUrl()],
    });

    render(<App />);

    const name = await screen.findByRole("textbox", { name: "name" });
    await act(() => userEvent.type(name, "mock name"));
    const company = await screen.findByRole("textbox", { name: "company" });
    await act(() => userEvent.type(company, "mock company"));
    const email = await screen.findByRole("textbox", { name: "email" });
    await act(() => userEvent.type(email, testEmail));
    const pass = await screen.findByLabelText("password");
    await act(() => userEvent.type(pass, "Aptible!1234"));

    const btn = await screen.findByRole("button");
    fireEvent.click(btn);

    expect(await screen.findByText("mock error message")).toBeInTheDocument();
  });
});
