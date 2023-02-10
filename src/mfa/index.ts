import { Next, select } from "saga-query";

import {
  createAssign,
  createTable,
  createReducerMap,
} from "@app/slice-helpers";
import { LinkResponse, ApiGen, AppState, U2fDevice, Otp } from "@app/types";
import { defaultEntity } from "@app/hal";
import { authApi, AuthApiCtx } from "@app/api";

const defaultOtp = (o: Partial<Otp> = {}): Otp => {
  return {
    id: "",
    uri: "",
    recoveryCodesUrl: "",
    currentUrl: "",
    ...o,
  };
};

const initOtp = defaultOtp();
export const OTP_NAME = "otp";
const otp = createAssign({
  name: OTP_NAME,
  initialState: initOtp,
});
export const { set: setOtp } = otp.actions;
export const selectOtp = (s: AppState) => s[OTP_NAME] || initOtp;

export const U2F_DEVICES_NAME = "u2fDevices";
const u2fDevices = createTable<U2fDevice>({ name: U2F_DEVICES_NAME });
export const { selectTableAsList: selectU2fDevicesAsList } =
  u2fDevices.getSelectors((s: AppState) => s[U2F_DEVICES_NAME]);
const { add: addU2fDevice } = u2fDevices.actions;

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

export const reducers = createReducerMap(u2fDevices, otp);

export const entities = {
  u2f_device: defaultEntity({
    id: "u2f_device",
    save: addU2fDevice,
    deserialize: deserializeU2f,
  }),
};

export const fetchU2fDevices = authApi.get<{ userId: string }>(
  "/users/:userId/u2f_devices",
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
  yield next();
}

export const fetchOtpCodes = authApi.get<{ otpId: string }>(
  "/otp_configurations/:otpId/otp_recovery_codes",
  elevateAndCache,
);

export const setupOtp = authApi.post<SetupOtp, OtpResponse>(
  "/users/:userId/otp_configurations",
  function* onOtp(ctx, next): ApiGen {
    const curOtp = yield* select(selectOtp);
    if (curOtp.id) {
      return;
    }

    yield next();

    if (!ctx.json.ok) {
      return;
    }

    const newOtp = deserializeOtp(ctx.json.data);
    ctx.actions.push(setOtp(newOtp));
  },
);

export const fetchU2fChallenges = authApi.post<{ userId: string }>(
  "/users/:userId/u2f_challenges",
  elevateAndCache,
);
