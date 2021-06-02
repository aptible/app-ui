import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FormGroup,
  Label,
  Input,
  InputFeedback,
  Stack,
  JUSTIFY,
  STATUS_VARIANT,
} from '@aptible/arrow-ds';

import {
  selectInvitationRequest,
  fetchInvitation,
  selectPendingInvitation,
} from '@app/invitations';
import { RESET_REQUEST_PASSWORD_PATH } from '@app/routes';
import { login } from '@app/auth';
import { selectIsOtpError } from '@app/token';
import { selectAuthLoader } from '@app/loaders';
import { validEmail } from '@app/string-utils';

import { AsyncButton } from '../auth/async-button';
import { AuthenticationWrapper } from '../auth/authentication-wrapper';
import { HelpLink } from '../help-link';

const LoginPage = () => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState<string>('');
  const [otpToken, setOtpToken] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [requireOtp, setRequireOtp] = useState<boolean>(false);
  const loader = useSelector(selectAuthLoader);
  const isLoading = loader.loading;

  const invitationRequest = useSelector(selectInvitationRequest);
  const invitation = useSelector(selectPendingInvitation);

  useEffect(() => {
    if (!invitation && invitationRequest.invitationId) {
      dispatch(fetchInvitation({ id: invitationRequest.invitationId }));
    }
  }, [invitationRequest.invitationId]);

  const currentEmail = invitation ? invitation.email : email;

  const onSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    /* const onSuccess = () => {
      if (invitationRequest.invitationId) {
        // history.push(acceptInvitationWithCodeUrl(invitationRequest));
      }
    }; */
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
        invitation
          ? `Log in to join ${invitation.organizationName}`
          : 'Log in to Aptible Comply'
      }
      helpText={`Don't have an account?`}
      link={{
        text: 'Sign up',
        to: '/signup',
      }}
    >
      <form onSubmit={onSubmitForm}>
        <FormGroup
          variant={
            emailErrorMessage ? STATUS_VARIANT.DANGER : STATUS_VARIANT.DEFAULT
          }
        >
          <Label htmlFor="input-email" className="brand-dark-form__label">
            Email
          </Label>

          <Input
            name="email"
            type="email"
            disabled={!!invitation}
            value={invitation ? invitation.email : email}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
            autoComplete="username"
            autoFocus
            data-testid="input-email"
            id="input-email"
          />
          <InputFeedback data-testid="input-email-error">
            {emailErrorMessage}
          </InputFeedback>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="input-password" className="brand-dark-form__label">
            Password
          </Label>
          <Input
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
            autoComplete="current-password"
            data-testid="input-password"
            id="input-password"
          />
        </FormGroup>

        {requireOtp && (
          <FormGroup>
            <Label htmlFor="input-2fa" className="brand-dark-form__label">
              2FA Token
            </Label>
            <Input
              type="number"
              value={otpToken}
              onChange={(e) =>
                setOtpToken((e.target as HTMLInputElement).value)
              }
              autoComplete="off"
              autoFocus
              data-testid="input-2fa"
              id="input-2fa"
            />
          </FormGroup>
        )}

        <Stack reverse className="mt-9 mb-6" justify={JUSTIFY.BETWEEN}>
          <AsyncButton
            inProgress={isLoading}
            disabled={isLoading}
            label="Log in"
            type="submit"
            data-testid="btn-login"
          />
          <HelpLink
            to={RESET_REQUEST_PASSWORD_PATH}
            data-test-id="reset-password-link"
          >
            Forgot your password?
          </HelpLink>
        </Stack>
      </form>
    </AuthenticationWrapper>
  );
};

export default LoginPage;
