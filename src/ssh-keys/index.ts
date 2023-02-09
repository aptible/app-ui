import { authApi } from "@app/api";

export const fetchSSHKeys = authApi.get<{ userId: string }>(
  "/users/:userId/ssh_keys",
  authApi.cache(),
);

export const addSSHKey = authApi.post<{
  name: string;
  key: string;
  userId: string;
}>("/users/:userId/ssh_keys", function* (ctx, next) {
  const body = {
    name: ctx.payload.name,
    ssh_public_key: ctx.payload.key,
  };
  ctx.request = ctx.req({
    body: JSON.stringify(body),
  });

  yield next();
});
