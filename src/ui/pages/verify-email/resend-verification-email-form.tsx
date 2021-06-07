import React, { useEffect } from 'react';
import { showToast, STATUS_VARIANT, Stack, JUSTIFY } from '@aptible/arrow-ds';
import { useDispatch, useSelector } from 'react-redux';

import { resendVerification } from '@app/auth';
import { selectCurrentUser } from '@app/users';
import { selectLoader } from '@app/loaders';
import { selectOrigin } from '@app/env';

import { AsyncButton } from '../../auth/async-button';

export const ResendVerificationEmail = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const origin = useSelector(selectOrigin);

  const resendVerificationLoader = useSelector(
    selectLoader(`${resendVerification}`),
  );
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(resendVerification({ userId: user.id, origin }));
  };

  useEffect(() => {
    if (resendVerificationLoader.status === 'success') {
      showToast({
        title: 'Successfully resent email verification',
        content: 'Please check your inbox for verification instructions.',
        variant: STATUS_VARIANT.SUCCESS,
      });
    } else if (resendVerificationLoader.status === 'error') {
      showToast({
        title: 'Error sending email verification',
        content: 'Could not send verification instructions.',
        variant: STATUS_VARIANT.DANGER,
      });
    }
  }, [resendVerificationLoader.status]);

  return (
    <form onSubmit={onSubmit}>
      <Stack reverse className="mt-9 mb-6" justify={JUSTIFY.BETWEEN}>
        <AsyncButton
          inProgress={resendVerificationLoader.isLoading}
          disabled={resendVerificationLoader.isLoading}
          label="Resend Verification Email"
          type="submit"
          data-testid="send-verification-email-submit"
        />
      </Stack>
    </form>
  );
};
