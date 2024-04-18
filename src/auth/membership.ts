import { authApi, thunkLoader, thunks } from "@app/api";
import { selectEnv } from "@app/config";
import { call, createSelector, parallel, select, takeLeading } from "@app/fx";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import { WebState, schema } from "@app/schema";
import {
  AuthApiCtx,
  HalEmbedded,
  LinkResponse,
  Membership,
  User,
} from "@app/types";
import { selectUsers } from "@app/users";

export interface MembershipResponse {
  id: string;
  privileged: boolean;
  created_at: string;
  updated_at: string;
  _links: {
    user: LinkResponse;
    role: LinkResponse;
  };
  _type: "membership";
}

export const defaultMembershipResponse = (
  m: Partial<MembershipResponse> = {},
): MembershipResponse => {
  const now = new Date().toISOString();
  return {
    id: "",
    privileged: false,
    created_at: now,
    updated_at: now,
    _links: {
      user: defaultHalHref(),
      role: defaultHalHref(),
    },
    ...m,
    _type: "membership",
  };
};

export const deserializeMembership = (m: MembershipResponse): Membership => {
  return {
    id: m.id,
    privileged: m.privileged,
    createdAt: m.created_at,
    updatedAt: m.updated_at,
    userId: extractIdFromLink(m._links.user),
    roleId: extractIdFromLink(m._links.role),
  };
};

export const entities = {
  membership: defaultEntity({
    id: "membership",
    save: schema.memberships.add,
    deserialize: deserializeMembership,
  }),
};

export const selectMembershipsByRoleId = createSelector(
  schema.memberships.selectTableAsList,
  (_: WebState, p: { roleId: string }) => p.roleId,
  (memberships, roleId) => memberships.filter((m) => m.roleId === roleId),
);

export const selectRoleToUsersMap = createSelector(
  schema.roles.selectTableAsList,
  schema.memberships.selectTableAsList,
  selectUsers,
  (roles, memberships, users) => {
    const mapper: { [key: string]: User[] } = {};
    for (const role of roles) {
      mapper[role.id] = memberships
        .map((member) => schema.users.findById(users, { id: member.userId }))
        .filter((u) => u.id !== "");
    }
    return mapper;
  },
);

export const createMembership = authApi.post<
  { id: string; userUrl: string },
  MembershipResponse
>("/roles/:id/memberships", function* (ctx, next) {
  ctx.request = ctx.req({
    body: JSON.stringify({ user_url: ctx.payload.userUrl }),
  });
  yield* next();
});

export const updateMembership = authApi.patch<{
  id: string;
  privileged: boolean;
}>("/memberships/:id", function* (ctx, next) {
  ctx.request = ctx.req({
    body: JSON.stringify({ privileged: ctx.payload.privileged }),
  });

  yield* next();
});

export const deleteMembership = authApi.delete<{ id: string }>(
  "/memberships/:id",
);

export const fetchMembershipsByRole = authApi.get<
  { roleId: string },
  HalEmbedded<{ memberships: MembershipResponse[] }>
>("/roles/:roleId/memberships");

export const fetchMembershipsByOrgId = authApi.get<
  { orgId: string },
  HalEmbedded<{ [key: string]: { memberships: MembershipResponse[] } }>
>(
  "/organizations/:orgId/roles/memberships",
  { supervisor: takeLeading },
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }

    const memberships = Object.values(ctx.json.value._embedded).reduce(
      (acc, obj) => {
        const ships = obj.memberships.map(deserializeMembership);
        for (const membership of ships) {
          acc[membership.id] = membership;
        }
        return acc;
      },
      {} as typeof schema.memberships.initialState,
    );

    yield* schema.update(schema.memberships.add(memberships));
  },
);

export const updateUserMemberships = thunks.create<{
  userId: string;
  add: string[];
  remove: string[];
}>("update-user-memberships", [
  thunkLoader,
  function* (ctx, next) {
    const { userId, add, remove } = ctx.payload;
    const env = yield* select(selectEnv);
    const userUrl = `${env.authUrl}/users/${userId}`;

    const addReqs = add.map((roleId) =>
      call(() => createMembership.run({ userUrl, id: roleId })),
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
        fetchMembershipsByRole.run({ roleId: remove[i] }),
      );
      if (!memberships.json.ok) {
        continue;
      }

      const membership = memberships.json.value._embedded.memberships.find(
        (m) => userId === extractIdFromLink(m._links.user),
      );
      if (membership) {
        const cl = call(() => deleteMembership.run({ id: membership.id }));
        rmReqs.push(cl);
      }
    }

    // we need to add memberships before we can remove memberships
    // because if we remove memberships before we finish adding them
    // then the user would be removed from the organization -- which is bad.
    const addGroup = yield* parallel<AuthApiCtx>(addReqs);
    const addResults = yield* addGroup;
    const addErrors = addResults
      .map((res) => {
        if (!res.ok) return res.error.message;
        if (!res.value.json.ok) return res.value.json.error.message;
        return "";
      })
      .filter(Boolean);
    if (addErrors.length > 0) {
      throw new Error(addErrors.join(","));
    }

    const rmGroup = yield* parallel<AuthApiCtx>(rmReqs);
    const rmResults = yield* rmGroup;
    const rmErrors = rmResults
      .map((res) => {
        if (!res.ok) return res.error.message;
        if (!res.value.json.ok) return res.value.json.error.message;
        return "";
      })
      .filter(Boolean);
    if (rmErrors.length > 0) {
      throw new Error(rmErrors.join(","));
    }

    yield* next();

    ctx.loader = {
      message: "Successfully updated user roles!",
    };
  },
]);
