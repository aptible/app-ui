import qs from "query-string";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useLoaderSuccess } from "saga-query/react";

import { signup, validatePasswordComplexity } from "@app/auth";
import { selectAuthLoader } from "@app/auth";
import {
  fetchInvitation,
  selectInvitationRequest,
  selectPendingInvitation,
} from "@app/invitations";
import {
  acceptInvitationWithCodeUrl,
  homeUrl,
  loginUrl,
  verifyEmailRequestUrl,
} from "@app/routes";
import { validEmail } from "@app/string-utils";

import {
  AptibleLogo,
  BannerMessages,
  Button,
  FormGroup,
  Input,
  LoggedInBanner,
} from "../shared";
import { resetRedirectPath, selectRedirectPath } from "@app/redirect-path";

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

const SignupPageForm = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const getQueryStringValue = createQueryStringValue(location.search);
  const redirectPath = useSelector(selectRedirectPath);

  const [name, setName] = useState("");
  const [email, setEmail] = useState(getQueryStringValue("email"));
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passError, setPassError] = useState("");

  const loader = useSelector(selectAuthLoader);
  const { isLoading } = loader;

  const invitationRequest = useSelector(selectInvitationRequest);
  const invitation = useSelector(selectPendingInvitation);

  const [challengeToken] = useState<string>(getQueryStringValue("token"));

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
        name,
        email: invitation ? invitation.email : email,
        password,
        challenge_token: challengeToken,
      }),
    );
  };

  useLoaderSuccess(loader, () => {
    if (invitationRequest.invitationId) {
      navigate(acceptInvitationWithCodeUrl(invitationRequest));
    } else {
      // if the api returns with a user.verified = true, skip email request page
      // this can happen in development when ENV['DISABLE_EMAIL_VERIFICATION']=1
      if (loader.meta.verified) {
        navigate(redirectPath || homeUrl());
        dispatch(resetRedirectPath());
        return;
      }
      navigate(verifyEmailRequestUrl());
    }
  });

  return (
    <div>
      <LoggedInBanner />

      <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center justify-center">
            <AptibleLogo />
          </div>
          <h2 className="mt-6 text-center text-3xl font-semibold text-gray-900">
            Create your Aptible Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to={loginUrl()}
              className="font-medium text-emerald-600 hover:text-emerald-500"
            >
              Log In
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={onSubmitForm}>
              <FormGroup label="Your name" htmlFor="name">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required={true}
                  value={name}
                  disabled={isLoading}
                  autoFocus={true}
                  className="w-full"
                  onChange={(e) => setName(e.target.value)}
                />
              </FormGroup>

              <FormGroup
                label="Your email"
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

              {loader.isError ? <BannerMessages {...loader} /> : null}
              <div>
                <Button
                  type="submit"
                  variant="primary"
                  layout="block"
                  size="lg"
                  disabled={disableSave}
                  isLoading={loader.isLoading}
                >
                  Create Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SignupPage = () => {
  return <SignupPageForm />;
};
