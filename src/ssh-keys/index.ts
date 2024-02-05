import { authApi } from "@app/api";
import { HalEmbedded } from "@app/types";

export interface SshKeyResponse {
  id: string;
  name: string;
  md5_fingerprint: string;
  public_key_fingerprint: string;
  sha256_fingerprint: string;
  ssh_public_key: string;
  created_at: string;
  updated_at: string;
  _type: "ssh_key";
}

export const defaultSshKeyResponse = (
  s: Partial<SshKeyResponse> = {},
): SshKeyResponse => {
  const now = new Date().toISOString();
  return {
    id: "",
    name: "",
    md5_fingerprint: "",
    public_key_fingerprint: "",
    sha256_fingerprint: "",
    ssh_public_key: "",
    created_at: now,
    updated_at: now,
    _type: "ssh_key",
    ...s,
  };
};

export const fetchSSHKeys = authApi.get<
  { userId: string },
  HalEmbedded<{ ssh_keys: SshKeyResponse[] }>
>("/users/:userId/ssh_keys", authApi.cache());

export const addSSHKey = authApi.post<{
  name: string;
  key: string;
  userId: string;
}>("/users/:userId/ssh_keys", function* (ctx, next) {
  const body = {
    name: ctx.payload.name,
    ssh_public_key: ctx.payload.key,
  };
  ctx.elevated = true;
  ctx.request = ctx.req({
    body: JSON.stringify(body),
  });

  yield* next();
});

export const rmSSHKey = authApi.delete<{ id: string }>("/ssh_keys/:id");
