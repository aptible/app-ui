import qs from "query-string";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useLoader, useLoaderSuccess } from "saga-query/react";

import { HeroBgLayout } from "../layouts";
import {
  BannerMessages,
  Button,
  CreateProjectFooter,
  FormGroup,
  Input,
  tokens,
} from "../shared";
import {
  fetchCurrentToken,
  selectAuthLoader,
  signup,
  validatePasswordComplexity,
} from "@app/auth";
import {
  fetchInvitation,
  selectInvitationRequest,
  selectPendingInvitation,
} from "@app/invitations";
import { resetRedirectPath, selectRedirectPath } from "@app/redirect-path";
import {
  acceptInvitationWithCodeUrl,
  homeUrl,
  loginUrl,
  verifyEmailRequestUrl,
} from "@app/routes";
import { validEmail } from "@app/string-utils";
import { selectIsUserAuthenticated } from "@app/token";

const createQueryStringValue =
  (queryString: string) => (key: string): string => {
    const values = qs.parse(queryString);
    const returnValue = values[key];

    if (returnValue && Array.isArray(returnValue)) {
      const [value] = returnValue;
      return value || "";
    }

    return returnValue || "";
  };

export const SignupPage = () => {
  const fetchTokenLoader = useLoader(fetchCurrentToken);
  const fetchSignupLoader = useSelector(selectAuthLoader);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const getQueryStringValue = createQueryStringValue(location.search);
  const redirectPath = useSelector(selectRedirectPath);
  const isAuthenticated = useSelector(selectIsUserAuthenticated);
  const { isLoading } = fetchSignupLoader;

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState(getQueryStringValue("email"));
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passError, setPassError] = useState("");

  const invitationRequest = useSelector(selectInvitationRequest);
  const invitation = useSelector(selectPendingInvitation);

  const [challengeToken] = useState<string>(getQueryStringValue("token"));

  useEffect(() => {
    if (fetchSignupLoader.isLoading) {
      return;
    }

    if (isAuthenticated) {
      navigate(homeUrl());
    }
  }, [fetchSignupLoader.isLoading, isAuthenticated]);

  useEffect(() => {
    if (!invitation && invitationRequest.invitationId) {
      dispatch(fetchInvitation({ id: invitationRequest.invitationId }));
    }
  }, [invitationRequest.invitationId]);

  const currentEmail = invitation ? invitation.email : email;

  const disableSave = name === "" || currentEmail === "" || password === "";

  const onSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disableSave) {
      return;
    }

    if (!validEmail(email)) {
      setEmailError("Not a valid email");
      return;
    } else {
      setEmailError("");
    }

    const passwordErrors = validatePasswordComplexity(password);
    const passwordErrorMessage =
      password !== "" && passwordErrors.length > 0
        ? `Password ${passwordErrors.join(", ")}`
        : "";
    if (passwordErrorMessage) {
      setPassError(passwordErrorMessage);
      return;
    } else {
      setPassError("");
    }

    dispatch(
      signup({
        company,
        name,
        email: invitation ? invitation.email : email,
        password,
        challenge_token: challengeToken,
      }),
    );
  };

  useLoaderSuccess(fetchSignupLoader, () => {
    if (invitationRequest.invitationId) {
      navigate(acceptInvitationWithCodeUrl(invitationRequest));
    } else {
      // if the api returns with a user.verified = true, skip email request page
      // this can happen in development when ENV['DISABLE_EMAIL_VERIFICATION']=1
      if (fetchSignupLoader.meta.verified) {
        navigate(redirectPath || homeUrl());
        dispatch(resetRedirectPath());
        return;
      }
      navigate(verifyEmailRequestUrl());
    }
  });

  // presentError - this value is set because in specific scenarios, we do not need the
  // middleware error message presented - namely on Unauthorized checks, as we do a
  // validation of the current token to see if a user is loaded. for all other
  const presentError =
    fetchTokenLoader.isError && fetchTokenLoader.message !== "Unauthorized";

  return (
    <HeroBgLayout width={500}>
      <h1 className={`${tokens.type.h1} text-center`}>Get started for free</h1>
      <div className="flex text-center items-center justify-center mt-4">
        <div className="max-w-2xl">
          <p>
            Aptible's PaaS automates the work of provisioning, managing, and
            scaling infrastructure, so you can focus on what matters:{" "}
            <strong>your product.</strong>
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-white py-6 px-6 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={onSubmitForm}>
            <FormGroup label="Name" htmlFor="name">
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                autoFocus={true}
                required={true}
                value={name}
                disabled={isLoading}
                className="w-full"
                onChange={(e) => setName(e.target.value)}
              />
            </FormGroup>

            <FormGroup label="Company" htmlFor="company">
              <Input
                id="company"
                name="company"
                type="text"
                autoComplete="company"
                required={true}
                value={company}
                disabled={isLoading}
                className="w-full"
                onChange={(e) => setCompany(e.target.value)}
              />
            </FormGroup>

            <FormGroup
              label="Email"
              htmlFor="email"
              feedbackVariant={emailError ? "danger" : "info"}
              feedbackMessage={emailError}
            >
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required={true}
                disabled={isLoading}
                value={invitation ? invitation.email : email}
                className="w-full"
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormGroup>

            <FormGroup
              label="Password"
              htmlFor="password"
              feedbackVariant={passError ? "danger" : "info"}
              feedbackMessage={passError}
            >
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required={true}
                value={password}
                className="w-full"
                disabled={isLoading}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormGroup>

            {presentError ? <BannerMessages {...fetchTokenLoader} /> : null}
            <BannerMessages {...fetchSignupLoader} />
            <div>
              <Button
                type="submit"
                variant="primary"
                layout="block"
                size="lg"
                disabled={disableSave}
                isLoading={fetchTokenLoader.isLoading}
              >
                Create Account
              </Button>
            </div>
            <p className="mt-4 text-center text-sm text-gray-600">
              If you already have an account, you can{" "}
              <Link to={loginUrl()} className="font-medium">
                log in here
              </Link>
              .
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
      <div className="mt-6">
        <CreateProjectFooter />
      </div>
    </HeroBgLayout>
  );
};
