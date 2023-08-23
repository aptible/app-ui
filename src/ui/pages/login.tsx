import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

import {
  CreateTokenPayload,
  isOtpError,
  login,
  loginWebauthn,
} from "@app/auth";
import { useLoader, useLoaderSuccess, useQuery } from "@app/fx";
import {
  fetchInvitation,
  selectInvitationById,
  selectInvitationRequest,
} from "@app/invitations";
import { resetRedirectPath, selectRedirectPath } from "@app/redirect-path";
import {
  acceptInvitationWithCodeUrl,
  forgotPassUrl,
  homeUrl,
  signupUrl,
} from "@app/routes";
import { AppState } from "@app/types";
import { emailValidator, existValidtor } from "@app/validator";

import { useValidator } from "../hooks";
import { HeroBgLayout } from "../layouts";
import {
  BannerMessages,
  Button,
  ExternalLink,
  FormGroup,
  Input,
  tokens,
} from "../shared";

const validators = {
  email: (props: CreateTokenPayload) => emailValidator(props.username),
  pass: (props: CreateTokenPayload) =>
    existValidtor(props.password, "Password"),
};

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [otpToken, setOtpToken] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [requireOtp, setRequireOtp] = useState<boolean>(false);
  const redirectPath = useSelector(selectRedirectPath);
  const [errors, validate] = useValidator<
    CreateTokenPayload,
    typeof validators
  >(validators);

  const invitationRequest = useSelector(selectInvitationRequest);
  const invitation = useSelector((s: AppState) =>
    selectInvitationById(s, { id: invitationRequest.invitationId }),
  );
  useQuery(fetchInvitation({ id: invitationRequest.invitationId }));

  const data = {
    username: email,
    password,
    otpToken,
    makeCurrent: true,
  };
  const action = login(data);
  const loader = useLoader(action);
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate(data)) return;
    dispatch(action);
  };

  useLoaderSuccess(loader, () => {
    if (invitationRequest.invitationId) {
      navigate(acceptInvitationWithCodeUrl(invitationRequest));
    } else {
      navigate(redirectPath || homeUrl());
      dispatch(resetRedirectPath());
    }
  });

  useEffect(() => {
    if (invitation.email === "") return;
    setEmail(invitation.email);
  }, [invitation.email]);

  const otpError = isOtpError(loader.meta.error);
  useEffect(() => {
    if (!otpError) {
      return;
    }

    setRequireOtp(true);
    dispatch(
      loginWebauthn({
        ...data,
        webauthn: loader.meta.exception_context.u2f?.payload,
      }),
    );
  }, [otpError]);

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
        <div className="bg-white py-8 px-10 shadow rounded-lg border border-black-100">
          <form className="space-y-4" onSubmit={onSubmit}>
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
              feedbackMessage={errors.email}
              feedbackVariant={errors.email ? "danger" : "info"}
            >
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus={true}
                required={true}
                disabled={invitation.id !== ""}
                value={email}
                className="w-full"
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormGroup>

            <FormGroup
              label="Password"
              htmlFor="password"
              feedbackMessage={errors.pass}
              feedbackVariant={errors.pass ? "danger" : "info"}
            >
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
                    Read our 2FA{" "}
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

            <Button
              isLoading={loader.isLoading}
              type="submit"
              variant="primary"
              layout="block"
              size="lg"
            >
              Log In
            </Button>

            <p className="text-center">
              <Link to={forgotPassUrl()} className="text-sm text-center">
                Forgot your password?
              </Link>
            </p>

            <p className="mt-4 text-center text-sm text-gray-600">
              By submitting this form, I confirm that I have read and agree to
              Aptible's{" "}
              <ExternalLink
                href="https://www.aptible.com/legal/terms-of-service"
                variant="info"
              >
                Terms of Service
              </ExternalLink>{" "}
              and{" "}
              <ExternalLink
                href="https://www.aptible.com/legal/privacy"
                variant="info"
              >
                Privacy Policy
              </ExternalLink>
              .
            </p>
          </form>
        </div>
      </div>
    </HeroBgLayout>
  );
};
