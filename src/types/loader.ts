import { CredentialRequestOptionsJSON } from "@github/webauthn-json";

export interface AuthLoaderMessage {
  error: string;
  code: number;
  exception_context: {
    u2f?: {
      payload: CredentialRequestOptionsJSON["publicKey"] & {
        challenge: string;
      };
    };
  };
  verified: boolean;
  id: string;
}
