import { createReducerMap } from 'robodux';

import { invitations } from './invitations';
import { invitationRequest } from './invitation-request';

export * from './invitation-request';
export * from './invitations';

export const reducers = createReducerMap(invitations, invitationRequest);
