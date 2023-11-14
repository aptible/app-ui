import { authApi, thunks } from "@app/api";
import { selectEnv } from "@app/env";
import {
  all,
  call,
  put,
  select,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
} from "@app/fx";

export const createMembership = authApi.post<{ id: string; userUrl: string }>(
  "/roles/:id/memberships",
  function* (ctx, next) {
    ctx.request = ctx.req({
      body: JSON.stringify({ user_url: ctx.payload.userUrl }),
    });
    yield* next();
  },
);
export const deleteMembership = authApi.delete<{ id: string }>(
  "/memberships/:id",
);

export const updateUserMemberships = thunks.create<{
  userId: string;
  add: string[];
  remove: string[];
}>("update-user-memberships", function* (ctx, next) {
  const id = ctx.name;
  yield* put(setLoaderStart({ id }));

  const { userId, add, remove } = ctx.payload;
  const env = yield* select(selectEnv);
  const userUrl = `${env.authUrl}/users/${userId}`;

  const addReqs = add.map((roleId) =>
    call(createMembership.run, createMembership({ userUrl, id: roleId })),
  );
  const rmReqs = remove.map((membershipId) =>
    call(deleteMembership.run, deleteMembership({ id: membershipId })),
  );
  const results = yield* all([...addReqs, ...rmReqs]);

  yield* next();

  const errors = results
    .filter((res) => res.json.ok === false)
    .map((res) => res.json.data.message);

  if (errors.length > 0) {
    yield* put(setLoaderError({ id, message: errors.join(", ") }));
    return;
  }

  yield* put(
    setLoaderSuccess({ id, message: "Successfully updated user roles!" }),
  );
});
