import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router";
import { useLoaderSuccess } from "saga-query/react";

import { homeUrl } from "@app/routes";
import { elevate } from "@app/auth";
import { selectAuthLoader, selectIsOtpError } from "@app/auth";
import { selectJWTToken } from "@app/token";

import { Input, FormGroup, Button, Alert, AptibleLogo } from "../shared";

export const ElevatePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectJWTToken);
  const location = useLocation();

  const [otpToken, setOtpToken] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [requireOtp, setRequireOtp] = useState<boolean>(false);
  const loader = useSelector(selectAuthLoader);

  useLoaderSuccess(loader, () => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get("redirect");
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
    if (isOtpError) {
      setRequireOtp(true);
    }
  }, [isOtpError]);

  return (
    <div>
      <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center justify-center">
            <AptibleLogo />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Elevate token
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={onSubmit}>
              {loader.isError ? (
                <div className="mb-8">
                  <Alert
                    title="Something went wrong"
                    variant="danger"
                    icon={
                      <div className="h-5 w-5 text-red-400" aria-hidden="true">
                        icon
                      </div>
                    }
                  >
                    <ul className="list-disc pl-5 space-y-1">
                      <li>{loader.message}</li>
                    </ul>
                  </Alert>
                </div>
              ) : null}

              <FormGroup label="Email" htmlFor="input-email">
                <Input
                  name="email"
                  type="email"
                  disabled={true}
                  value={user.email}
                  autoComplete="username"
                  autoFocus={true}
                  data-testid="input-email"
                  id="input-email"
                />
              </FormGroup>

              <FormGroup label="Password" htmlFor="password">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required={true}
                  value={password}
                  className="w-full"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormGroup>

              {requireOtp ? (
                <FormGroup label="2FA" htmlFor="input-2fa">
                  <label htmlFor="input-2fa" className="w-20 text-sm">
                    2FA Token
                  </label>
                  <input
                    type="number"
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.currentTarget.value)}
                    autoComplete="off"
                    id="input-2fa"
                    className="flex-1 outline-0 py-1 bg-transparent"
                  />
                </FormGroup>
              ) : null}

              <div>
                <Button
                  isLoading={loader.isLoading}
                  disabled={loader.isLoading}
                  type="submit"
                  variant="primary"
                  layout="block"
                  size="lg"
                >
                  Elevate token
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

/*
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
*/
