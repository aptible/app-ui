import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { ensureSupport, register, sign } from 'u2f-api';

import {
  Box,
  Text,
  Button,
  FormGroup,
  Label,
  Input,
  InputFeedback,
  STATUS_VARIANT,
  Banner,
} from '@aptible/arrow-ds';

import { selectCurrentUserId } from '@app/users';
import { fetchU2fChallenges } from '@app/mfa';

import { ExternalLink } from '../external-link';
import { useData } from '../use-data';

interface U2fChallenge {
  id: string;
  challenge: string;
}

const u2f = (window as any).u2f;

export const AddSecurityKeyPage = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const userId = useSelector(selectCurrentUserId);
  const challenge = useData<U2fChallenge>(
    fetchU2fChallenges({ userId }),
    userId,
  );

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log(challenge.data);
    event.preventDefault();
    if (!name) {
      setError('name must not be blank');
      return;
    }

    if (challenge.isError) {
      setError(challenge.message);
      return;
    }

    if (!challenge.data) {
      setError('could not load u2f challenge');
      return;
    }

    try {
      await ensureSupport();
    } catch (err) {
      console.log(err);
      setError(err.message);
      return;
    }

    setError('');
  };

  return (
    <Box>
      <Text>
        Security Keys are hardware devices that can be used for two-factor
        authentication. To sign in using a Security Key, you press a button on
        the device, rather than type in a token.
      </Text>
      <Text>
        Security Keys help protect against phishing, and as a result, they can
        be more secure than token-based two-factor authentication.
      </Text>
      <Text>
        Aptible supports Security Keys that conform to the{' '}
        <ExternalLink href="https://fidoalliance.org/">
          FIDO U2F standard
        </ExternalLink>
        .
      </Text>
      <form onSubmit={onSubmit}>
        <FormGroup
          variant={error ? STATUS_VARIANT.DANGER : STATUS_VARIANT.DEFAULT}
        >
          <Label htmlFor="input-name">Name</Label>

          <Input
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            autoComplete="username"
            autoFocus
          />
          <InputFeedback>
            Pick a name that helps you remember this key
          </InputFeedback>
        </FormGroup>
        {error ? (
          <Banner variant={STATUS_VARIANT.DANGER}>{error}</Banner>
        ) : null}
        <Button.Group>
          <Button type="submit">Register</Button>
        </Button.Group>
      </form>
    </Box>
  );
};
