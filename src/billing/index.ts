import { billingApi, cacheTimer, thunks } from "@app/api";
import { call, parallel } from "@app/fx";
import { createSelector } from "@app/fx";
import { defaultHalHref } from "@app/hal";
import { db, schema } from "@app/schema";
import { BillingDetail, LinkResponse } from "@app/types";
import { loadStripe } from "@stripe/stripe-js/pure";

export const defaultBillingDetailResponse = (
  bt: Partial<BillingDetailResponse> = {},
): BillingDetailResponse => {
  return {
    id: "",
    _links: { payment_method: defaultHalHref() },
    ...bt,
  };
};

interface BillingDetailResponse {
  id: string;
  _links: {
    payment_method: LinkResponse;
  };
}

const deserializeBillingDetail = (bt: BillingDetailResponse): BillingDetail => {
  return {
    id: bt.id,
    paymentMethodUrl: bt._links.payment_method
      ? bt._links.payment_method.href
      : "",
  };
};

export const selectBillingDetail = db.billingDetail.select;
export const selectHasPaymentMethod = createSelector(
  selectBillingDetail,
  (bt) => bt.paymentMethodUrl !== "",
);

export const fetchBillingDetail = billingApi.get<
  { id: string },
  BillingDetailResponse
>("/billing_details/:id", function* (ctx, next) {
  yield* next();
  if (!ctx.json.ok) {
    return;
  }

  yield* schema.update(
    db.billingDetail.set(deserializeBillingDetail(ctx.json.value)),
  );
});

export async function getStripe(stripePublishableKey: string) {
  loadStripe.setLoadParameters({ advancedFraudSignals: false });
  return loadStripe(stripePublishableKey);
}

interface StripeSourceProps {
  id: string;
  stripeTokenId: string;
}

export const createStripeSource = billingApi.post<StripeSourceProps>(
  "/billing_details/:id/stripe_sources",
  function* (ctx, next) {
    const body = {
      stripe_token_id: ctx.payload.stripeTokenId,
    };
    ctx.request = ctx.req({
      body: JSON.stringify(body),
    });
    yield* next();
    if (!ctx.json.ok) {
      return;
    }

    ctx.loader = { message: "Successfully added stripe payment method!" };
  },
);

export const fetchStripeSources = billingApi.get<{ id: string }>(
  "/billing_details/:id/stripe_sources",
  { supervisor: cacheTimer() },
  billingApi.cache(),
);
export const fetchTrials = billingApi.get<{ id: string }>(
  "/billing_details/:id/trials",
  { supervisor: cacheTimer() },
  billingApi.cache(),
);
// const fetchExternalPaymentSources = billingApi.get<{ id: string }>('/billing_details/:id/external_payment_sources');

export const createBillingDetail = billingApi.post<{
  orgId: string;
  orgName: string;
}>("/billing_details", function* (ctx, next) {
  ctx.request = ctx.req({
    body: JSON.stringify({
      id: ctx.payload.orgId,
      organization_details_json: { name: ctx.payload.orgName },
    }),
  });

  yield* next();
});

const createBillingCycle = billingApi.post<{ orgId: string }>(
  "/billing_details/:orgId/billing_cycles",
  function* (ctx, next) {
    const anniversary = new Date();
    anniversary.setUTCHours(0);
    anniversary.setUTCMinutes(0);
    anniversary.setUTCSeconds(0);
    anniversary.setUTCMilliseconds(0);
    const period = "month";

    ctx.request = ctx.req({
      body: JSON.stringify({
        anniversary: anniversary.toISOString(),
        period,
      }),
    });

    yield* next();
  },
);

const createBillingContact = billingApi.post<{
  orgId: string;
  contactName: string;
  contactEmail: string;
}>("/billing_details/:orgId/billing_contacts", function* (ctx, next) {
  const { contactName, contactEmail } = ctx.payload;
  ctx.request = ctx.req({
    body: JSON.stringify({
      name: contactName,
      email: contactEmail,
    }),
  });

  yield* next();
});

interface CreateBillingRecordProps {
  orgId: string;
  orgName: string;
  contactName: string;
  contactEmail: string;
}

export const createSignupBillingRecords =
  thunks.create<CreateBillingRecordProps>(
    "create-signup-billing-records",
    function* (ctx, next) {
      const dtail = yield* call(() =>
        createBillingDetail.run(createBillingDetail(ctx.payload)),
      );
      if (!dtail.json.ok) {
        ctx.json = {
          ok: false,
          data: dtail.json.error,
        };
        return;
      }

      const group = yield* parallel([
        () => createBillingCycle.run(createBillingCycle(ctx.payload)),
        () => createBillingContact.run(createBillingContact(ctx.payload)),
      ]);
      const results = yield* group;
      // check each resp for an error
      const msg: string[] = [];
      for (let i = 0; i < results.length; i += 1) {
        const result = results[i];
        if (!result.ok) {
          msg.push(result.error.message);
          continue;
        }

        if (!result.value.json.ok) {
          msg.push(result.value.json.error.message);
        }
      }

      if (msg.length > 0) {
        ctx.json = {
          ok: false,
          data: { message: msg.join("\n") },
        };
        return;
      }

      ctx.json = {
        ok: true,
        data: {},
      };
      yield* next();
    },
  );
