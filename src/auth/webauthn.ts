import type {
  CredentialCreationOptionsJSON,
  CredentialRequestOptionsJSON,
} from "@github/webauthn-json";
import { create, get } from "@github/webauthn-json";

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

  return create(payload);
}

export function webauthnGet(
  payload: CredentialRequestOptionsJSON["publicKey"] & { challenge: string },
) {
  if (!hasWebAuthnSupport()) {
    throw new Error("webauthn not supported for browser");
  }

  const publicKey = {
    ...payload,
    userVerification: "discouraged" as "discouraged",
  };

  return get({ publicKey });
}
