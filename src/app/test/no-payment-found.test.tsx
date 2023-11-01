import { defaultBillingDetailResponse } from "@app/billing";
import { defaultHalHref } from "@app/hal";
import {
  createId,
  server,
  testActivePlan,
  testBillingDetail,
  testEnterprisePlan,
  testEnv,
  testPlan,
  verifiedUserHandlers,
} from "@app/mocks";
import { plansUrl } from "@app/routes";
import { setupAppIntegrationTest, waitForBootup } from "@app/test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";

describe("Payment page takeover", () => {
  describe("when the user does have a payment method", () => {
    it("should navigate to dashboard", async () => {
      server.use(
        ...verifiedUserHandlers(),
        rest.get(
          `${testEnv.billingUrl}/billing_details/:id`,
          async (_, res, ctx) => {
            return res(ctx.json(testBillingDetail));
          },
        ),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: ["/"],
      });

      await waitForBootup(store);

      render(<App />);

      await screen.findByRole("heading", { name: /Environments/ });
      expect(
        screen.queryByRole("heading", { name: /Environments/ }),
      ).toBeInTheDocument();
    });

    it("should let the user pick a plan and add a cc", async () => {
      const fixedIdForTests = createId();
      server.use(
        ...verifiedUserHandlers(),
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
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [plansUrl()],
      });

      await waitForBootup(store);

      render(<App />);

      await screen.findByText(/Choose a Plan/);
      await screen.findByText(/Growth/);
      const el = await screen.findAllByRole("button", {
        name: /Select Plan/,
      });

      fireEvent.click(el[0]);
      await screen.findByText(/Successfully updated plan to Growth/);

      const link = await screen.findByRole("link", {
        name: /Add a credit card/,
      });
      fireEvent.click(link);

      // credit card screen
      await screen.findByText(
        /You must enter a credit card to continue using Aptible/,
      );

      const zip = await screen.findByRole("textbox", { name: /zipcode/ });
      await act(() => userEvent.type(zip, "45215"));

      const name = await screen.findByRole("textbox", { name: /name-on-card/ });
      await act(() => userEvent.type(name, "bobby lee"));

      const btn = await screen.findByRole("button", { name: /Save Payment/ });
      expect(btn).toBeEnabled();

      fireEvent.click(btn);
      await screen.findByText(/stripe not found/);
    });
  });

  describe("when the user does *not* have a payment method", () => {
    it("should navigate user to picking a plan", async () => {
      const bt = defaultBillingDetailResponse({ id: `${createId()}` });
      server.use(
        ...verifiedUserHandlers(),
        rest.get(
          `${testEnv.billingUrl}/billing_details/:id`,
          async (_, res, ctx) => {
            return res(ctx.json(bt));
          },
        ),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: ["/"],
      });

      await waitForBootup(store);

      render(<App />);

      await screen.findByText(/Choose a Plan/);
      expect(screen.queryByText(/Choose a Plan/)).toBeInTheDocument();
    });

    it("should let user view plans and add a credit card", async () => {
      const fixedIdForTests = createId();
      const bt = defaultBillingDetailResponse({
        id: `${createId()}`,
      });
      server.use(
        ...verifiedUserHandlers(),
        rest.get(
          `${testEnv.billingUrl}/billing_details/:id`,
          async (_, res, ctx) => {
            return res(ctx.json(bt));
          },
        ),
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
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: ["/"],
      });

      await waitForBootup(store);

      render(<App />);

      await screen.findByText(/Choose a Plan/);

      const link = await screen.findByRole("link", {
        name: /Add a credit card/,
      });
      fireEvent.click(link);

      // credit card screen
      await screen.findByText(
        /You must enter a credit card to continue using Aptible/,
      );

      const zip = await screen.findByRole("textbox", { name: /zipcode/ });
      await act(() => userEvent.type(zip, "45215"));

      const name = await screen.findByRole("textbox", { name: /name-on-card/ });
      await act(() => userEvent.type(name, "bobby lee"));

      const btn = await screen.findByRole("button", { name: /Save Payment/ });
      expect(btn).toBeEnabled();

      fireEvent.click(btn);
      await screen.findByText(/stripe not found/);
    });
  });
});
