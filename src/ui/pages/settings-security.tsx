import { fetchEmailVerificationPending, revokeAllTokens } from "@app/auth";
import { prettyDateTime } from "@app/date";
import { useCache, useLoader, useLoaderSuccess } from "@app/fx";
import {
  addSecurityKeyUrl,
  otpRecoveryCodesUrl,
  otpSetupUrl,
} from "@app/routes";
import { HalEmbedded } from "@app/types";
import {
  selectCurrentUserId,
  updateEmail,
  updateSecurityUser,
} from "@app/users";
import { emailValidator } from "@app/validator";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useCurrentUser } from "../hooks";
import {
  Banner,
  BannerMessages,
  Box,
  BoxGroup,
  Button,
  FormGroup,
  Group,
  Input,
  Loading,
  Tooltip,
  tokens,
} from "../shared";

interface SectionProps {
  children: React.ReactNode;
  title: string;
}

const Section = ({ children, title }: SectionProps) => {
  return (
    <Box>
      <div className={"text-lg text-gray-500 mb-4"}>{title}</div>
      <div>{children}</div>
    </Box>
  );
};

const ChangePassword = () => {
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const action = updateSecurityUser({
    type: "update-password",
    userId,
    password: pass,
  });
  const loader = useLoader(updateSecurityUser);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) {
      return;
    }

    if (pass !== confirmPass) {
      setError("Passwords do not match");
      return;
    }

    dispatch(action);
  };

  useLoaderSuccess(loader, () => {
    setPass("");
    setConfirmPass("");
    setError("");
  });

  const groupVariant = error ? "danger" : "info";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Group size="sm">
        <BannerMessages {...loader} />

        <FormGroup
          label="New Password"
          htmlFor="input-password"
          feedbackVariant={groupVariant}
        >
          <Input
            name="password"
            type="password"
            autoComplete="new-password"
            value={pass}
            onChange={(e) => setPass(e.currentTarget.value)}
            data-testid="input-password"
            className="border-black border"
          />
        </FormGroup>
        <FormGroup
          label="Confirm New Password"
          htmlFor="input-password"
          feedbackVariant={groupVariant}
          feedbackMessage={error}
        >
          <Input
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.currentTarget.value)}
            data-testid="input-confirm-password"
            className="border-black border"
          />
        </FormGroup>

        <Button
          className="w-fit"
          type="submit"
          disabled={loader.isLoading}
          isLoading={loader.isLoading}
        >
          Change Password
        </Button>
      </Group>
    </form>
  );
};

interface EmailVerificationChallenge {
  email: string;
  expires_at: string;
  id: string;
}

const ChangeEmail = () => {
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);
  const [email, setEmail] = useState<string>("");
  const loader = useLoader(updateEmail);
  const [error, setError] = useState("");
  const pending = useCache<
    HalEmbedded<{ email_verification_challenges: EmailVerificationChallenge[] }>
  >(fetchEmailVerificationPending({ userId }));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;
    const errorMsg = emailValidator(email);
    if (errorMsg) {
      setError(errorMsg);
      return;
    }
    dispatch(updateEmail({ userId, email }));
  };

  useLoaderSuccess(loader, () => {
    setError("");
    setEmail("");
  });

  return (
    <Group>
      <form onSubmit={onSubmit}>
        <Group>
          <BannerMessages {...loader} />

          <FormGroup
            label="Email"
            htmlFor="input-email"
            feedbackVariant={error ? "danger" : "info"}
            feedbackMessage={error}
          >
            <Input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              autoComplete="username"
              data-testid="input-email"
              id="input-email"
            />
          </FormGroup>

          <Button
            className="w-fit"
            type="submit"
            disabled={email === ""}
            isLoading={loader.isLoading}
          >
            Send Verification Email
          </Button>
        </Group>
      </form>

      <hr />

      <Group size="sm">
        <h4 className={tokens.type.h4}>Pending Requests</h4>
        {pending.isInitialLoading ? <Loading /> : null}
        {pending.data?._embedded?.email_verification_challenges.map((em) => {
          return (
            <div key={em.id} className="flex justify-between items-center">
              <Tooltip text={`Expires ${prettyDateTime(em.expires_at)}`}>
                <span>{em.email}</span>
              </Tooltip>
              <Button size="xs" requireConfirm variant="delete">
                revoke
              </Button>
            </div>
          );
        })}
      </Group>
    </Group>
  );
};

const MultiFactor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, loader] = useCurrentUser();
  const disable = () => {
    dispatch(
      updateSecurityUser({ type: "otp", userId: user.id, otp_enabled: false }),
    );
  };

  const btns = user.otpEnabled ? (
    <Group>
      <Button className="w-fit" variant="delete" onClick={disable}>
        Disable 2FA
      </Button>
      <Link to={otpRecoveryCodesUrl()}>Download backup codes</Link>
    </Group>
  ) : (
    <Button className="w-fit" onClick={() => navigate(otpSetupUrl())}>
      Configure 2FA
    </Button>
  );
  const content = loader.isLoading ? <Loading /> : btns;

  return (
    <div className="flex flex-col gap-4">
      <ul className="mb-2">
        <li>
          Download your backup codes if you haven&apos;t done so yet. 2FA does
          not apply to git push operations.
        </li>
      </ul>

      {content}
    </div>
  );
};

const SecurityKeys = () => {
  const [user, loader] = useCurrentUser();
  if (loader.isLoading) {
    return <Loading />;
  }

  return (
    <div>
      {user.otpEnabled ? (
        <Group>
          <div>
            The following Security Keys are associated with your account and can
            be used to log in:
          </div>
          <Link to={addSecurityKeyUrl()}>Add a new Security Key</Link>
        </Group>
      ) : (
        <Banner variant="info">
          In order to add a hardware security key, you must set up 2FA
          authentication first.
        </Banner>
      )}
    </div>
  );
};

const LogOut = () => {
  const dispatch = useDispatch();
  const loader = useLoader(revokeAllTokens);
  const confirmLogout = () => dispatch(revokeAllTokens());

  return (
    <Group>
      <div>
        This action will log out all <strong>other</strong> sessions and cannot
        be undone.
      </div>

      {loader.isError ? (
        <Banner variant="error">{loader.message}</Banner>
      ) : null}

      <div>
        <Button variant="delete" requireConfirm onClick={confirmLogout}>
          Log out all sessions
        </Button>
      </div>
    </Group>
  );
};

export const SecuritySettingsPage = () => {
  return (
    <BoxGroup>
      <h2 className={tokens.type.h2}>Security Settings</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Change Password">
          <ChangePassword />
        </Section>
        <Section title="Change Email">
          <ChangeEmail />
        </Section>
      </div>

      <Section title="OTP">
        <MultiFactor />
      </Section>
      <Section title="Security Keys">
        <SecurityKeys />
      </Section>
      <Section title="Log out all sessions">
        <LogOut />
      </Section>
    </BoxGroup>
  );
};
