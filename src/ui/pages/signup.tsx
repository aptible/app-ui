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
  AptibleLogo,
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
    <HeroBgLayout width={500} showLogo={false}>
      <div className="absolute top-0 left-0 h-auto min-h-[100vh] bg-white/90 shadow p-16 lg:block hidden w-[40vw] lg:px-[5%] px-[32px]">
        <div className="text-xl text-black font-bold">
          Launch, grow, and scale your app without worrying about infrastructure
        </div>
        <div className="text-lg text-gold font-bold pt-5 pb-1">Launch</div>
        <p>Get up and running without any work or config.</p>
        <hr className="mt-5 mb-4" />
        <div className="text-lg text-gold font-bold pb-1">Grow</div>
        <p>Aptible handles all the infrastructure operations.</p>
        <hr className="mt-5 mb-4" />
        <div className="text-lg text-gold font-bold pb-1">Scale</div>
        <p>
          Enterprise requirements such as performance, security, and reliability
          are baked in from day one.
        </p>
        <p className="text-md text-black pt-8 pb-4 text-center font-semibold">
          Companies that have scaled with Aptible
        </p>
        <img
          src="/customer-logo-cloud.png"
          className="text-center scale-90"
          aria-label="Customer Logos"
        />
        <div className="pt-8 lg:px-0 px-10">
          <CreateProjectFooter />
        </div>
      </div>
      <div className="absolute lg:top-[30px] md:top-0 top-0 left-0  lg:w-[60vw] w-[100vw] lg:ml-[40vw] ml-auto lg:px-[5%] md:px-[32px] px-auto">
        <div className="flex flex-col justify-center items-center md:w-[500px] md:ml-[50%] md:left-[-250px] w-full ml-none left-0 relative">
          <div className="flex justify-center pt-10 pb-8">
            <AptibleLogo width={160} />
          </div>
          <div className="flex text-center items-center justify-center">
            <div className="max-w-2xl">
              <p className="lg:px-0 px-8 lg:min-w-[570px] min-w-full">
                Our web app and API hosting platform automates the work of
                provisioning, managing, and scaling infrastructure, so you can
                focus on what actually matters: <strong>your product.</strong>
              </p>
              <h1 className={`${tokens.type.h1} text-center pt-8`}>
                Get started for free
              </h1>
            </div>
          </div>
          <div className="mt-6">
            <div className="bg-white py-8 px-10 shadow rounded-lg border border-black-100">
              <form className="space-y-4" onSubmit={onSubmitForm}>
                {isAuthenticated ? (
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
                  By submitting this form, I confirm that I have read and agree
                  to Aptible's{" "}
                  <a href="https://www.aptible.com/legal/terms-of-service">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="https://www.aptible.com/legal/privacy">
                    Privacy Policy
                  </a>
                  .
                </p>
              </form>
            </div>
          </div>
          <div className="mt-6 px-10 lg:hidden block pb-10 w-full">
            <CreateProjectFooter />
          </div>
        </div>
      </div>
    </HeroBgLayout>
  );
};
