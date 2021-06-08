import React, { useState, useEffect } from 'react';
import qs from 'query-string';
import { useLocation, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import {
  FormGroup,
  Label,
  Input,
  InputFeedback,
  STATUS_VARIANT,
  Stack,
  JUSTIFY,
} from '@aptible/arrow-ds';

import { validatePasswordComplexity, signup } from '@app/auth';
import {
  selectInvitationRequest,
  selectPendingInvitation,
  fetchInvitation,
} from '@app/invitations';
import {
  LOGIN_PATH,
  acceptInvitationWithCodeUrl,
  verifyEmailRequestUrl,
} from '@app/routes';
import { selectAuthLoader } from '@app/loaders';
import { validEmail } from '@app/string-utils';

import { AuthenticationWrapper } from '../auth/authentication-wrapper';
import { AsyncButton } from '../auth/async-button';
import { Progress } from '../auth/progress';
import { useLoaderSuccess } from '../use-loader-success';
import { LoggedInBanner } from '../auth/logged-in-banner';

const createQueryStringValue =
  (queryString: string) =>
  (key: string): string => {
    const values = qs.parse(queryString);
    const returnValue = values[key];

    if (returnValue && Array.isArray(returnValue)) {
      const [value] = returnValue;
      return value || '';
    }

    return returnValue || '';
  };

const SignupPageForm = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const getQueryStringValue = createQueryStringValue(location.search);

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>(getQueryStringValue('email'));
  const [password, setPassword] = useState<string>('');

  const loader = useSelector(selectAuthLoader);
  const { isLoading } = loader;

  const invitationRequest = useSelector(selectInvitationRequest);
  const invitation = useSelector(selectPendingInvitation);

  const [challengeToken] = useState<string>(getQueryStringValue('token'));

  useEffect(() => {
    if (!invitation && invitationRequest.invitationId) {
      dispatch(fetchInvitation({ id: invitationRequest.invitationId }));
    }
  }, [invitationRequest.invitationId]);

  const currentEmail = invitation ? invitation.email : email;

  const emailErrorMessage =
    currentEmail === '' || validEmail(currentEmail)
      ? null
      : 'Not a valid email';

  const passwordErrors = validatePasswordComplexity(password);
  const passwordErrorMessage =
    password !== '' && passwordErrors.length > 0
      ? `Password ${passwordErrors.join(', ')}`
      : '';
  const disableSave =
    name === '' ||
    currentEmail === '' ||
    password === '' ||
    !!emailErrorMessage ||
    passwordErrors.length > 0;

  const onSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disableSave) {
      return;
    }

    dispatch(
      signup({
        name,
        email: invitation ? invitation.email : email,
        password,
        challenge_token: challengeToken,
      }),
    );
  };

  useLoaderSuccess(loader, () => {
    if (invitationRequest.invitationId) {
      navigate(acceptInvitationWithCodeUrl(invitationRequest));
    } else {
      navigate(verifyEmailRequestUrl());
    }
  });

  return (
    <form onSubmit={onSubmitForm}>
      <LoggedInBanner />
      <FormGroup>
        <Label htmlFor="input-name" className="brand-dark-form__label">
          Your Name
        </Label>
        <Input
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName((e.target as HTMLInputElement).value)}
          autoComplete="name"
          disabled={isLoading}
          autoFocus
          data-testid="input-name"
          id="input-name"
        />
      </FormGroup>
      <FormGroup
        variant={
          emailErrorMessage ? STATUS_VARIANT.DANGER : STATUS_VARIANT.DEFAULT
        }
      >
        <Label htmlFor="input-email" className="brand-dark-form__label">
          Your email
        </Label>
        <Input
          name="email"
          type="email"
          value={invitation ? invitation.email : email}
          disabled={!!invitation || isLoading}
          onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
          autoComplete="username"
          data-testid="input-email"
          id="input-email"
        />
        <InputFeedback data-testid="email-error">
          {emailErrorMessage}
        </InputFeedback>
      </FormGroup>

      <FormGroup
        variant={
          passwordErrorMessage ? STATUS_VARIANT.DANGER : STATUS_VARIANT.DEFAULT
        }
      >
        <Label htmlFor="input-password" className="brand-dark-form__label">
          Password
        </Label>
        <Input
          name="password"
          type="password"
          value={password}
          disabled={isLoading}
          onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
          autoComplete="current-password"
          data-testid="input-password"
          id="input-password"
        />
        <InputFeedback data-testid="password-error">
          {passwordErrorMessage}
        </InputFeedback>
      </FormGroup>

      <Stack reverse className="mt-9 mb-6" justify={JUSTIFY.BETWEEN}>
        <AsyncButton
          inProgress={isLoading}
          disabled={disableSave}
          label="Create Account"
          type="submit"
          data-testid="signup-submit"
        />
      </Stack>
    </form>
  );
};

export const SignupPage = () => {
  const invitation = useSelector(selectPendingInvitation);

  let title: string;
  if (invitation) {
    title = `Sign up to join ${invitation.organizationName}`;
  } else {
    title = 'Sign up for Aptible';
  }

  return (
    <AuthenticationWrapper
      title={title}
      helpText="Already have an account?"
      link={{
        text: 'Log in',
        to: LOGIN_PATH,
      }}
      progressElement={<Progress steps={3} currentStep={1} />}
    >
      <SignupPageForm />
    </AuthenticationWrapper>
  );
};

/*
 *<FormGroup className="mb-12">
        <Label htmlFor="input-name" className="brand-dark-form__label">
          Organization name
        </Label>
        <Input
          name="organization"
          type="text"
          value={org}
          onChange={(e) => setOrg((e.target as HTMLInputElement).value)}
          disabled={isLoading}
          data-testid="input-org"
          id="input-org"
        />
        <InputFeedback>
          If you don&apos;t have a user account, but need to join an existing
          organization, have one of the owners of the organization send you an
          invitation to join.
        </InputFeedback>
        </FormGroup> */
