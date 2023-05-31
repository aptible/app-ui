import { act, fireEvent, render, screen } from "@testing-library/react";

import { rest } from "msw";

import {
  createId,
  server,
  testActivePlan,
  testEnterprisePlan,
  testEnv,
  testPlan,
} from "@app/mocks";
import { setupIntegrationTest } from "@app/test";

import { PlansPage } from "./plans";
import { defaultHalHref } from "@app/hal";

const setupActionablePlanResponses = () => {
    const fixedIdForTests = createId();
    server.use(
        rest.get(`${testEnv.apiUrl}/active_plans`, async (req, res, ctx) => {
            return res(ctx.json({ _embedded: { active_plans: [testActivePlan], _links: {
                ...testActivePlan._links,
                plan: defaultHalHref(`${testEnv.apiUrl}/plans/${fixedIdForTests}`),
            } } }));
        }),
        rest.get(`${testEnv.apiUrl}/plans*`, async (req, res, ctx) => {
            return res(
                ctx.json({ _embedded: { plans: [testPlan, {
                    ...testPlan,
                    id: fixedIdForTests,
                    name: "growth",
                }, testEnterprisePlan] } }),
            );
        }),
        rest.get(`${testEnv.apiUrl}/plans/:id`, async (req, res, ctx) => {
            return res(ctx.json({ ...testPlan }));
        }),
    );
}

describe("Plans page", () => {
  it("the plans page is visible and renders with plans found", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <PlansPage />
      </TestProvider>,
    );
    setupActionablePlanResponses();
    expect(await screen.findByText("Choose a Plan")).toBeDefined();
    expect(await screen.findByText("Starter")).toBeDefined();
    const errText = await screen.queryByText("Unable to load plan data to allow for selection.");
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
    expect(await screen.findByText("Choose a Plan")).toBeDefined();
    expect(await screen.findByText("Growth")).toBeDefined();
    
    const errText = await screen.queryByText("Unable to load plan data to allow for selection.");
    expect(errText).not.toBeInTheDocument();

    const el = await screen.getByText("Select Plan");
    fireEvent.click(el);
  });
  it("the plans page is visible, renders with plans found, but errors when user selects", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <PlansPage />
      </TestProvider>,
    );
    setupActionablePlanResponses();
    expect(await screen.findByText("Choose a Plan")).toBeDefined();
    expect(await screen.findByText("Growth")).toBeDefined();
    
    const errText = await screen.queryByText("Unable to load plan data to allow for selection.");
    expect(errText).not.toBeInTheDocument();

    const el = await screen.getByText("Select Plan");
    fireEvent.click(el);
  });
  it("the plans page is visible and renders with no plans found", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <PlansPage />
      </TestProvider>,
    );
    setupActionablePlanResponses();
    server.use(
      rest.get(`${testEnv.apiUrl}/active_plans*`, async (req, res, ctx) => {
        return res(ctx.json([]));
      }),
    );
    expect(await screen.findByText("Choose a Plan")).toBeDefined();
    expect(
      await screen.findByText(
        "Unable to load plan data to allow for selection.",
      ),
    ).toBeDefined();
  });
  it("the plans page is visible and renders with active plan erroring", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <PlansPage />
      </TestProvider>,
    );
    setupActionablePlanResponses();
    server.use(
      rest.get(`${testEnv.apiUrl}/active_plans*`, async (req, res, ctx) => {
        return res(ctx.status(500));
      }),
    );
    expect(await screen.findByText("Choose a Plan")).toBeDefined();
    expect(
      await screen.findByText(
        "Unable to load plan data to allow for selection.",
      ),
    ).toBeDefined();
  });
  it("errors on active plan load failure", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <PlansPage />
      </TestProvider>,
    );
    setupActionablePlanResponses();
    server.use(
      rest.get(`${testEnv.apiUrl}/active_plans`, async (req, res, ctx) => {
        return res(ctx.status(500));
      }),
    );
    expect(
      await screen.findByText(
        "Unable to load plan data to allow for selection.",
      ),
    ).toBeDefined();
  });
  it("errors on plans list load failure", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <PlansPage />
      </TestProvider>,
    );
    setupActionablePlanResponses();
    server.use(
      rest.get(`${testEnv.apiUrl}/plans*`, async (req, res, ctx) => {
        return res(ctx.status(500));
      }),
    );
    expect(
      await screen.findByText(
        "Unable to load plan data to allow for selection.",
      ),
    ).toBeDefined();
  });
});
