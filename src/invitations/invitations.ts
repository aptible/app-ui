import { authApi } from "@app/api";
import { selectEnv, selectOrigin } from "@app/env";
import { select } from "@app/fx";
import { defaultHalHref, extractIdFromLink } from "@app/hal";
import { createTable, mustSelectEntity } from "@app/slice-helpers";
import { selectToken } from "@app/token";
import type {
  ApiGen,
  AppState,
  HalEmbedded,
  Invitation,
  InvitationResponse,
  MapEntity,
  Token,
} from "@app/types";
import { createSelector } from "@reduxjs/toolkit";
import { isBefore } from "date-fns";

export const defaultInvitation = (i?: Partial<Invitation>): Invitation => {
  const now = new Date().toISOString();
  return {
    id: "",
    email: "",
    createdAt: now,
    updatedAt: now,
    organizationId: "",
    organizationName: "",
    inviterName: "",
    roleName: "",
    expired: false,
    ...i,
  };
};

export const defaultInvitationResponse = (
  i?: Partial<InvitationResponse>,
): InvitationResponse => {
  const now = new Date().toISOString();
  return {
    id: "",
    email: "",
    created_at: now,
    updated_at: now,
    organization_name: "",
    inviter_name: "",
    role_name: "",
    verification_code_expires_at: "",
    _links: {
      organization: defaultHalHref(),
    },
    ...i,
  };
};

export function deserializeInvitation(i: InvitationResponse): Invitation {
  return {
    id: i.id,
    email: i.email,
    createdAt: i.created_at,
    updatedAt: i.updated_at,
    organizationId: extractIdFromLink(i._links.organization),
    organizationName: i.organization_name,
    inviterName: i.inviter_name,
    roleName: i.role_name,
    expired: isBefore(new Date(i.verification_code_expires_at), new Date()),
  };
}

const INVITATIONS_NAME = "invitations";
export const invitations = createTable<Invitation>({
  name: INVITATIONS_NAME,
});
export const { add: addInvitations, set: setInvitations } = invitations.actions;
const selectors = invitations.getSelectors(
  (s: AppState) => s[INVITATIONS_NAME],
);
export const initInvitation = defaultInvitation();
const must = mustSelectEntity(initInvitation);
export const selectInvitationById = must(selectors.selectById);
export const selectInvitationsByOrgId = createSelector(
  selectors.selectTableAsList,
  (_: AppState, p: { orgId: string }) => p.orgId,
  (invitations, orgId) =>
    invitations.filter((inv) => inv.organizationId === orgId),
);

export const fetchInvitations = authApi.get<
  { orgId: string },
  HalEmbedded<{ invitations: InvitationResponse[] }>
>("/organizations/:orgId/invitations", function* onFetchInvitations(ctx, next) {
  const token: Token = yield select(selectToken);
  if (!token) {
    return;
  }
  yield* next();
  if (!ctx.json.ok) {
    return;
  }

  const { data } = ctx.json;
  const invitationsMap = data._embedded.invitations.reduce<
    MapEntity<Invitation>
  >((acc, invitation) => {
    acc[invitation.id] = deserializeInvitation(invitation);
    return acc;
  }, {});

  ctx.actions.push(setInvitations(invitationsMap));
});

export const fetchInvitation = authApi.get<{ id: string }, InvitationResponse>(
  "/invitations/:id",
  function* onFetchInvitation(ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      if (ctx.response?.status === 404) {
        ctx.loader = {
          message:
            "We could not find this invitation.  So either it never existed or was later revoked.",
        };
      }
      return;
    }
    const { data } = ctx.json;

    ctx.actions.push(
      addInvitations({ [data.id]: deserializeInvitation(data) }),
    );
  },
);

export const resetInvitation = authApi.post<{ invitationId: string }>(
  "/resets",
  function* onResetInvitation(ctx, next): ApiGen {
    const origin = yield* select(selectOrigin);
    ctx.request = ctx.req({
      body: JSON.stringify({
        type: "invitation",
        origin,
        invitation_id: ctx.payload.invitationId,
      }),
    });
    yield* next();
    if (!ctx.json.ok) return;
    ctx.loader = { message: "Resent invitation to user" };
  },
);

export const revokeInvitation = authApi.delete<{ id: string }>(
  "/invitations/:id",
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) return;
    ctx.loader = { message: "Revoked invitation" };
  },
);

export const createInvitation = authApi.post<{ email: string }>(
  "/roles/:roleId/invitations",
  function* (ctx, next) {
    const env = yield* select(selectEnv);
    ctx.request = ctx.req({
      body: JSON.stringify({ email: ctx.payload.email, origin: env.origin }),
    });
    yield* next();
    ctx.loader = { message: `Invitation sent to ${ctx.payload.email}` };
  },
);
