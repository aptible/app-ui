import { useLoaderSuccess } from "@app/fx";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";

import { elevate, elevateWebauthn } from "@app/auth";
import { selectAuthLoader, selectIsOtpError } from "@app/auth";
import { forgotPassUrl, homeUrl } from "@app/routes";
import { selectJWTToken } from "@app/token";

import { HeroBgLayout } from "../layouts";
import {
  BannerMessages,
  Button,
  ExternalLink,
  FormGroup,
  Input,
  tokens,
} from "../shared";
import { Link } from "react-router-dom";

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
      <h1 className={`${tokens.type.h1} text-center`}>
        Re-enter your credentials
      </h1>
      <div className="flex text-center items-center justify-center mt-4">
        <div className="max-w-2xl">
          <p>You must confirm your credentials before proceeding.</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-white py-8 px-10 shadow rounded-lg border border-black-100">
          <form className="space-y-4" onSubmit={onSubmit}>
            <BannerMessages className="my-2" {...loader} />
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
                label="Two-Factor Authentication Required"
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
                disabled={loader.isLoading || !password}
                type="submit"
                layout="block"
                size="lg"
              >
                Confirm
              </Button>
            </div>
            <p className="text-center">
              <Link to={forgotPassUrl()} className="text-sm text-center">
                Forgot your password?
              </Link>
            </p>
          </form>
        </div>
      </div>
    </HeroBgLayout>
  );
};
