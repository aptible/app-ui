import {
  fetchEmailVerificationPending,
  revokeAllTokens,
  revokeEmailVerification,
  rmOtp,
} from "@app/auth";
import { updatePassword } from "@app/auth";
import { prettyDateTime } from "@app/date";
import { deleteU2fDevice, fetchU2fDevices } from "@app/mfa";
import {
  useCache,
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useQuery,
  useSelector,
} from "@app/react";
import {
  addSecurityKeyUrl,
  otpRecoveryCodesUrl,
  otpSetupUrl,
} from "@app/routes";
import { schema } from "@app/schema";
import { selectCurrentUserId, updateEmail } from "@app/users";
import { emailValidator } from "@app/validator";
import { useState } from "react";
import { useCurrentUser } from "../hooks";
import {
  Banner,
  BannerMessages,
  Box,
  BoxGroup,
  Button,
  ButtonLink,
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
  const action = updatePassword({
    type: "update-password",
    userId,
    password: pass,
  });
  const loader = useLoader(updatePassword);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) {
      return;
    }

    if (pass === "") {
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

  const isDisabled = pass === "";
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
          disabled={isDisabled}
          isLoading={loader.isLoading}
        >
          Change Password
        </Button>
      </Group>
    </form>
  );
};

const ChangeEmail = () => {
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);
  const [email, setEmail] = useState<string>("");
  const loader = useLoader(updateEmail);
  const [error, setError] = useState("");
  const pending = useCache(fetchEmailVerificationPending({ userId }));
  const revokeLoader = useLoader(revokeEmailVerification);

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

  const onRevoke = (id: string) => {
    dispatch(revokeEmailVerification({ id }));
  };

  useLoaderSuccess(loader, () => {
    setError("");
    setEmail("");
    pending.trigger();
  });

  useLoaderSuccess(revokeLoader, () => {
    pending.trigger();
  });

  const challenges =
    pending.data?._embedded?.email_verification_challenges || [];

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
        {challenges.length === 0 ? (
          <Banner variant="info">No pending requests</Banner>
        ) : null}
        {challenges.map((em) => {
          return (
            <div key={em.id} className="flex justify-between items-center">
              <Tooltip text={`Expires ${prettyDateTime(em.expires_at)}`}>
                <span>{em.email}</span>
              </Tooltip>
              <Button
                size="xs"
                requireConfirm
                variant="delete"
                onClick={() => onRevoke(em.id)}
                isLoading={revokeLoader.isLoading}
              >
                Revoke
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
  const [user, loader] = useCurrentUser();
  const rmAction = rmOtp({
    type: "otp",
    userId: user.id,
    otp_enabled: false,
  });
  const rmLoader = useLoader(rmAction);
  const onDisable = () => {
    dispatch(rmAction);
  };

  return (
    <Group>
      {loader.isLoading ? <Loading /> : null}
      <BannerMessages {...rmLoader} />

      {user.otpEnabled ? (
        <Group>
          <p>2FA does not apply to git push operations.</p>
          <Button
            className="w-fit"
            variant="delete"
            onClick={onDisable}
            requireConfirm
            isLoading={rmLoader.isLoading}
          >
            Disable 2FA
          </Button>
          <Banner variant="info">
            Download your backup codes if you haven&apos;t done so yet!
          </Banner>
          <div>
            <ButtonLink to={otpRecoveryCodesUrl()} className="w-fit">
              Download backup codes
            </ButtonLink>
          </div>
        </Group>
      ) : (
        <Group>
          <p>2-factor authentication can be enabled for your account.</p>
          <ButtonLink to={otpSetupUrl()} className="w-fit">
            Configure 2FA
          </ButtonLink>
        </Group>
      )}
    </Group>
  );
};

const SecurityKeys = () => {
  const dispatch = useDispatch();
  const [user, loader] = useCurrentUser();
  useQuery(fetchU2fDevices({ userId: user.id }));
  const devices = useSelector(schema.u2fDevices.selectTableAsList);
  const onRemove = (deviceId: string) => {
    dispatch(deleteU2fDevice({ deviceId }));
  };
  const rmLoader = useLoader(deleteU2fDevice);

  if (loader.isLoading) {
    return <Loading />;
  }

  if (!user.otpEnabled) {
    return (
      <Banner variant="info">
        In order to add a hardware security key, you must set up 2FA
        authentication first.
      </Banner>
    );
  }

  return (
    <Group>
      <div>
        The following Security Keys are associated with your account and can be
        used to log in:
      </div>

      <BannerMessages {...rmLoader} />

      <div>
        {devices.map((dev) => {
          return (
            <div key={dev.id} className="flex gap-4 items-center">
              {dev.name}{" "}
              <Button
                requireConfirm
                size="sm"
                variant="delete"
                onClick={() => onRemove(dev.id)}
              >
                Remove
              </Button>
            </div>
          );
        })}
      </div>

      <ButtonLink className="w-fit" to={addSecurityKeyUrl()}>
        Add a new Security Key
      </ButtonLink>
    </Group>
  );
};

const LogOut = () => {
  const dispatch = useDispatch();
  const loader = useLoader(revokeAllTokens);
  const confirmLogout = () => dispatch(revokeAllTokens());

  return (
    <Group>
      <BannerMessages {...loader} />

      <div>
        This action will log out all <strong>other</strong> sessions and cannot
        be undone. This session will remain logged in.
      </div>

      <div>
        <Button variant="delete" requireConfirm onClick={confirmLogout}>
          Log out other sessions
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

      <Section title="2-Factor Authentication">
        <MultiFactor />
      </Section>
      <Section title="Security Keys">
        <SecurityKeys />
      </Section>
      <Section title="Log out other sessions">
        <LogOut />
      </Section>
    </BoxGroup>
  );
};
