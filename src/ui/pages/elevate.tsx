import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import { useLoaderSuccess } from "saga-query/react";

import { elevate, elevateWebauthn } from "@app/auth";
import { selectAuthLoader, selectIsOtpError } from "@app/auth";
import { homeUrl } from "@app/routes";
import { selectJWTToken } from "@app/token";

import { HeroBgLayout } from "../layouts";
import { Alert, Button, ExternalLink, FormGroup, Input } from "../shared";

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

  const loginPayload = {
    username: user.email,
    password,
    otpToken,
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(elevate(loginPayload));
  };

  const isOtpError = useSelector(selectIsOtpError);
  useEffect(() => {
    if (isOtpError) {
      setRequireOtp(true);
      dispatch(
        elevateWebauthn({
          ...loginPayload,
          webauthn: loader.meta.exception_context.u2f?.payload,
        }),
      );
    }
  }, [isOtpError]);

  return (
    <HeroBgLayout>
      <h2 className="mt-6 mb-4 text-center text-3xl font-semibold text-gray-900">
        Elevate token
      </h2>
      <p>
        We require a short-lived elevated token before allowing changes to
        authentication credentials (i.e. changing password, adding pubkey,
        disabling 2FA). This token lasts for 15 minutes.
      </p>

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
              <FormGroup
                label="2FA"
                htmlFor="input-2fa"
                description={
                  <p>
                    Read our 2fa{" "}
                    <ExternalLink
                      href="https://www.aptible.com/docs/password-authentication#2-factor-authentication-2fa"
                      variant="info"
                    >
                      docs
                    </ExternalLink>{" "}
                    to learn more.
                  </p>
                }
              >
                <Input
                  type="number"
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.currentTarget.value)}
                  autoComplete="off"
                  autoFocus
                />
              </FormGroup>
            ) : null}

            <div>
              <Button
                isLoading={loader.isLoading}
                disabled={loader.isLoading}
                type="submit"
                layout="block"
                size="lg"
              >
                Elevate token
              </Button>
            </div>
          </form>
        </div>
      </div>
    </HeroBgLayout>
  );
};
