import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useLoaderSuccess } from "saga-query/react";

import {
  login,
  loginWebauthn,
  selectAuthLoader,
  selectIsOtpError,
} from "@app/auth";
import {
  fetchInvitation,
  selectInvitationRequest,
  selectPendingInvitation,
} from "@app/invitations";
import {
  acceptInvitationWithCodeUrl,
  forgotPassUrl,
  homeUrl,
  signupUrl,
} from "@app/routes";
import { validEmail } from "@app/string-utils";

import { HeroBgLayout } from "../layouts";
import {
  BannerMessages,
  Button,
  ExternalLink,
  FormGroup,
  Input,
  tokens,
} from "../shared";
import { resetRedirectPath, selectRedirectPath } from "@app/redirect-path";

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [otpToken, setOtpToken] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [requireOtp, setRequireOtp] = useState<boolean>(false);
  const loader = useSelector(selectAuthLoader);
  const redirectPath = useSelector(selectRedirectPath);

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
      navigate(redirectPath || homeUrl());
      dispatch(resetRedirectPath());
    }
  });

  const currentEmail = invitation ? invitation.email : email;
  const loginPayload = {
    username: currentEmail,
    password,
    otpToken,
    makeCurrent: true,
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(login(loginPayload));
  };

  const emailErrorMessage =
    currentEmail === "" || validEmail(currentEmail)
      ? null
      : "Not a valid email";

  const isOtpError = useSelector(selectIsOtpError);
  useEffect(() => {
    if (isOtpError) {
      setRequireOtp(true);
      dispatch(
        loginWebauthn({
          ...loginPayload,
          webauthn: loader.meta.exception_context.u2f?.payload,
        }),
      );
    }
  }, [isOtpError]);

  const isOtpRequired = loader.message === "OtpTokenRequired";
  return (
    <HeroBgLayout width={500}>
      <h1 className={`${tokens.type.h1} text-center`}>Log In</h1>
      <div className="flex text-center items-center justify-center mt-4">
        <div className="max-w-2xl">
          <p>
            Don't have an account?{" "}
            <Link to={signupUrl()} className="font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={onSubmit}>
            {isOtpRequired ? (
              <BannerMessages
                className="my-2"
                isSuccess={false}
                isError={false}
                isWarning
                message="You must enter your 2FA token to continue"
              />
            ) : (
              <BannerMessages className="my-2" {...loader} />
            )}

            <FormGroup
              label="Email"
              htmlFor="email"
              feedbackVariant={emailErrorMessage ? "danger" : "info"}
              feedbackMessage={emailErrorMessage}
            >
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus={true}
                required={true}
                disabled={!!invitation}
                value={invitation ? invitation.email : email}
                className="w-full"
                onChange={(e) => setEmail(e.target.value)}
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
                disabled={loader.isLoading || !(email && password)}
                type="submit"
                variant="primary"
                layout="block"
                size="lg"
              >
                Log In
              </Button>
            </div>
            <p className="text-center">
              <Link to={forgotPassUrl()} className="text-sm text-center">
                Forgot your password?
              </Link>
            </p>
            <p className="mt-4 text-center text-sm text-gray-600">
              By submitting this form, I confirm that I have read and agree to
              Aptible's{" "}
              <a href="https://www.aptible.com/legal/terms-of-service">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="https://www.aptible.com/legal/privacy">Privacy Policy</a>
              .
            </p>
          </form>
        </div>
      </div>
    </HeroBgLayout>
  );
};
