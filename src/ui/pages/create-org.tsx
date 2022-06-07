import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { useLoader, useLoaderSuccess } from 'saga-query/react';

import { homeUrl } from '@app/routes';
import { createOrganization } from '@app/organizations';

import { Button, Banner, FormGroup, Progress } from '../shared';

const CreateOrgForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loader = useLoader(createOrganization);
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
        <Banner variant="error" className="mb-6">
          {message}
        </Banner>
      ) : null}
      <FormGroup label="Your Name" htmlFor="input-name">
        <input
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          autoComplete="name"
          disabled={isLoading}
          autoFocus
          data-testid="input-name"
          id="input-name"
        />
        <div>
          If you need to join an existing organization, have one of the owners
          of the organization send you an invitation to join.
        </div>
      </FormGroup>

      <div className="flex flex-col justify-between mt-9 mb-6">
        <Button
          isLoading={isLoading}
          disabled={disableSave}
          type="submit"
          data-testid="signup-submit"
        >
          Create Organization
        </Button>
      </div>
    </form>
  );
};

export const CreateOrgPage = () => {
  return (
    <div>
      <Progress steps={3} currentStep={3} />
      <CreateOrgForm />
    </div>
  );
};
