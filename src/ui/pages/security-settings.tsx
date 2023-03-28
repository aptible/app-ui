import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useLoader } from "saga-query/react";

import { revokeAllTokens } from "@app/auth";
import {
  addSecurityKeyUrl,
  otpRecoveryCodesUrl,
  otpSetupUrl,
} from "@app/routes";
import { validEmail } from "@app/string-utils";
import { selectCurrentUserId, updateEmail, updateUser } from "@app/users";

import { useCurrentUser } from "../hooks";
import {
  Banner,
  BannerMessages,
  Button,
  FormGroup,
  Input,
  Loading,
} from "../shared";

interface SectionProps {
  children: React.ReactNode;
  title: string;
}

const Section = ({ children, title }: SectionProps) => {
  return (
    <div className="bg-grey border rounded p-4 my-4">
      <h2>{title}</h2>
      <div className="my-4">{children}</div>
    </div>
  );
};

const ChangePassword = () => {
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);
  const loader = useLoader(updateUser);

  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) {
      return;
    }

    if (pass !== confirmPass) {
      setError("passwords do not match");
      return;
    }

    dispatch(updateUser({ type: "update-password", userId, password: pass }));
  };

  const groupVariant = error ? "danger" : "info";

  return (
    <form onSubmit={onSubmit}>
      <FormGroup
        label="New Password"
        htmlFor="input-password"
        feedbackVariant={groupVariant}
      >
        <Input
          name="password"
          type="password"
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
      >
        <Input
          name="config-password"
          type="password"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.currentTarget.value)}
          data-testid="input-confirm-password"
          className="border-black border"
        />
        <div>{error}</div>
      </FormGroup>
      <Button
        type="submit"
        disabled={loader.isLoading}
        isLoading={loader.isLoading}
      >
        Change Password
      </Button>
      <BannerMessages {...loader} />
    </form>
  );
};

const MultiFactor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, user } = useCurrentUser();
  const disable = () => {
    dispatch(updateUser({ type: "otp", userId: user.id, otp_enabled: false }));
  };

  const btns = user.otpEnabled ? (
    <div className="mb-2 w-100">
      <Button onClick={disable}>Disable 2FA</Button>
      <Link to={otpRecoveryCodesUrl()}>Download backup codes</Link>
    </div>
  ) : (
    <Button onClick={() => navigate(otpSetupUrl())}>Configure 2FA</Button>
  );
  const content = isLoading ? <Loading /> : btns;

  return (
    <div>
      <div className="my-2">
        2-factor authentication is enabled for your account.
      </div>

      <ul className="mb-2">
        <li>Download your backup codes if you haven&apos;t done so yet.</li>
        <li>You might need to update aptible-cli for 2FA support.</li>
        <li>Note that 2FA does not apply to git push operations.</li>
      </ul>

      {content}
    </div>
  );
};

const ChangeEmail = () => {
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);
  const [email, setEmail] = useState<string>("");
  const loader = useLoader(updateEmail);
  const error = email === "" || validEmail(email) ? "" : "Not a valid email";
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) {
      return;
    }
    if (error) {
      return;
    }
    dispatch(updateEmail({ userId, email }));
  };

  return (
    <div>
      <div>
        You will need to verify your new email address before it can be used.
        Show pending verifications.
      </div>

      <form onSubmit={onSubmit}>
        <FormGroup
          label="Email"
          htmlFor="input-email"
          feedbackVariant={error ? "danger" : "info"}
        >
          <Input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            autoComplete="username"
            autoFocus={true}
            data-testid="input-email"
            id="input-email"
          />
          <div>{error}</div>
        </FormGroup>
        <Button type="submit" disabled={!!error} isLoading={loader.isLoading}>
          Send Verification Email
        </Button>
        <BannerMessages {...loader} />
      </form>
    </div>
  );
};

const SecurityKeys = () => {
  const { isLoading, user } = useCurrentUser();
  if (isLoading) {
    return <Loading />;
  }
  return (
    <div>
      {user.otpEnabled ? (
        <div>
          <div>
            The following Security Keys are associated with your account and can
            be used to log in:
          </div>
          <Link to={addSecurityKeyUrl()}>Add a new Security Key</Link>
        </div>
      ) : (
        <div>
          In order to add a hardware security key, you must set up 2FA
          authentication first.
        </div>
      )}
    </div>
  );
};

const LogOut = () => {
  const dispatch = useDispatch();
  const loader = useLoader(revokeAllTokens);
  const [confirm, setConfirm] = useState(false);
  const makeItSo = () => dispatch(revokeAllTokens());

  const confirmDialog = (
    <div className="mt-2">
      <div>Are you sure you want to log out of all sessions?</div>
      <div>
        <Button onClick={() => setConfirm(false)}>Cancel</Button>
        <Button onClick={makeItSo}>Make it so</Button>
      </div>
    </div>
  );

  return (
    <div>
      <div>
        You can log out other sessions at any time. This cannot be undone.
      </div>
      <Button className="mb-4" onClick={() => setConfirm(true)}>
        Log out all other sessions
      </Button>
      {loader.isError ? (
        <Banner variant="error">{loader.message}</Banner>
      ) : null}
      {confirm ? confirmDialog : null}
    </div>
  );
};

export const SecuritySettingsPage = () => {
  return (
    <div className="p-4">
      <h1>Security Settings</h1>

      <div className="m-8">
        <Section title="Change your password">
          <ChangePassword />
        </Section>

        <Section title="2-Factor authentication">
          <MultiFactor />
        </Section>

        <Section title="Change your email">
          <ChangeEmail />
        </Section>

        <Section title="Security keys">
          <SecurityKeys />
        </Section>

        <Section title="Log out other sessions">
          <LogOut />
        </Section>
      </div>
    </div>
  );
};
