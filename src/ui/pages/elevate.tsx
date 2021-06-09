import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router';
import {
  FormGroup,
  Label,
  Input,
  InputFeedback,
  Stack,
  JUSTIFY,
  STATUS_VARIANT,
} from '@aptible/arrow-ds';

import { homeUrl } from '@app/routes';
import { elevate } from '@app/auth';
import { selectIsOtpError } from '@app/token';
import { selectAuthLoader } from '@app/loaders';
import { selectCurrentUser } from '@app/users';

import { AsyncButton } from '../auth/async-button';
import { AuthenticationWrapper } from '../auth/authentication-wrapper';
import { useLoaderSuccess } from '../use-loader-success';

export const ElevatePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const location = useLocation();

  const [otpToken, setOtpToken] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [requireOtp, setRequireOtp] = useState<boolean>(false);
  const loader = useSelector(selectAuthLoader);

  useLoaderSuccess(loader, () => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    navigate(redirect ? redirect : homeUrl());
  });

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(
      elevate({
        username: user.email,
        password,
        otpToken,
      }),
    );
  };

  const isOtpError = useSelector(selectIsOtpError);
  useEffect(() => {
    if (isOtpError) setRequireOtp(true);
  }, [isOtpError]);

  return (
    <AuthenticationWrapper title="Re-enter your credentials">
      <form onSubmit={onSubmit}>
        <FormGroup>
          <Label htmlFor="input-email" className="brand-dark-form__label">
            Email
          </Label>

          <Input
            name="email"
            type="email"
            disabled={true}
            value={user.email}
            autoComplete="username"
            autoFocus
            data-testid="input-email"
            id="input-email"
          />
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
            inProgress={loader.isLoading}
            disabled={loader.isLoading}
            label="Log in"
            type="submit"
            data-testid="btn-login"
          />
        </Stack>
      </form>
    </AuthenticationWrapper>
  );
};
