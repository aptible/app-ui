import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { useLoaderSuccess } from 'saga-query/react';

import {
  selectInvitationRequest,
  fetchInvitation,
  selectPendingInvitation,
} from '@app/invitations';
import {
  RESET_REQUEST_PASSWORD_PATH,
  acceptInvitationWithCodeUrl,
  homeUrl,
  signupUrl,
} from '@app/routes';
import { login, selectAuthLoader, selectIsOtpError } from '@app/auth';
import { validEmail } from '@app/string-utils';

import { FormGroup } from '../form-group';
import { AuthenticationWrapper } from '../auth/authentication-wrapper';
import { HelpLink } from '../help-link';
import { LoggedInBanner } from '../auth/logged-in-banner';
import { InputFeedback } from '../input';
import { Button } from '../button';

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('');
  const [otpToken, setOtpToken] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [requireOtp, setRequireOtp] = useState<boolean>(false);
  const loader = useSelector(selectAuthLoader);

  const invitationRequest = useSelector(selectInvitationRequest);
  const invitation = useSelector(selectPendingInvitation);

  useEffect(() => {
    if (!invitation && invitationRequest.invitationId) {
      dispatch(fetchInvitation({ id: invitationRequest.invitationId }));
    }
  }, [invitationRequest.invitationId]);

  useLoaderSuccess(loader, () => {
    if (invitationRequest.invitationId) {
      navigate(acceptInvitationWithCodeUrl(invitationRequest));
    } else {
      navigate(homeUrl());
    }
  });

  const currentEmail = invitation ? invitation.email : email;

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(
      login({
        username: currentEmail,
        password,
        otpToken,
        makeCurrent: true,
      }),
    );
  };
  const emailErrorMessage =
    currentEmail === '' || validEmail(currentEmail)
      ? null
      : 'Not a valid email';

  const isOtpError = useSelector(selectIsOtpError);
  useEffect(() => {
    if (isOtpError) setRequireOtp(true);
  }, [isOtpError]);

  return (
    <AuthenticationWrapper
      title={
        invitation ? `Log in to join ${invitation.organizationName}` : 'Log in'
      }
      helpText="Don't have an account?"
      link={{
        text: 'Sign up',
        to: signupUrl(),
      }}
    >
      <form onSubmit={onSubmit}>
        <LoggedInBanner />
        <div className="bg-white/5 shadow-md rounded-lg">
          <FormGroup
            variant={emailErrorMessage ? 'error' : 'default'}
            className="px-6 h-14 flex items-center border-b border-white/5"
          >
            <label htmlFor="input-email" className="w-20 text-sm">
              Email
            </label>

            <input
              name="email"
              type="email"
              disabled={!!invitation}
              value={invitation ? invitation.email : email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              autoComplete="username"
              autoFocus
              id="input-email"
              className="flex-1 outline-0 py-1 bg-transparent"
            />
          </FormGroup>

          <FormGroup className="px-6 h-14 flex items-center">
            <label htmlFor="input-password" className="w-20 text-sm">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              autoComplete="current-password"
              id="input-password"
              className="flex-1 outline-0 py-1 bg-transparent"
            />
          </FormGroup>

          {requireOtp ? (
            <FormGroup className="px-6 h-14 flex items-center border-t border-white/5">
              <label htmlFor="input-2fa" className="w-20 text-sm">
                2FA Token
              </label>
              <input
                type="number"
                value={otpToken}
                onChange={(e) => setOtpToken(e.currentTarget.value)}
                autoComplete="off"
                autoFocus
                id="input-2fa"
                className="flex-1 outline-0 py-1 bg-transparent"
              />
            </FormGroup>
          ) : null}
        </div>

        <div className="mt-2 h-2">
          <InputFeedback variant="error">{emailErrorMessage}</InputFeedback>
        </div>

        <div className="mt-9 mb-6 flex flex-col justify-between">
          <Button
            isLoading={loader.isLoading}
            disabled={loader.isLoading}
            type="submit"
            variant="success"
            className="mb-8 h-12 rounded-lg"
          >
            Log in
          </Button>

          <HelpLink to={RESET_REQUEST_PASSWORD_PATH} className="text-sm">
            Forgot your password?
          </HelpLink>
        </div>
      </form>
    </AuthenticationWrapper>
  );
};
