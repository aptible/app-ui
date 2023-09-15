import { authApi, thunks } from "@app/api";
import { selectEnv } from "@app/env";
import {
  call,
  parallel,
  put,
  select,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
} from "@app/fx";
import { extractIdFromLink } from "@app/hal";
import { AuthApiError, HalEmbedded } from "@app/types";

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
const fetchMembershipsByRole = authApi.get<
  { roleId: string },
  HalEmbedded<{ memberships: any[] }>,
  AuthApiError
>("/roles/:roleId/memberships", authApi.cache());

export const updateUserMemberships = thunks.create<{
  userId: string;
  add: string[];
  remove: string[];
}>("update-user-memberships", function* (ctx, next) {
  const id = ctx.key;
  yield* put(setLoaderStart({ id }));

  const { userId, add, remove } = ctx.payload;
  const env = yield* select(selectEnv);
  const userUrl = `${env.authUrl}/users/${userId}`;

  const addReqs = add.map((roleId) =>
    call(() => createMembership.run(createMembership({ userUrl, id: roleId }))),
  );

  // We have the role but in order to remove a role associated with a user
  // we have to find the membership associated with that user and role.
  //
  // This is a pretty big pain since we dont have any good API endpoints
  // to make this easy for us.  So instead we have to first fetch *all*
  // memberships for a role and then filter by the user.
  const rmReqs: any[] = [];
  for (let i = 0; i < remove.length; i += 1) {
    const memberships = yield* call(() =>
      fetchMembershipsByRole.run(fetchMembershipsByRole({ roleId: remove[i] })),
    );
    if (!memberships.json.ok) {
      continue;
    }

    const membership = memberships.json.data._embedded.memberships.find(
      (m) => userId === extractIdFromLink(m._links.user),
    );
    const cl = call(() =>
      deleteMembership.run(deleteMembership({ id: membership.id })),
    );
    rmReqs.push(cl);
  }

  const group = yield* parallel([...addReqs, ...rmReqs]);
  const results: any[] = yield* group;

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
