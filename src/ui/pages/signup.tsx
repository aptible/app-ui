import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Link, useSearchParams } from "react-router-dom";

import { defaultAuthLoaderMeta, signup } from "@app/auth";
import { useLoader, useLoaderSuccess, useQuery } from "@app/fx";
import {
  fetchInvitation,
  selectInvitationById,
  selectInvitationRequest,
} from "@app/invitations";
import { resetRedirectPath, selectRedirectPath } from "@app/redirect-path";
import {
  acceptInvitationWithCodeUrl,
  homeUrl,
  loginUrl,
  verifyEmailRequestUrl,
} from "@app/routes";
import { AppState } from "@app/types";
import { CreateUserForm } from "@app/users";
import { emailValidator, existValidtor, passValidator } from "@app/validator";

import { useValidator } from "../hooks";
import { HeroBgLayout } from "../layouts";
import {
  Banner,
  BannerMessages,
  Button,
  CreateProjectFooter,
  FormGroup,
  Input,
  tokens,
} from "../shared";
import { selectIsUserAuthenticated } from "@app/token";

const validators = {
  name: (props: CreateUserForm) => existValidtor(props.name, "Name"),
  company: (props: CreateUserForm) => existValidtor(props.company, "Company"),
  email: (props: CreateUserForm) => emailValidator(props.email),
  pass: (props: CreateUserForm) => passValidator(props.password),
};

export const SignupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const queryEmail = params.get("email") || "";
  const challengeToken = params.get("token") || "";

  const redirectPath = useSelector(selectRedirectPath);
  const isAuthenticated = useSelector(selectIsUserAuthenticated);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState(queryEmail);
  const [password, setPassword] = useState("");
  const [errors, validate] = useValidator<CreateUserForm, typeof validators>(
    validators,
  );

  const invitationRequest = useSelector(selectInvitationRequest);
  useQuery(fetchInvitation({ id: invitationRequest.invitationId }));
  const invitation = useSelector((s: AppState) =>
    selectInvitationById(s, { id: invitationRequest.invitationId }),
  );

  useEffect(() => {
    if (invitation.email === "") return;
    setEmail(invitation.email);
  }, [invitation.email]);

  const data = {
    company,
    name,
    email,
    password,
    challenge_token: challengeToken,
  };
  const action = signup(data);
  const loader = useLoader(action);

  const onSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate(data)) return;
    dispatch(action);
  };

  useLoaderSuccess(loader, () => {
    if (invitationRequest.invitationId) {
      navigate(acceptInvitationWithCodeUrl(invitationRequest));
    } else {
      const meta = defaultAuthLoaderMeta(loader.meta);
      // if the api returns with a user.verified = true, skip email request page
      // this can happen in development when ENV['DISABLE_EMAIL_VERIFICATION']=1
      if (meta.verified) {
        navigate(redirectPath || homeUrl());
        dispatch(resetRedirectPath());
        return;
      }
      navigate(verifyEmailRequestUrl());
    }
  });

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
        <div className="bg-white py-8 px-10 shadow rounded-lg border border-black-100">
          <form className="space-y-4" onSubmit={onSubmitForm}>
            {isAuthenticated && !loader.isLoading ? (
              <Banner variant="info">
                You are already logged in.{" "}
                <Link to={homeUrl()}>Click here to go to the dashboard.</Link>
              </Banner>
            ) : null}

            <FormGroup
              label="Name"
              htmlFor="name"
              feedbackMessage={errors.name}
              feedbackVariant={errors.name ? "danger" : "info"}
            >
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                autoFocus={true}
                required={true}
                value={name}
                className="w-full"
                onChange={(e) => setName(e.target.value)}
              />
            </FormGroup>

            <FormGroup
              label="Company"
              htmlFor="company"
              feedbackMessage={errors.company}
              feedbackVariant={errors.company ? "danger" : "info"}
            >
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
                required={true}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
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

            <BannerMessages {...loader} />

            <div>
              <Button
                type="submit"
                layout="block"
                size="lg"
                isLoading={loader.isLoading}
                disabled={isAuthenticated}
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
