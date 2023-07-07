import { useLoader, useLoaderSuccess } from "@app/fx";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";

import { Box, Button, Loading, ResendVerificationEmail } from "../shared";
import { fetchCurrentToken, logout, verifyEmail } from "@app/auth";
import { resetRedirectPath, selectRedirectPath } from "@app/redirect-path";
import { homeUrl, loginUrl } from "@app/routes";
import { selectJWTToken } from "@app/token";

import { HeroBgLayout } from "../layouts";
import { selectCurrentUser } from "@app/users";

export const VerifyEmailPage = () => {
  const loader = useLoader(fetchCurrentToken);
  const dispatch = useDispatch();
  const { id: userId, email } = useSelector(selectJWTToken);
  const { verified } = useSelector(selectCurrentUser);
  const params = useParams();
  const navigate = useNavigate();
  const verifyEmailLoader = useLoader(verifyEmail);
  const redirectPath = useSelector(selectRedirectPath);

  const logoutSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    dispatch(logout());
    navigate(loginUrl());
  };

  useEffect(() => {
    if (params.verificationCode && params.verificationId && userId) {
      dispatch(
        verifyEmail({
          challengeId: params.verificationId,
          verificationCode: params.verificationCode,
        }),
      );
    }
  }, [params.verificationId, params.verificationCode, userId, verified]);

  useEffect(() => {
    if (loader.isLoading) {
      return;
    }

    if (verified) {
      // if already verified dump them back at root, no need
      // to display this page at all
      navigate(homeUrl());
    }
  }, [loader.isLoading, navigate, verified]);

  useLoaderSuccess(verifyEmailLoader, () => {
    navigate(redirectPath || homeUrl());
    dispatch(resetRedirectPath());
  });

  if (verifyEmailLoader.isLoading) {
    return (
      <div className="flex h-screen w-screen bg-gray-900 text-gray-400 items-center justify-center">
        <Loading className="text-brandGreen-400" />
      </div>
    );
  }

  return (
    <HeroBgLayout>
      <h2 className="mt-6 text-center text-3xl font-semibold text-gray-900">
        Check your Email
      </h2>
      <div className="flex text-center items-center justify-center mt-4">
        <div className="max-w-2xl mb-8">
          {verifyEmailLoader.isError ? (
            <>
              <p className="text-h3 text-gray-500 leading-normal">
                Failed to verify your email, the token may have expired. Resend
                the verification email and try again.
              </p>
              <p>{verifyEmailLoader.message}</p>
            </>
          ) : (
            <p className="text-h3 text-gray-500 leading-normal">
              We've sent a verification link to {email}. Click the link in the
              email to confirm your account.
            </p>
          )}
        </div>
      </div>
      <Box>
        <ResendVerificationEmail />
        <Button
          onClick={logoutSubmit}
          className="font-semibold w-full mt-4"
          variant="white"
        >
          Log Out
        </Button>
      </Box>
    </HeroBgLayout>
  );
};
