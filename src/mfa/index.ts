import { authApi } from "@app/api";
import { revokeTokensMdw } from "@app/auth";
import { Next, leading, select } from "@app/fx";
import { defaultEntity } from "@app/hal";
import { db, schema } from "@app/schema";
import {
  AuthApiCtx,
  HalEmbedded,
  LinkResponse,
  Otp,
  U2fDevice,
} from "@app/types";
import { PublicKeyCredentialCreationOptionsJSON } from "node_modules/@github/webauthn-json/dist/types/basic/json";

interface U2fDeviceResponse {
  id: string;
  name: string;
  key_handle: string;
  version: string;
  created_at: string;
  updated_at: string;
}

const deserializeU2f = (u: U2fDeviceResponse): U2fDevice => {
  return {
    id: u.id,
    name: u.name,
    keyHandle: u.key_handle,
    version: u.version,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  };
};

export const entities = {
  u2f_device: defaultEntity({
    id: "u2f_device",
    save: db.u2fDevices.add,
    deserialize: deserializeU2f,
  }),
};

export const fetchU2fDevices = authApi.get<{ userId: string }>(
  "/users/:userId/u2f_devices",
  function* (ctx, next) {
    ctx.elevated = true;
    yield* next();
  },
);

export const deleteU2fDevice = authApi.delete<{ deviceId: string }>(
  "/u2f_devices/:deviceId",
  [
    function* (ctx, next) {
      ctx.elevated = true;
      const { deviceId } = ctx.payload;
      yield* next();
      if (!ctx.json.ok) {
        return;
      }

      yield* schema.update(db.u2fDevices.remove([deviceId]));
    },
    revokeTokensMdw,
  ],
);

interface SetupOtp {
  userId: string;
}

interface OtpResponse {
  id: string;
  otp_uri: string;
  _links: {
    self: LinkResponse;
    user: LinkResponse;
    otp_recovery_codes: LinkResponse;
  };
}

interface OtpCode {
  id: string;
  value: string;
  used: boolean;
}

const deserializeOtp = (data: OtpResponse): Otp => {
  return {
    id: data.id,
    uri: data.otp_uri,
    currentUrl: data._links.self?.href || "",
    recoveryCodesUrl: data._links.otp_recovery_codes?.href || "",
  };
};

function* elevateAndCache(ctx: AuthApiCtx, next: Next) {
  ctx.cache = true;
  ctx.elevated = true;
  yield* next();
}

export const fetchOtpCodes = authApi.get<
  { otpId: string },
  HalEmbedded<{ otp_recovery_codes: OtpCode[] }>
>("/otp_configurations/:otpId/otp_recovery_codes", elevateAndCache);

export const setupOtp = authApi.post<SetupOtp, OtpResponse>(
  "/users/:userId/otp_configurations",
  function* onOtp(ctx, next) {
    const curOtp = yield* select(db.otp.select);
    if (curOtp.id) {
      return;
    }

    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    const newOtp = deserializeOtp(ctx.json.value);
    yield* schema.update(db.otp.set(newOtp));
  },
);

export interface U2fChallenge {
  id: string;
  challenge: string;
  payload: PublicKeyCredentialCreationOptionsJSON;
}

export const fetchU2fChallenges = authApi.post<
  { userId: string },
  U2fChallenge
>("/users/:userId/u2f_challenges", elevateAndCache);

export const resetOtp = authApi.post<{ userId: string }>(
  "/otp/resets/new",
  function* (ctx, next) {
    ctx.request = ctx.req({
      body: JSON.stringify({ user_id: ctx.payload.userId }),
    });
    yield* next();
  },
);

export const resetOtpVerify = authApi.post<{
  challengeId: string;
  verificationCode: string;
}>(["/verifications", "otp"], { supervisor: leading }, [
  function* (ctx, next) {
    const { challengeId, verificationCode } = ctx.payload;
    ctx.request = ctx.req({
      body: JSON.stringify({
        type: "otp_reset_challenge",
        challenge_id: challengeId,
        verification_code: verificationCode,
      }),
    });

    yield* next();
  },
  revokeTokensMdw,
]);
