import { authApi } from "@app/api";
import { createLog } from "@app/debug";
import type {
  CredentialCreationOptionsJSON,
  CredentialRequestOptionsJSON,
  PublicKeyCredentialWithAttestationJSON,
} from "@github/webauthn-json";
import { create, get } from "@github/webauthn-json";

const log = createLog("webauthn");

export function hasWebAuthnSupport(): boolean {
  let scope = null;
  if (window) {
    scope = window;
  } else if (global) {
    scope = global;
  } else {
    return false;
  }

  // https://stackoverflow.com/a/55868189
  return typeof scope.PublicKeyCredential !== "undefined";
}

export function webauthnCreate(payload: CredentialCreationOptionsJSON) {
  if (!hasWebAuthnSupport()) {
    throw new Error("webauthn not supported for browser");
  }

  const result = create(payload);
  return result;
}

export function webauthnGet(
  payload: CredentialRequestOptionsJSON["publicKey"],
) {
  if (!hasWebAuthnSupport()) {
    throw new Error("webauthn not supported for browser");
  }

  if (!payload) {
    throw new Error("payload cannot be undefined");
  }

  const publicKey: CredentialRequestOptionsJSON["publicKey"] = {
    challenge: payload.challenge,
    rpId: payload.rpId,
    allowCredentials: payload.allowCredentials,
    timeout: payload.timeout,
    extensions: payload.extensions,
    userVerification: "discouraged",
  };
  log("SECURITY KEY GET BLOB", publicKey);

  return get({ publicKey });
}

interface CreateWebauthnDeviceProps {
  userId: string;
  name: string;
  u2f: PublicKeyCredentialWithAttestationJSON;
}

export const createWebauthnDevice = authApi.post<CreateWebauthnDeviceProps>(
  "/users/:userId/u2f_devices",
  function* (ctx, next) {
    const { u2f, name } = ctx.payload;
    ctx.request = ctx.req({
      body: JSON.stringify({ u2f, name, version: "WEBAUTHN" }),
    });
    yield* next();
  },
);
