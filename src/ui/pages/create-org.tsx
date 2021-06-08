import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import {
  FormGroup,
  Label,
  Input,
  InputFeedback,
  STATUS_VARIANT,
  Stack,
  JUSTIFY,
  Banner,
} from '@aptible/arrow-ds';

import { homeUrl } from '@app/routes';
import { selectLoader } from '@app/loaders';
import { createOrganization } from '@app/organizations';

import { AuthenticationWrapper } from '../auth/authentication-wrapper';
import { AsyncButton } from '../auth/async-button';
import { Progress } from '../auth/progress';
import { useLoaderSuccess } from '../use-loader-success';

const CreateOrgForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loader = useSelector(selectLoader(`${createOrganization}`));
  const { isLoading, isError, message } = loader;

  const [name, setName] = useState<string>('');

  const disableSave = name === '';

  const onSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disableSave) return;
    dispatch(createOrganization({ name }));
  };

  useLoaderSuccess(loader, () => {
    navigate(homeUrl());
  });

  return (
    <form onSubmit={onSubmitForm}>
      {isError ? (
        <Banner variant={STATUS_VARIANT.DANGER} withIcon className="mb-6">
          {message}
        </Banner>
      ) : null}
      <FormGroup>
        <Label htmlFor="input-name" className="brand-dark-form__label">
          Your Name
        </Label>
        <Input
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName((e.target as HTMLInputElement).value)}
          autoComplete="name"
          disabled={isLoading}
          autoFocus
          data-testid="input-name"
          id="input-name"
        />
        <InputFeedback>
          If you need to join an existing organization, have one of the owners
          of the organization send you an invitation to join.
        </InputFeedback>
      </FormGroup>

      <Stack reverse className="mt-9 mb-6" justify={JUSTIFY.BETWEEN}>
        <AsyncButton
          inProgress={isLoading}
          disabled={disableSave}
          label="Create Organization"
          type="submit"
          data-testid="signup-submit"
        />
      </Stack>
    </form>
  );
};

export const CreateOrgPage = () => {
  const title = 'Create an organization';
  return (
    <AuthenticationWrapper
      title={title}
      progressElement={<Progress steps={3} currentStep={3} />}
    >
      <CreateOrgForm />
    </AuthenticationWrapper>
  );
};
