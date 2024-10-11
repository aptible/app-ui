import { billingApi, cacheTimer, thunks } from "@app/api";
import { selectEnv } from "@app/config";
import { mdw, select } from "@app/fx";
import { createSelector } from "@app/fx";
import { defaultHalHref } from "@app/hal";
import { schema } from "@app/schema";
import type { BillingDetail, HalEmbedded, LinkResponse } from "@app/types";
import { loadStripe } from "@stripe/stripe-js/pure";

export interface StripeSourceResponse {
  id: string;
  deactivated_at: string | null;
  description: string;
  stripe_token_id: string;
  stripe_type: string;
  stripe_metadata: Record<string, any> | null;
}

export interface TrialResponse {
  id: string;
  range_begin: string;
  range_end: string;
}

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

export const selectBillingDetail = schema.billingDetail.select;
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
    schema.billingDetail.set(deserializeBillingDetail(ctx.json.value)),
  );
});

export async function getStripe(stripePublishableKey: string) {
  loadStripe.setLoadParameters({ advancedFraudSignals: false });
  return loadStripe(stripePublishableKey);
}

interface StripeSourceProps {
  id: string;
  stripeTokenId: string;
  address1: string;
  address2: string;
  city: string;
  zipcode: string;
  state: string;
  country: string;
}

export const addCreditCard = thunks.create<StripeSourceProps>(
  "add-credit-card",
  [
    mdw.loader(schema),
    function* (ctx, next) {
      const config = yield* select(selectEnv);
      const ssCtx = yield* createStripeSource.run(ctx.payload);
      if (!ssCtx.json.ok) {
        throw ssCtx.json.error;
      }
      const updatePaymentCtx = yield* updateBillingDetail.run({
        id: ctx.payload.id,
        paymentMethodUrl: `${config.billingUrl}/stripe_sources/${ssCtx.json.value.id}`,
        address1: ctx.payload.address1,
        address2: ctx.payload.address2,
        city: ctx.payload.city,
        state: ctx.payload.state,
        country: ctx.payload.country,
        zipcode: ctx.payload.zipcode,
      });
      if (!updatePaymentCtx.json.ok) {
        throw updatePaymentCtx.json.error;
      }
      yield* next();
    },
  ],
);

export const createStripeSource = billingApi.post<
  StripeSourceProps,
  StripeSourceResponse
>("/billing_details/:id/stripe_sources", function* (ctx, next) {
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
});

export const fetchStripeSources = billingApi.get<
  { id: string },
  HalEmbedded<{ stripe_sources: StripeSourceResponse[] }>
>(
  "/billing_details/:id/stripe_sources",
  { supervisor: cacheTimer() },
  billingApi.cache(),
);
export const fetchTrials = billingApi.get<
  { id: string },
  HalEmbedded<{ trials: TrialResponse[] }>
>(
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

interface UpdateBillingDetailProps {
  id: string;
  paymentMethodUrl: string;
  address1: string;
  address2: string;
  city: string;
  zipcode: string;
  state: string;
  country: string;
}

export const updateBillingDetail = billingApi.patch<UpdateBillingDetailProps>(
  "/billing_details/:id",
  function* (ctx, next) {
    ctx.request = ctx.req({
      body: JSON.stringify({
        payment_method: ctx.payload.paymentMethodUrl,
        organization_details_json: {
          billing_address: {
            street_one: ctx.payload.address1,
            street_two: ctx.payload.address2,
            city: ctx.payload.city,
            state: ctx.payload.state,
            post_code: ctx.payload.zipcode,
            country: ctx.payload.country,
          },
        },
      }),
    });
    yield* next();
  },
);
