import { billingApi, thunks } from "@app/api";
import {
  all,
  call,
  put,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
} from "@app/fx";
import { defaultHalHref } from "@app/hal";
import { createAssign, createReducerMap } from "@app/slice-helpers";
import { AppState, BillingDetail, LinkResponse } from "@app/types";
import { createSelector } from "@reduxjs/toolkit";

export const defaultBillingDetailResponse = (
  bt: Partial<BillingDetailResponse> = {},
): BillingDetailResponse => {
  return {
    id: "",
    _links: { payment_method: defaultHalHref() },
    ...bt,
  };
};

const defaultBillingDetail = (
  bt: Partial<BillingDetail> = {},
): BillingDetail => {
  return {
    id: "",
    paymentMethodUrl: "",
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

export const BILLING_DETAIL_NAME = "billingDetail";
const billingDetail = createAssign<BillingDetail>({
  name: BILLING_DETAIL_NAME,
  initialState: defaultBillingDetail(),
});

const { set: setBillingDetail } = billingDetail.actions;
export const reducers = createReducerMap(billingDetail);
export const selectBillingDetail = (state: AppState) =>
  state[BILLING_DETAIL_NAME];
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

  ctx.actions.push(setBillingDetail(deserializeBillingDetail(ctx.json.data)));
});
// TODO: for trial expiration banner
/* const fetchStripeSources = billingApi.get<{ id: string }>('/billing_details/:id/stripe_sources');
const fetchTrials = billingApi.get<{ id: string }>('/billing_details/:id/trials');
const fetchExternalPaymentSources = billingApi.get<{ id: string }>('/billing_details/:id/external_payment_sources');
*/

export const fetchBillingInfo = thunks.create<{ id: string }>(
  "fetch-billing-info",
  function* (ctx, next) {
    yield* put(setLoaderStart({ id: ctx.name }));

    const bdCtx = yield* call(
      fetchBillingDetail.run,
      fetchBillingDetail(ctx.payload),
    );
    if (!bdCtx.json.ok) {
      yield* put(
        setLoaderError({ id: ctx.name, message: ctx.json.data.message }),
      );
      return;
    }

    /* yield* all([
    call(fetchStripeSources.run, fetchStripeSources(ctx.payload)),
    call(fetchTrials.run, fetchTrials(ctx.payload)),
    call(fetchExternalPaymentSources.run, fetchExternalPaymentSources(ctx.payload)),
  ]), */

    yield* put(setLoaderSuccess({ id: ctx.name }));
    yield* next();
  },
);

const createBillingDetail = billingApi.post<{ orgId: string; orgName: string }>(
  "/billing_details",
  function* (ctx, next) {
    ctx.request = ctx.req({
      body: JSON.stringify({
        id: ctx.payload.orgId,
        organization_details_json: { name: ctx.payload.orgName },
      }),
    });

    yield* next();
  },
);

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
      const dtail = yield* call(
        createBillingDetail.run,
        createBillingDetail(ctx.payload),
      );
      if (!dtail.json.ok) {
        ctx.json = {
          ok: false,
          data: dtail.json.data,
        };
        return;
      }

      const results = yield* all([
        call(createBillingCycle.run, createBillingCycle(ctx.payload)),
        call(createBillingContact.run, createBillingContact(ctx.payload)),
      ]);
      // check each resp for an error
      const msg: string[] = [];
      for (let i = 0; i < results.length; i += 1) {
        if (!results[i].json.ok) {
          msg.push(results[i].json.data.message);
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
