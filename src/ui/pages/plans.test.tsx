import { fireEvent, render, screen } from "@testing-library/react";

import {
  ResponseComposition,
  RestContext,
  RestHandler,
  RestRequest,
  rest,
} from "msw";

import {
  createId,
  server,
  testActivePlan,
  testEnterprisePlan,
  testEnv,
  testPlan,
} from "@app/mocks";
import { setupIntegrationTest } from "@app/test";

import { defaultHalHref } from "@app/hal";
import { PlansPage } from "./plans";

const commonFail = async (
  _: RestRequest,
  res: ResponseComposition,
  ctx: RestContext,
) => {
  return res(
    ctx.status(500),
    ctx.set("Content-Type", "application/json"),
    ctx.json({
      code: 500,
      exception_context: {},
      error: "mock error",
      message: "mock error message",
    }),
  );
};

const setupActionablePlanResponses = (extra: RestHandler[] = []) => {
  const fixedIdForTests = createId();
  server.use(
    rest.get(`${testEnv.apiUrl}/active_plans`, async (_, res, ctx) => {
      return res(
        ctx.json({
          _embedded: {
            active_plans: [testActivePlan],
            _links: {
              ...testActivePlan._links,
              plan: defaultHalHref(
                `${testEnv.apiUrl}/plans/${fixedIdForTests}`,
              ),
            },
          },
        }),
      );
    }),
    rest.get(`${testEnv.apiUrl}/plans`, async (_, res, ctx) => {
      return res(
        ctx.json({
          _embedded: {
            plans: [
              testPlan,
              {
                ...testPlan,
                id: fixedIdForTests,
                name: "growth",
              },
              testEnterprisePlan,
            ],
          },
        }),
      );
    }),
    ...extra,
  );
};

describe("Plans page", () => {
  it("the plans page is visible and renders with plans found", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <PlansPage />
      </TestProvider>,
    );
    setupActionablePlanResponses();
    await screen.findByText("Choose a Plan");
    await screen.findByText("Starter");
    const errText = screen.queryByText(
      "Unable to load plan data to allow for selection.",
    );
    expect(errText).not.toBeInTheDocument();
  });

  it("the plans page is visible and renders with plans found and user selects plan", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <PlansPage />
      </TestProvider>,
    );
    setupActionablePlanResponses();
    await screen.findByText("Choose a Plan");
    await screen.findByText("Growth");

    const errText = screen.queryByText(
      "Unable to load plan data to allow for selection.",
    );
    expect(errText).not.toBeInTheDocument();

    const el = await screen.findByRole("button", {
      name: /Select Plan/,
    });

    fireEvent.click(el);
    await screen.findByText(/Successfully updated plan to Growth/);
  });

  it("the plans page is visible, renders with plans found, but errors when user selects", async () => {
    setupActionablePlanResponses([
      rest.put(`${testEnv.apiUrl}/active_plans*`, commonFail),
    ]);
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <PlansPage />
      </TestProvider>,
    );

    await screen.findByText("Choose a Plan");
    await screen.findByText("Growth");

    const el = await screen.findByRole("button", {
      name: /Select Plan/,
    });

    fireEvent.click(el);
    await screen.findByText(/mock error message/);
  });

  it("errors on active plan load failure", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <PlansPage />
      </TestProvider>,
    );
    server.use(rest.get(`${testEnv.apiUrl}/active_plans*`, commonFail));
    await screen.findByText(/mock error message/);
  });

  it("errors on plans list load failure", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <PlansPage />
      </TestProvider>,
    );
    server.use(rest.get(`${testEnv.apiUrl}/plans*`, commonFail));
    await screen.findByText(/mock error message/);
  });
});
