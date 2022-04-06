import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router';
import { useLoaderSuccess } from 'saga-query/react';

import { homeUrl } from '@app/routes';
import { elevate } from '@app/auth';
import { selectAuthLoader, selectIsOtpError } from '@app/auth';
import { selectJWTToken } from '@app/token';

import { AuthenticationWrapper } from '../auth/authentication-wrapper';
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
        <div className="bg-white/5 shadow-md rounded-lg">
          <FormGroup className="px-6 h-14 flex items-center border-b border-white/5">
            <label htmlFor="input-email" className="w-20 text-sm">
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
              className="flex-1 outline-0 py-1 bg-transparent disabled:cursor-not-allowed text-white/20"
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
              data-testid="input-password"
              id="input-password"
              className="flex-1 outline-0 py-1 bg-transparent"
            />
          </FormGroup>

          {requireOtp && (
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
                data-testid="input-2fa"
                id="input-2fa"
                className="flex-1 outline-0 py-1 bg-transparent"
              />
            </FormGroup>
          )}
        </div>

        <div className="flex flex-col justify-between mt-9 mb-6">
          <Button
            isLoading={loader.isLoading}
            disabled={loader.isLoading}
            type="submit"
            variant="success"
            className="h-12 rounded-lg"
          >
            Log in
          </Button>
        </div>
      </form>
    </AuthenticationWrapper>
  );
};
