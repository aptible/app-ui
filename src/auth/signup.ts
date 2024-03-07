import { thunks } from "@app/api";
import { createSignupBillingRecords } from "@app/billing";
import { createLog } from "@app/debug";
import { call } from "@app/fx";
import { submitHubspotForm } from "@app/hubspot";
import { schema } from "@app/schema";
import { tunaEvent } from "@app/tuna";
import { CreateUserForm, createUser, checkClaim } from "@app/users";
import { AUTH_LOADER_ID, defaultAuthLoaderMeta } from "./loader";
import { createOrganization } from "./organization";
import { createToken, elevateToken } from "./token";

const log = createLog("signup");

export const signup = thunks.create<CreateUserForm>(
  "signup",
  function* onSignup(ctx, next) {
    const {
      company: orgName,
      name,
      email,
      password,
      challenge_token,
    } = ctx.payload;
    const id = ctx.key;
    yield* schema.update(schema.loaders.start({ id }));

    let claimCtx;
    if (challenge_token === "") {
      claimCtx = yield* call(checkClaim.run(ctx.payload));
    }

    log(claimCtx)

    if (claimCtx && !claimCtx.json.ok) {
      const { message, ...meta } = claimCtx.json.error;
      yield* schema.update(
        schema.loaders.error({
          id,
          message,
          meta: defaultAuthLoaderMeta(meta) as any,
        }),
      );
      return;
    }
    
    const userCtx = yield* call(createUser.run(ctx.payload));

    log(userCtx);

    if (!userCtx.json.ok) {
      const { message, ...meta } = userCtx.json.error;
      yield* schema.update(
        schema.loaders.error({
          id,
          message,
          meta: defaultAuthLoaderMeta(meta) as any,
        }),
      );
      return;
    }

    tunaEvent("nux.signup.created-user", email);

    const tokenCtx = yield* call(
      createToken.run({
        username: email,
        password,
        otpToken: "",
      }),
    );

    log(tokenCtx);

    if (!tokenCtx.json.ok) {
      const { message, ...meta } = tokenCtx.json.error;
      yield* schema.update(
        schema.loaders.error({
          id,
          message,
          meta: defaultAuthLoaderMeta(meta) as any,
        }),
      );
      return;
    }

    // sometimes a user is being invited to an org and we dont want to
    // create an org or billing for that signup event.
    if (orgName !== "") {
      const orgCtx = yield* call(createOrganization.run({ name: orgName }));

      // hack because useLoaderSuccess expected loader.isLoader then loader.isSuccess
      yield* schema.update(schema.loaders.start({ id }));

      log(orgCtx);

      if (!orgCtx.json.ok) {
        const { message, ...meta } = orgCtx.json.error;
        yield* schema.update(
          schema.loaders.error({
            id,
            message,
            meta: defaultAuthLoaderMeta(meta) as any,
          }),
        );
        return;
      }

      const orgId = orgCtx.json.value.id;
      tunaEvent("nux.signup.created-organization", { name: orgName, orgId });

      const billsCtx = yield* call(
        createSignupBillingRecords.run({
          orgId,
          orgName,
          contactName: name,
          contactEmail: email,
        }),
      );

      if (billsCtx.json.ok) {
        tunaEvent("nux.signup.created-billing", { name: orgName, orgId });
      }

      // ignore billing errors because we could be in development
      log(billsCtx);

      // Send signup data to Hubspot
      submitHubspotForm(name, email, orgName, orgId);
    }

    const elevateCtx = yield* call(
      elevateToken.run({ username: email, password, otpToken: "" }),
    );

    log(elevateCtx);

    ctx.actions.push({ type: "REFRESH_DATA" });
    yield* schema.update([
      schema.loaders.success({
        id,
        meta: defaultAuthLoaderMeta({
          id: `${userCtx.json.value.id}`,
          verified: userCtx.json.value.verified,
        }) as any,
      }),
      schema.loaders.success({
        id: AUTH_LOADER_ID,
      }),
    ]);

    yield* next();
  },
);
