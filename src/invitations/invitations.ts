import { isBefore } from "date-fns";
import { select } from "saga-query";

import { createTable } from "@app/slice-helpers";
import { authApi, AuthApiCtx } from "@app/api";
import type {
  Token,
  InvitationsResponse,
  InvitationResponse,
  Invitation,
  AppState,
  ApiGen,
  MapEntity,
} from "@app/types";
import { selectToken } from "@app/token";
import { selectOrigin } from "@app/env";

export const defaultInvitation = (i?: Partial<Invitation>): Invitation => {
  return {
    id: "",
    email: "",
    createdAt: "",
    updatedAt: "",
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
  return {
    id: "",
    email: "",
    created_at: "",
    updated_at: "",
    organization_name: "",
    inviter_name: "",
    role_name: "",
    verification_code_expires_at: "",
    ...i,
  };
};

export function deserializeInvitation(i: InvitationResponse): Invitation {
  return {
    id: i.id,
    email: i.email,
    createdAt: i.created_at,
    updatedAt: i.updated_at,
    organizationName: i.organization_name,
    inviterName: i.inviter_name,
    roleName: i.role_name,
    expired: isBefore(new Date(i.verification_code_expires_at), new Date()),
  };
}

export const invitations = createTable<Invitation>({
  name: "invitations",
});

export const {
  add: addInvitations,
  set: setInvitations,
  remove: removeInvitations,
  reset: resetInvitations,
} = invitations.actions;

export const defaultInvitationInstance = defaultInvitation();
export const selectInvitations = (state: AppState) => state.invitations;
export const selectInvitation = (state: AppState, { id }: { id: string }) =>
  selectInvitations(state)[id] || defaultInvitationInstance;

export const fetchInvitations = authApi.get<{ orgId: string }>(
  "/organizations/:orgId/invitations",
  function* onFetchInvitations(ctx: AuthApiCtx<InvitationsResponse>, next) {
    const token: Token = yield select(selectToken);
    if (!token) {
      return;
    }
    yield next();
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

    ctx.actions.push(addInvitations(invitationsMap));
  },
);

export const fetchInvitation = authApi.get<{ id: string }>(
  "/invitations/:id",
  function* onFetchInvitation(ctx: AuthApiCtx<InvitationResponse>, next) {
    yield next();
    if (!ctx.json.ok) {
      return;
    }
    const { data } = ctx.json;

    ctx.actions.push(
      addInvitations({ [data.id]: deserializeInvitation(data) }),
    );
  },
);

export const resetInvitation = authApi.post<string>(
  "/resets",
  function* onResetInvitation(ctx, next): ApiGen {
    const origin = yield select(selectOrigin);
    ctx.request = ctx.req({
      body: JSON.stringify({
        type: "invitation",
        origin,
        invitation_id: ctx.payload,
      }),
    });
    yield next();
  },
);
