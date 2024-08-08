import { defaultAuthLoaderMeta, signup } from "@app/auth";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useSelector,
} from "@app/react";
import { resetRedirectPath, selectRedirectPath } from "@app/redirect-path";
import {
  homeUrl,
  loginUrl,
  teamAcceptInviteUrl,
  verifyEmailRequestUrl,
} from "@app/routes";
import { selectIsUserAuthenticated } from "@app/token";
import type { CreateUserForm } from "@app/users";
import {
  emailValidator,
  existValidator,
  nameValidator,
  passValidator,
  sanitizeInput,
} from "@app/validator";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Link, useSearchParams } from "react-router-dom";
import { useInvitation, useValidator } from "../hooks";
import { HeroBgView } from "../layouts";
import {
  AlreadyAuthenticatedBanner,
  AptibleLogo,
  Banner,
  BannerMessages,
  Button,
  FormGroup,
  Group,
  Input,
  tokens,
} from "../shared";

const validators = {
  name: (props: CreateUserForm) =>
    existValidator(props.name, "Name") || nameValidator(props.name),
  company: (props: CreateUserForm) => {
    if (props.challengeToken !== "") {
      return;
    }
    return (
      existValidator(props.company, "Company") || nameValidator(props.company)
    );
  },
  email: (props: CreateUserForm) => emailValidator(props.email),
  pass: (props: CreateUserForm) => passValidator(props.password),
};

const SignupMarketing = () => {
  return (
    <div className="bg-white/90 shadow p-12 lg:block hidden lg:w-[500px] h-fit min-h-screen">
      <div className="text-xl text-black font-bold">
        Try the platform hundreds of scaling engineering teams use to achieve
        enterprise best practices for their infrastructure
      </div>
      <div className="text-lg text-gold font-bold pt-5 pb-1">
        Control your Infrastructure
      </div>
      <p>
        Manage your entire infrastructure, optimize cloud spending, and prevent
        vendor lock-in.
      </p>
      <hr className="mt-5 mb-4" />
      <div className="text-lg text-gold font-bold pb-1">Ensure Reliability</div>
      <p>
        Aptible fully monitors your entire compute and data resources, and holds
        the pager 24x7 for your infrastructure.
      </p>
      <hr className="mt-5 mb-4" />
      <div className="text-lg text-gold font-bold pb-1">
        Achieve Best Practices
      </div>
      <p>
        Get the flexibility that scaling companies need: support non-HTTPS
        services; enforce fine-grained RBAC; comply with security frameworks;
        and scale to the limits of AWS for containers, disks, or backups.
      </p>
      <p className="text-md text-black pt-8 pb-4 text-center font-semibold">
        Companies that have scaled with Aptible
      </p>
      <img
        src="/customer-logo-cloud.png"
        className="text-center scale-90 pb-[200px]"
        aria-label="Customer Logos"
      />
    </div>
  );
};

const SignupFooter = () => {
  return (
    <>
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
        and <a href="https://www.aptible.com/legal/privacy">Privacy Policy</a>.
      </p>
    </>
  );
};

const SignupHeader = () => {
  return (
    <div className="mx-auto max-w-[570px] px-4 md:px-0">
      <Group>
        <div className="flex justify-center pt-[65px] pb-4">
          <AptibleLogo width={160} />
        </div>
        <div className="flex text-center items-center justify-center">
          <div>
            <p>
              Control your AWS resources, guarantee uptime, and achieve
              enterprise best practices without building your own internal
              developer platform.
            </p>
            <h1 className={`${tokens.type.h1} text-center pt-4`}>
              Get started for free
            </h1>
          </div>
        </div>
      </Group>
    </div>
  );
};

export const SignupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const queryEmail = params.get("email") || "";
  const redirectPath = useSelector(selectRedirectPath);
  const isAuthenticated = useSelector(selectIsUserAuthenticated);
  const { invitation, inviteId, code } = useInvitation(redirectPath);

  useEffect(() => {
    if (invitation.email === "") return;
    setEmail(invitation.email);
  }, [invitation.email]);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState(queryEmail);
  const [password, setPassword] = useState("");
  const [errors, validate] = useValidator<CreateUserForm, typeof validators>(
    validators,
  );

  const data = {
    company,
    name,
    email,
    password,
    challengeToken: code,
  };
  const action = signup(data);
  const loader = useLoader(action);

  const onSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate(data)) return;
    dispatch(action);
  };

  useLoaderSuccess(loader, () => {
    if (inviteId) {
      navigate(teamAcceptInviteUrl(inviteId, code));
      dispatch(resetRedirectPath());
      return;
    }

    const meta = defaultAuthLoaderMeta(loader.meta);
    // if the api returns with a user.verified = true, skip email request page
    // this can happen in development when ENV['DISABLE_EMAIL_VERIFICATION']=1
    if (meta.verified) {
      navigate(redirectPath || homeUrl());
      dispatch(resetRedirectPath());
      return;
    }
    navigate(verifyEmailRequestUrl());
  });

  return (
    <HeroBgView className="flex gap-6">
      <SignupMarketing />

      <div className="flex-1 mx-auto max-w-[500px]">
        <Group variant="vertical">
          <SignupHeader />

          <div className="mx-auto max-w-[500px] bg-white py-8 px-10 shadow rounded-lg border border-black-100">
            <form className="space-y-4" onSubmit={onSubmitForm}>
              <AlreadyAuthenticatedBanner />

              {invitation.id ? (
                <Banner variant="info">
                  <strong>{invitation.inviterName}</strong> invited you to join{" "}
                  <strong>{invitation.organizationName}</strong> on Aptible
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
                  required={true}
                  value={name}
                  className="w-full"
                  onChange={(e) => setName(sanitizeInput(e.target.value))}
                />
              </FormGroup>

              {inviteId ? null : (
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
                    onChange={(e) => setCompany(sanitizeInput(e.target.value))}
                  />
                </FormGroup>
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
                  required={true}
                  value={email}
                  onChange={(e) => setEmail(sanitizeInput(e.target.value))}
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

              <SignupFooter />
            </form>
          </div>
        </Group>
      </div>
    </HeroBgView>
  );
};
