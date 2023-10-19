import {
  addSecurityKeyUrl,
  otpRecoveryCodesUrl,
  otpSetupUrl,
} from "@app/routes";
import { updateUser } from "@app/users";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useCurrentUser } from "../hooks";
import { Banner, Box, Button, Group, Loading, tokens } from "../shared";

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

const MultiFactor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, loader] = useCurrentUser();
  const disable = () => {
    dispatch(updateUser({ type: "otp", userId: user.id, otp_enabled: false }));
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
          Download your backup codes if you haven&apos;t done so yet. You might
          need to update aptible-cli for 2FA support. 2FA does not apply to git
          push operations.
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

export const SecondFactorSettingsPage = () => {
  return (
    <Group>
      <h2 className={tokens.type.h2}>2fa Settings</h2>
      <Section title="OTP">
        <MultiFactor />
      </Section>
      <Section title="Security Keys">
        <SecurityKeys />
      </Section>
    </Group>
  );
};
