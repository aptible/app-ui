import {
  type CreateTokenPayload,
  defaultAuthLoaderMeta,
  isOtpError,
  login,
  loginWebauthn,
} from "@app/auth";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useSelector,
} from "@app/react";
import { resetRedirectPath, selectRedirectPath } from "@app/redirect-path";
import { forgotPassUrl, homeUrl, signupUrl, ssoUrl } from "@app/routes";
import { selectIsUserAuthenticated } from "@app/token";
import { emailValidator, existValidtor } from "@app/validator";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useInvitation, useValidator } from "../hooks";
import { HeroBgLayout } from "../layouts";
import {
  AlreadyAuthenticatedBanner,
  Banner,
  BannerMessages,
  Button,
  ButtonLink,
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
  const isAuthenticated = useSelector(selectIsUserAuthenticated);
  const { invitation } = useInvitation(redirectPath);

  useEffect(() => {
    if (invitation.email === "") return;
    setEmail(invitation.email);
  }, [invitation.email]);

  const data = {
    username: email,
    password,
    otpToken,
  };
  // use query.name not query.key (this is important for webauthn!)
  const loader = useLoader(login);
  const meta = defaultAuthLoaderMeta(loader.meta);
  const webauthnAction = loginWebauthn({
    ...data,
    webauthn: meta.exception_context.u2f,
  });
  const webauthnLoader = useLoader(webauthnAction);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate(data)) return;
    dispatch(login(data));
  };

  useLoaderSuccess(loader, () => {
    navigate(redirectPath || homeUrl());
    dispatch(resetRedirectPath());
  });

  const otpError = isOtpError(meta.error);
  useEffect(() => {
    if (!otpError) {
      return;
    }

    setRequireOtp(true);
    dispatch(webauthnAction);
  }, [otpError]);

  const isOtpRequired = isOtpError(meta.error);

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
            <AlreadyAuthenticatedBanner />

            {invitation.id ? (
              <Banner variant="info">
                <strong>{invitation.inviterName}</strong> invited you to join{" "}
                <strong>{invitation.organizationName}</strong> on Aptible
              </Banner>
            ) : null}

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
                htmlFor="otp"
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
              disabled={isAuthenticated}
              type="submit"
              variant="primary"
              layout="block"
              size="lg"
            >
              Log In
            </Button>

            <div className="py-2">
              <hr />
            </div>

            <ButtonLink to={ssoUrl()} variant="white" layout="block" size="lg">
              Log In with SSO
            </ButtonLink>

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
