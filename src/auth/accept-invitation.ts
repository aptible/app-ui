import { call, select } from 'saga-query';

import { ApiGen } from '@app/types';
import { authApi, AuthApiCtx } from '@app/api';
import { selectToken } from '@app/token';

import { exchangeToken } from './token';

interface AcceptInvitation {
  invitationId: string;
  verificationCode?: string;
}

export const acceptInvitation = authApi.post(
  'accept-invitation',
  function* onAcceptInvitation(
    ctx: AuthApiCtx<any, AcceptInvitation>,
    next,
  ): ApiGen {
    if (ctx.payload.verificationCode) {
      ctx.request = ctx.req({
        url: '/verifications',
        body: JSON.stringify({
          type: 'invitation',
          invitation_id: ctx.payload.invitationId,
          verification_code: ctx.payload.verificationCode,
        }),
      });
    } else {
      ctx.request = ctx.req({
        url: `/invitations/${ctx.payload.invitationId}/accept`,
      });
    }

    yield next();

    if (!ctx.json.ok) return;

    // After accepting an invitation, we need to refresh our token to get elevated permissions
    // Once the elevated permissions are granted, we need to reload all assets using bootup.
    const token = yield select(selectToken);
    yield call(exchangeToken.run, exchangeToken(token));
  },
);
