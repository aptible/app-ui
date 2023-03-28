import { createReducerMap } from "@app/slice-helpers";

import { invitationRequest } from "./invitation-request";
import { invitations } from "./invitations";

export * from "./invitation-request";
export * from "./invitations";

export const reducers = createReducerMap(invitations, invitationRequest);
