import { authApi, elevatedUpdate } from "@app/api";
import { revokeTokensMdw } from "./token";

interface AddOtp {
  userId: string;
  type: "otp";
  otp_enabled: true;
  current_otp_configuration: string;
  current_otp_configuration_id: string;
  otp_token: string;
}

interface RemoveOtp {
  userId: string;
  type: "otp";
  otp_enabled: false;
}

export const addOtp = authApi.patch<AddOtp>(
  ["/users/:userId", "addotp"],
  [elevatedUpdate, revokeTokensMdw],
);

export const rmOtp = authApi.patch<RemoveOtp>(
  ["/users/:userId", "rmotp"],
  [elevatedUpdate, revokeTokensMdw],
);
