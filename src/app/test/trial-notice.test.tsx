import { fetchStripeSources, fetchTrials } from "@app/billing";
import { server, testEnv, verifiedUserHandlers } from "@app/mocks";
import { environmentsUrl } from "@app/routes";
import { schema } from "@app/schema";
import { setupAppIntegrationTest, waitForBootup, waitForData } from "@app/test";
import { render, screen } from "@testing-library/react";
import { rest } from "msw";

describe("Trial notice", () => {
  describe("with no trials", () => {
    it("should *not* display a trial expiration notice in sidebar", async () => {
      const begin = new Date();
      begin.setDate(begin.getDate() - 10);
      const after = new Date();
      after.setDate(after.getDate() - 5);

      server.use(
        ...verifiedUserHandlers(),
        rest.get(
          `${testEnv.billingUrl}/billing_details/:id/trials`,
          async (_, res, ctx) => {
            const jso = {
              _embedded: {
                trials: [],
              },
            };
            return res(ctx.json(jso));
          },
        ),
        rest.get(
          `${testEnv.billingUrl}/billing_details/:id/stripe_sources`,
          async (_, res, ctx) => {
            return res(ctx.json({ _embedded: { stripe_sources: [] } }));
          },
        ),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [environmentsUrl()],
      });

      await waitForBootup(store);

      render(<App />);

      await waitForData(store, (state) => {
        const trialLoader = schema.loaders.selectById(state, {
          id: `${fetchTrials}`,
        });
        const stripeLoader = schema.loaders.selectById(state, {
          id: `${fetchStripeSources}`,
        });
        return trialLoader.lastSuccess > 0 && stripeLoader.lastSuccess > 0;
      });

      expect(screen.queryByText(/Trial expires in/)).not.toBeInTheDocument();
    });
  });

  describe("with no active trial", () => {
    it("should *not* display a trial expiration notice in sidebar", async () => {
      const begin = new Date();
      begin.setDate(begin.getDate() - 10);
      const after = new Date();
      after.setDate(after.getDate() - 5);

      server.use(
        ...verifiedUserHandlers(),
        rest.get(
          `${testEnv.billingUrl}/billing_details/:id/trials`,
          async (_, res, ctx) => {
            const jso = {
              _embedded: {
                trials: [
                  {
                    id: "1",
                    range_begin: begin.toISOString(),
                    range_end: after.toISOString(),
                  },
                ],
              },
            };
            return res(ctx.json(jso));
          },
        ),
        rest.get(
          `${testEnv.billingUrl}/billing_details/:id/stripe_sources`,
          async (_, res, ctx) => {
            return res(ctx.json({ _embedded: { stripe_sources: [] } }));
          },
        ),
      );

      const { App, store } = setupAppIntegrationTest({
        initEntries: [environmentsUrl()],
      });

      await waitForBootup(store);

      render(<App />);

      await waitForData(store, (state) => {
        const trialLoader = schema.loaders.selectById(state, {
          id: `${fetchTrials}`,
        });
        const stripeLoader = schema.loaders.selectById(state, {
          id: `${fetchStripeSources}`,
        });
        return trialLoader.lastSuccess > 0 && stripeLoader.lastSuccess > 0;
      });

      expect(screen.queryByText(/Trial expires in/)).not.toBeInTheDocument();
    });
  });

  describe("with an active trial", () => {
    describe("with an active stripe source", () => {
      it("should *not* display a trial expiration notice in sidebar", async () => {
        const begin = new Date();
        begin.setDate(begin.getDate() - 2);
        const after = new Date();
        after.setDate(after.getDate() + 2);

        server.use(
          ...verifiedUserHandlers(),
          rest.get(
            `${testEnv.billingUrl}/billing_details/:id/trials`,
            async (_, res, ctx) => {
              const jso = {
                _embedded: {
                  trials: [
                    {
                      id: "1",
                      range_begin: begin.toISOString(),
                      range_end: after.toISOString(),
                    },
                  ],
                },
              };
              return res(ctx.json(jso));
            },
          ),
          rest.get(
            `${testEnv.billingUrl}/billing_details/:id/stripe_sources`,
            async (_, res, ctx) => {
              return res(
                ctx.json({
                  _embedded: {
                    stripe_sources: [{ id: "2", deactivated_at: null }],
                  },
                }),
              );
            },
          ),
        );

        const { App, store } = setupAppIntegrationTest({
          initEntries: [environmentsUrl()],
        });

        await waitForBootup(store);

        render(<App />);

        await waitForData(store, (state) => {
          const trialLoader = schema.loaders.selectById(state, {
            id: `${fetchTrials}`,
          });
          const stripeLoader = schema.loaders.selectById(state, {
            id: `${fetchStripeSources}`,
          });
          return trialLoader.lastSuccess > 0 && stripeLoader.lastSuccess > 0;
        });

        expect(screen.queryByText(/Trial expires in/)).not.toBeInTheDocument();
      });
    });

    describe("with *not* an active stripe source", () => {
      it("should display a trial expiration notice in sidebar", async () => {
        const begin = new Date();
        begin.setDate(begin.getDate() - 2);
        const after = new Date();
        after.setDate(after.getDate() + 2);

        server.use(
          ...verifiedUserHandlers(),
          rest.get(
            `${testEnv.billingUrl}/billing_details/:id/trials`,
            async (_, res, ctx) => {
              const jso = {
                _embedded: {
                  trials: [
                    {
                      id: "1",
                      range_begin: begin.toISOString(),
                      range_end: after.toISOString(),
                    },
                  ],
                },
              };
              return res(ctx.json(jso));
            },
          ),
          rest.get(
            `${testEnv.billingUrl}/billing_details/:id/stripe_sources`,
            async (_, res, ctx) => {
              return res(
                ctx.json({
                  _embedded: {
                    stripe_sources: [
                      { id: "2", deactivated_at: begin.toISOString() },
                    ],
                  },
                }),
              );
            },
          ),
        );

        const { App, store } = setupAppIntegrationTest({
          initEntries: [environmentsUrl()],
        });

        await waitForBootup(store);

        render(<App />);

        await screen.findByText(/Trial expires in/);
        expect(screen.queryByText(/Trial expires in/)).toBeInTheDocument();
      });
    });

    describe("with *no* stripe sources", () => {
      it("should display a trial expiration notice in sidebar", async () => {
        const begin = new Date();
        begin.setDate(begin.getDate() - 2);
        const after = new Date();
        after.setDate(after.getDate() + 2);

        server.use(
          ...verifiedUserHandlers(),
          rest.get(
            `${testEnv.billingUrl}/billing_details/:id/trials`,
            async (_, res, ctx) => {
              const jso = {
                _embedded: {
                  trials: [
                    {
                      id: "1",
                      range_begin: begin.toISOString(),
                      range_end: after.toISOString(),
                    },
                  ],
                },
              };
              return res(ctx.json(jso));
            },
          ),
          rest.get(
            `${testEnv.billingUrl}/billing_details/:id/stripe_sources`,
            async (_, res, ctx) => {
              return res(ctx.json({ _embedded: { stripe_sources: [] } }));
            },
          ),
        );

        const { App, store } = setupAppIntegrationTest({
          initEntries: [environmentsUrl()],
        });

        await waitForBootup(store);

        render(<App />);

        await screen.findByText(/Trial expires in/);
        expect(screen.queryByText(/Trial expires in/)).toBeInTheDocument();
      });
    });
  });
});
