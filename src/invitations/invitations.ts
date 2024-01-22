import { authApi } from "@app/api";
import { selectEnv, selectOrigin } from "@app/config";
import { isBefore } from "@app/date";
import { select } from "@app/fx";
import { createSelector } from "@app/fx";
import { defaultHalHref, extractIdFromLink } from "@app/hal";
import { WebState, schema } from "@app/schema";
import { selectToken } from "@app/token";
import type {
  HalEmbedded,
  Invitation,
  InvitationResponse,
  Token,
} from "@app/types";

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

export const selectInvitationById = schema.invitations.selectById;
export const selectInvitationsByOrgId = createSelector(
  schema.invitations.selectTableAsList,
  (_: WebState, p: { orgId: string }) => p.orgId,
  (invitations, orgId) =>
    invitations.filter((inv) => inv.organizationId === orgId),
);

export const fetchInvitations = authApi.get<
  { orgId: string },
  HalEmbedded<{ invitations: InvitationResponse[] }>
>("/organizations/:orgId/invitations", function* onFetchInvitations(ctx, next) {
  const token: Token = yield* select(selectToken);
  if (!token) {
    return;
  }
  yield* next();
  if (!ctx.json.ok) {
    return;
  }

  const { value } = ctx.json;
  const invitationsMap = value._embedded.invitations.reduce<
    Record<string, Invitation>
  >((acc, invitation) => {
    acc[invitation.id] = deserializeInvitation(invitation);
    return acc;
  }, {});

  yield* schema.update(schema.invitations.set(invitationsMap));
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
    const { value } = ctx.json;

    yield* schema.update(
      schema.invitations.add({ [value.id]: deserializeInvitation(value) }),
    );
  },
);

export const resetInvitation = authApi.post<{ invitationId: string }>(
  "/resets",
  function* onResetInvitation(ctx, next) {
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
    if (!ctx.json.ok) return;
    ctx.loader = { message: `Invitation sent to ${ctx.payload.email}` };
  },
);
