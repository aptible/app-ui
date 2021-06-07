import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { Flex, Loading } from '@aptible/arrow-ds';

import { verifyEmail } from '@app/auth';
import { selectCurrentUser } from '@app/users';
import { selectLoader } from '@app/loaders';

import { Progress } from '../../auth/progress';
import { AuthenticationWrapper } from '../../auth/authentication-wrapper';
import { ResendVerificationEmail } from './resend-verification-email-form';

export const VerifyEmailPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const params = useParams();

  const verifyEmailLoader = useSelector(selectLoader(`${verifyEmail}`));

  useEffect(() => {
    if (params.verificationCode && params.verificationId && user.id) {
      dispatch(
        verifyEmail({
          challengeId: params.verificationId,
          verificationCode: params.verificationCode,
        }),
      );
    }
  }, [params.verificationId, params.verificationCode, user.id]);

  if (verifyEmailLoader.isLoading) {
    return (
      <Flex className="h-screen w-screen bg-gray-900 text-gray-400 items-center justify-center">
        <Loading className="text-brandGreen-400" />
      </Flex>
    );
  }

  if (verifyEmailLoader.isError) {
    return (
      <AuthenticationWrapper
        title="Verifying your email failed"
        progressElement={<Progress steps={3} currentStep={2} />}
      >
        <p className="text-h3 text-gray-500 leading-normal">
          Failed to verify your email, the token may have expired. Resend the
          verification email and try again.
        </p>
        <p>{verifyEmailLoader.message}</p>

        <ResendVerificationEmail />
      </AuthenticationWrapper>
    );
  }

  return (
    <AuthenticationWrapper
      title="Verify your email"
      progressElement={<Progress steps={3} currentStep={2} />}
    >
      <p className="text-h3 text-gray-500 leading-normal">
        Before you can continue setting up your Aptible account, you&apos;ll
        need to verify your email address. Find our verification email sent to{' '}
        {user.email} and click on the included link to proceed.
      </p>
      <ResendVerificationEmail />
    </AuthenticationWrapper>
  );
};
