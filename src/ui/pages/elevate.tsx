import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Link, useSearchParams } from "react-router-dom";

import {
  defaultAuthLoaderMeta,
  elevate,
  elevateWebauthn,
  isOtpError,
} from "@app/auth";
import { useLoader, useLoaderSuccess } from "@app/fx";
import { resetRedirectPath } from "@app/redirect-path";
import { forgotPassUrl, homeUrl } from "@app/routes";
import { selectCurrentUser } from "@app/users";

import { HeroBgLayout } from "../layouts";
import {
  BannerMessages,
  Button,
  ExternalLink,
  FormGroup,
  Input,
  tokens,
} from "../shared";

export const ElevatePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [params] = useSearchParams();
  const redirect = params.get("redirect");

  const [otpToken, setOtpToken] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [requireOtp, setRequireOtp] = useState<boolean>(false);

  const data = {
    username: user.email,
    password,
    otpToken,
  };
  // use query.name not query.key (this is important for webauthn!)
  const loader = useLoader(elevate);
  const meta = defaultAuthLoaderMeta(loader.meta);
  const webauthnAction = elevateWebauthn({
    ...data,
    webauthn: meta.exception_context.u2f,
  });
  const webauthnLoader = useLoader(webauthnAction);

  useLoaderSuccess(loader, () => {
    navigate(redirect || homeUrl());
    dispatch(resetRedirectPath());
  });

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(elevate(data));
  };

  const isOtpRequired = isOtpError(meta.error);
  useEffect(() => {
    if (!isOtpRequired) {
      return;
    }

    setRequireOtp(true);
    dispatch(webauthnAction);
  }, [isOtpRequired]);

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
            <FormGroup label="Email" htmlFor="email">
              <Input
                id="email"
                name="email"
                type="email"
                disabled={true}
                value={user.email}
                autoComplete="username"
                autoFocus={true}
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
                htmlFor="otp"
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
                  id="otp"
                  name="otp"
                  type="number"
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.currentTarget.value)}
                  autoComplete="off"
                  autoFocus
                />
              </FormGroup>
            ) : null}

            <div className="my-2 flex flex-col gap-2">
              <BannerMessages {...webauthnLoader} />

              {isOtpRequired ? (
                <BannerMessages
                  isSuccess={false}
                  isError={false}
                  isWarning
                  message="You must enter your 2FA token to continue"
                />
              ) : (
                <BannerMessages {...loader} />
              )}
            </div>

            <Button
              isLoading={loader.isLoading}
              type="submit"
              layout="block"
              size="lg"
            >
              Confirm
            </Button>

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
