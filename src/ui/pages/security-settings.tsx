import React, { useState } from 'react';

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
} from '@aptible/arrow-ds';

import { validEmail } from '@app/string-utils';

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
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  return (
    <form>
      <FormGroup>
        <Label htmlFor="input-password" className="brand-dark-form__label">
          New Password
        </Label>
        <Input
          name="password"
          type="password"
          value={pass}
          onChange={(e) => setPass((e.target as HTMLInputElement).value)}
          data-testid="input-password"
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="input-password" className="brand-dark-form__label">
          Confirm New Password
        </Label>
        <Input
          name="config-password"
          type="password"
          value={confirmPass}
          onChange={(e) => setConfirmPass((e.target as HTMLInputElement).value)}
          data-testid="input-confirm-password"
        />
      </FormGroup>
      <Button>Change Password</Button>
    </form>
  );
};

const MultiFactor = () => {
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

      <Button.Group className="mb-2" isFullWidth>
        <Button>Disable 2FA</Button>
        <Button>Download Backup Codes</Button>
      </Button.Group>
    </Box>
  );
};

const ChangeEmail = () => {
  const [email, setEmail] = useState<string>('');
  const emailErrorMessage =
    email === '' || validEmail(email) ? null : 'Not a valid email';

  return (
    <Box>
      <Text>
        You will need to verify your new email address before it can be used.
        Show pending verifications.
      </Text>

      <form>
        <FormGroup
          variant={
            emailErrorMessage ? STATUS_VARIANT.DANGER : STATUS_VARIANT.DEFAULT
          }
        >
          <Label htmlFor="input-email" className="brand-dark-form__label">
            Email
          </Label>

          <Input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
            autoComplete="username"
            autoFocus
            data-testid="input-email"
            id="input-email"
          />
          <InputFeedback data-testid="input-email-error">
            {emailErrorMessage}
          </InputFeedback>
        </FormGroup>
        <Button>Send Verification Email</Button>
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
  return (
    <Box>
      <Text>
        You can log out other sessions at any time. This cannot be undone.
      </Text>
      <Button variant={BUTTON_VARIANT.DANGER}>
        Log out all other sessions
      </Button>
    </Box>
  );
};

export const SecuritySettingsPage = () => {
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
