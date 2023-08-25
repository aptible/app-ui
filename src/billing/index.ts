import { billingApi, thunks } from "@app/api";
import { all, call } from "@app/fx";

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
