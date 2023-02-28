import { CredentialRequestOptionsJSON } from "@github/webauthn-json";
import type { LoadingItemState } from "saga-query";

export interface AuthLoaderMessage {
  error: string;
  code: number;
  exception_context: {
    u2f?: CredentialRequestOptionsJSON["publicKey"] & { challenge: string };
  };
  verified: boolean;
  id: string;
}

export type AuthLoader = LoadingItemState<AuthLoaderMessage>;
