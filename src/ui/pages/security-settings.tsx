import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import {
  Card,
  Box,
  FormGroup,
  Heading,
  Input,
  Label,
  Button,
  Text,
  STATUS_VARIANT,
  BUTTON_VARIANT,
  InputFeedback,
  Banner,
} from '@aptible/arrow-ds';

import { validEmail } from '@app/string-utils';
import { selectLoader } from '@app/loaders';
import {
  fetchUser,
  updateUser,
  selectCurrentUser,
  selectCurrentUserId,
  updateEmail,
} from '@app/users';
import { fetchOtpCodes } from '@app/mfa';
import { revokeAllTokens } from '@app/auth';
import { otpSetupUrl } from '@app/routes';

import { BannerMessages } from '../banner-messages';
import { useData } from '../use-data';

interface SectionProps {
  children: React.ReactNode;
  title: string;
}

const Section = ({ children, title }: SectionProps) => {
  return (
    <Card
      bodySlot={
        <>
          <Heading.H2>{title}</Heading.H2>
          <Box className="my-4">{children}</Box>
        </>
      }
    />
  );
};

const ChangePassword = () => {
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);
  const loader = useSelector(selectLoader(`${updateUser}`));

  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) {
      return;
    }

    if (pass !== confirmPass) {
      setError('passwords do not match');
      return;
    }

    dispatch(updateUser({ type: 'update-password', userId, password: pass }));
  };

  const groupVariant = error ? STATUS_VARIANT.DANGER : STATUS_VARIANT.DEFAULT;

  return (
    <form onSubmit={onSubmit}>
      <FormGroup variant={groupVariant}>
        <Label htmlFor="input-password">New Password</Label>
        <Input
          name="password"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.currentTarget.value)}
          data-testid="input-password"
        />
      </FormGroup>
      <FormGroup variant={groupVariant}>
        <Label htmlFor="input-password">Confirm New Password</Label>
        <Input
          name="config-password"
          type="password"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.currentTarget.value)}
          data-testid="input-confirm-password"
        />
        <InputFeedback variant={STATUS_VARIANT.DANGER}>{error}</InputFeedback>
      </FormGroup>
      <Button
        type="submit"
        disabled={loader.isLoading}
        isLoading={loader.isLoading}
        className="mb-4 mt-2"
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
  const user = useSelector(selectCurrentUser);
  const disable = () => {
    dispatch(updateUser({ type: 'otp', userId: user.id, otp_enabled: false }));
  };
  const codes = () => {};
  const { data, isLoading } = useData(
    fetchOtpCodes({ otpId: user.currentOtpId }),
    user.currentOtpId,
  );

  return (
    <Box>
      <Text className="my-2">
        2-factor authentication is enabled for your account.
      </Text>

      <ul className="mb-2">
        <li>Download your backup codes if you haven&apos;t done so yet.</li>
        <li>You might need to update aptible-cli for 2FA support.</li>
        <li>Note that 2FA does not apply to git push operations.</li>
      </ul>

      {user.otpEnabled ? (
        <Button.Group className="mb-2" isFullWidth>
          <Button onClick={disable}>Disable 2FA</Button>
          <Button onClick={codes} isDisabled={isLoading} isLoading={isLoading}>
            Download Backup Codes
          </Button>
        </Button.Group>
      ) : (
        <Button onClick={() => navigate(otpSetupUrl())}>Configure 2FA</Button>
      )}
    </Box>
  );
};

const ChangeEmail = () => {
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);
  const [email, setEmail] = useState<string>('');
  const loader = useSelector(selectLoader(`${updateEmail}`));
  const error = email === '' || validEmail(email) ? '' : 'Not a valid email';
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;
    if (error) return;
    dispatch(updateEmail({ userId, email }));
  };

  return (
    <Box>
      <Text>
        You will need to verify your new email address before it can be used.
        Show pending verifications.
      </Text>

      <form onSubmit={onSubmit}>
        <FormGroup
          variant={error ? STATUS_VARIANT.DANGER : STATUS_VARIANT.DEFAULT}
        >
          <Label htmlFor="input-email">Email</Label>

          <Input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            autoComplete="username"
            autoFocus
            data-testid="input-email"
            id="input-email"
          />
          <InputFeedback data-testid="input-email-error">{error}</InputFeedback>
        </FormGroup>
        <Button type="submit" disabled={!!error} isLoading={loader.isLoading}>
          Send Verification Email
        </Button>
        <BannerMessages {...loader} />
      </form>
    </Box>
  );
};

const SecurityKeys = () => {
  return (
    <Box>
      <Text>
        The following Security Keys are associated with your account and can be
        used to log in:
      </Text>
      <Button>Add a new Security Key</Button>
    </Box>
  );
};

const LogOut = () => {
  const dispatch = useDispatch();
  const loader = useSelector(selectLoader(`${revokeAllTokens}`));
  const [confirm, setConfirm] = useState(false);
  const makeItSo = () => dispatch(revokeAllTokens());

  const confirmDialog = (
    <Box className="mt-2">
      <Text>Are you sure you want to log out of all sessions?</Text>
      <Button.Group>
        <Button
          variant={BUTTON_VARIANT.SECONDARY}
          onClick={() => setConfirm(false)}
        >
          Cancel
        </Button>
        <Button variant={BUTTON_VARIANT.DANGER} onClick={makeItSo}>
          Make it so
        </Button>
      </Button.Group>
    </Box>
  );

  return (
    <Box>
      <Text>
        You can log out other sessions at any time. This cannot be undone.
      </Text>
      <Button
        className="mb-4"
        variant={BUTTON_VARIANT.DANGER}
        onClick={() => setConfirm(true)}
      >
        Log out all other sessions
      </Button>
      {loader.isError ? (
        <Banner variant={STATUS_VARIANT.DANGER}>{loader.message}</Banner>
      ) : null}
      {confirm ? confirmDialog : null}
    </Box>
  );
};

export const SecuritySettingsPage = () => {
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);
  console.log('USER', userId);

  useEffect(() => {
    if (!userId) return;
    dispatch(fetchUser({ userId }));
  }, [userId]);

  return (
    <Box className="p-4">
      <Heading.H1>Security Settings</Heading.H1>

      <Card.Group cardSize={400} className="m-8">
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
      </Card.Group>
    </Box>
  );
};
