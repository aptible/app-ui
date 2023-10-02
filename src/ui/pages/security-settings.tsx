import { useLoader } from "@app/fx";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

import { revokeAllTokens } from "@app/auth";
import {
  addSecurityKeyUrl,
  otpRecoveryCodesUrl,
  otpSetupUrl,
} from "@app/routes";
import { selectCurrentUserId, updateEmail, updateUser } from "@app/users";

import { emailValidator } from "@app/validator";
import { useCurrentUser } from "../hooks";
import {
  Banner,
  BannerMessages,
  Box,
  BoxGroup,
  Button,
  FormGroup,
  IconAlertTriangle,
  Input,
  Loading,
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
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormGroup
        label="New Password"
        htmlFor="input-password"
        feedbackVariant={groupVariant}
      >
        <Input
          name="password"
          type="new-password"
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
          type="new-password"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.currentTarget.value)}
          data-testid="input-confirm-password"
          className="border-black border"
        />
        <div>{error}</div>
      </FormGroup>
      <Button
        className="w-fit"
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
  const [user, loader] = useCurrentUser();
  const disable = () => {
    dispatch(updateUser({ type: "otp", userId: user.id, otp_enabled: false }));
  };

  const btns = user.otpEnabled ? (
    <div>
      <Button className="w-fit" onClick={disable}>
        Disable 2FA
      </Button>
      <Link to={otpRecoveryCodesUrl()}>Download backup codes</Link>
    </div>
  ) : (
    <Button className="w-fit" onClick={() => navigate(otpSetupUrl())}>
      Configure 2FA
    </Button>
  );
  const content = loader.isLoading ? <Loading /> : btns;

  return (
    <div className="flex flex-col gap-4">
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
  const error = emailValidator(email);
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
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
        <Button
          className="w-fit"
          type="submit"
          disabled={!!error}
          isLoading={loader.isLoading}
        >
          Send Verification Email
        </Button>
        <BannerMessages {...loader} />
      </form>
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
  const confirmLogout = () => dispatch(revokeAllTokens());

  const confirmDialog = (
    <div className="flex flex-col gap-4">
      <div>
        <b>Are you sure you want to log out all sessions?</b>
      </div>
      <div className="flex flex-row gap-4">
        <Button className="w-fit" onClick={confirmLogout}>
          Confirm Logout
        </Button>
        <Button
          className="w-fit"
          variant="white"
          onClick={() => setConfirm(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div>This action will log out all sessions and cannot be undone.</div>
      <Button
        variant="delete"
        className="w-fit"
        onClick={() => setConfirm(true)}
      >
        <IconAlertTriangle className="mr-2" color="#fff" />
        Log out all sessions
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
    <BoxGroup>
      <h2 className={tokens.type.h2}>Profile Settings</h2>
      <Section title="Change Email">
        <ChangeEmail />
      </Section>
      <Section title="Change Password">
        <ChangePassword />
      </Section>

      <Section title="2-Factor Authentication">
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
