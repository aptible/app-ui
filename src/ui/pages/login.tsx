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
  RESET_REQUEST_PASSWORD_PATH,
  acceptInvitationWithCodeUrl,
  homeUrl,
  signupUrl,
} from "@app/routes";
import { validEmail } from "@app/string-utils";

import {
  Alert,
  AptibleLogo,
  Button,
  ExternalLink,
  FormGroup,
  IconAlertCircle,
  Input,
  LoggedInBanner,
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

  return (
    <div>
      <LoggedInBanner />

      <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center justify-center">
            <AptibleLogo />
          </div>
          <h2 className="mt-6 text-center text-3xl font-semibold text-gray-900">
            Log in to Aptible
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to={signupUrl()}
              className="font-medium text-emerald-600 hover:text-gray-500"
            >
              Sign up
            </Link>
          </p>
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
                        <IconAlertCircle />
                      </div>
                    }
                  >
                    <ul className="list-disc pl-5 space-y-1">
                      <li>{loader.message}</li>
                    </ul>
                  </Alert>
                </div>
              ) : null}

              <FormGroup
                label="Email address"
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

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    to={RESET_REQUEST_PASSWORD_PATH}
                    className="font-medium text-emerald-600 hover:text-gray-500"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <Button
                  isLoading={loader.isLoading}
                  disabled={loader.isLoading}
                  type="submit"
                  variant="primary"
                  layout="block"
                  size="lg"
                >
                  Sign in
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
