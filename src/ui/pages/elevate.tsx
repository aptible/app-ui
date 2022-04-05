import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router';

import { homeUrl } from '@app/routes';
import { elevate } from '@app/auth';
import { selectAuthLoader, selectIsOtpError } from '@app/auth';
import { selectJWTToken } from '@app/token';

import { AuthenticationWrapper } from '../auth/authentication-wrapper';
import { useLoaderSuccess } from '../use-loader-success';
import { FormGroup } from '../form-group';
import { Button } from '../button';

export const ElevatePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectJWTToken);
  const location = useLocation();

  const [otpToken, setOtpToken] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [requireOtp, setRequireOtp] = useState<boolean>(false);
  const loader = useSelector(selectAuthLoader);

  useLoaderSuccess(loader, () => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    navigate(redirect || homeUrl());
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
          <label htmlFor="input-email" className="brand-dark-form__label">
            Email
          </label>

          <input
            name="email"
            type="email"
            disabled
            value={user.email}
            autoComplete="username"
            autoFocus
            data-testid="input-email"
            id="input-email"
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor="input-password" className="brand-dark-form__label">
            Password
          </label>
          <input
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            autoComplete="current-password"
            data-testid="input-password"
            id="input-password"
          />
        </FormGroup>

        {requireOtp && (
          <FormGroup>
            <label htmlFor="input-2fa" className="brand-dark-form__label">
              2FA Token
            </label>
            <input
              type="number"
              value={otpToken}
              onChange={(e) => setOtpToken(e.currentTarget.value)}
              autoComplete="off"
              autoFocus
              data-testid="input-2fa"
              id="input-2fa"
            />
          </FormGroup>
        )}

        <div className="flex flex-col justify-between mt-9 mb-6">
          <Button
            isLoading={loader.isLoading}
            disabled={loader.isLoading}
            type="submit"
            data-testid="btn-login"
          >
            Log in
          </Button>
        </div>
      </form>
    </AuthenticationWrapper>
  );
};
