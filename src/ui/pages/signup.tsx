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
          </div>
        </div>
      </div>
    </div>
  );
};

export const SignupPage = () => {
  return <SignupPageForm />;
};
