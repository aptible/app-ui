import { createAssign } from "@app/slice-helpers";
import { AppState, InvitationRequest } from "@app/types";

export const INVITATION_REQUEST_SLICE = "invitationRequest";

export const defaultInvitationRequest = (
  r: Partial<InvitationRequest> = {},
) => {
  return {
    verificationCode: "",
    invitationId: "",
    ...r,
  };
};

export const invitationRequest = createAssign<InvitationRequest>({
  name: INVITATION_REQUEST_SLICE,
  initialState: {
    verificationCode: "",
    invitationId: "",
  },
});

export const { set: setInvitationRequest, reset: resetInvitationRequest } =
  invitationRequest.actions;

const initInviteRequest = defaultInvitationRequest();

export const selectInvitationRequest = (state: AppState) =>
  state[INVITATION_REQUEST_SLICE] || initInviteRequest;

export const selectIsInvitationPending = (state: AppState) => {
  return selectInvitationRequest(state).invitationId !== "";
};
