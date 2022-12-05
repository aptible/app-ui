import { useState, useEffect } from "react";
import qs from "query-string";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useLoaderSuccess } from "saga-query/react";
import { Link } from "react-router-dom";

import { validatePasswordComplexity, signup } from "@app/auth";
import {
  selectInvitationRequest,
  selectPendingInvitation,
  fetchInvitation,
} from "@app/invitations";
import {
  acceptInvitationWithCodeUrl,
  verifyEmailRequestUrl,
  loginUrl,
} from "@app/routes";
import { selectAuthLoader } from "@app/auth";
import { validEmail } from "@app/string-utils";

import {
  Input,
  FormGroup,
  Button,
  AptibleLogo,
  Alert,
  LoggedInBanner,
} from "../shared";

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

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>(getQueryStringValue("email"));
  const [password, setPassword] = useState<string>("");
  const [company, setCompany] = useState("");

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

  const emailErrorMessage =
    currentEmail === "" || validEmail(currentEmail)
      ? null
      : "Not a valid email";

  const passwordErrors = validatePasswordComplexity(password);
  const passwordErrorMessage =
    password !== "" && passwordErrors.length > 0
      ? `Password ${passwordErrors.join(", ")}`
      : "";
  const disableSave =
    name === "" ||
    currentEmail === "" ||
    password === "" ||
    !!emailErrorMessage ||
    passwordErrors.length > 0;

  const onSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disableSave) {
      return;
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
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
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
              {emailErrorMessage || passwordErrorMessage ? (
                <div className="mb-8">
                  <Alert title="Something went wrong" variant="danger">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>{emailErrorMessage}</li>
                      <li>{passwordErrorMessage}</li>
                    </ul>
                  </Alert>
                </div>
              ) : null}

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

              <FormGroup label="Company" htmlFor="company">
                <Input
                  id="company"
                  name="company"
                  type="text"
                  autoComplete="company"
                  required={true}
                  value={company}
                  className="w-full"
                  onChange={(e) => setCompany(e.target.value)}
                />
              </FormGroup>

              <FormGroup
                label="Your work email"
                htmlFor="email"
                feedbackVariant={emailErrorMessage ? "danger" : "info"}
                feedbackMessage={emailErrorMessage}
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
                feedbackVariant={passwordErrorMessage ? "danger" : "info"}
                feedbackMessage={passwordErrorMessage}
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

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  layout="block"
                  size="lg"
                  disabled={disableSave}
                >
                  Create Account
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div>
                  <a
                    href="/"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Sign in with Twitter</span>
                    <svg
                      className="w-5 h-5"
                      aria-hidden="true"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                </div>

                <div>
                  <a
                    href="/"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Sign in with GitHub</span>
                    <svg
                      className="w-5 h-5"
                      aria-hidden="true"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SignupPage = () => {
  return <SignupPageForm />;
};
