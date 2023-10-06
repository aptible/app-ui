import { fetchCurrentToken, logout, verifyEmail } from "@app/auth";
import { useLoader } from "@app/fx";
import { resetRedirectPath, selectRedirectPath } from "@app/redirect-path";
import { createProjectGitUrl, homeUrl, loginUrl } from "@app/routes";
import { selectJWTToken } from "@app/token";
import { selectCurrentUser } from "@app/users";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { Link } from "react-router-dom";
import { HeroBgLayout } from "../layouts";
import {
  Banner,
  Box,
  Button,
  Group,
  Loading,
  ResendVerificationEmail,
} from "../shared";

export const VerifyEmailPage = () => {
  const loader = useLoader(fetchCurrentToken);
  const dispatch = useDispatch();
  const { id: userId, email } = useSelector(selectJWTToken);
  const user = useSelector(selectCurrentUser);
  const { verificationId = "", verificationCode = "" } = useParams();
  const navigate = useNavigate();
  const verifyEmailLoader = useLoader(verifyEmail);
  const redirectPath = useSelector(selectRedirectPath);

  const logoutSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    dispatch(logout());
    navigate(loginUrl());
  };

  useEffect(() => {
    if (verificationCode && verificationId && userId) {
      dispatch(
        verifyEmail({
          userId,
          challengeId: verificationId,
          verificationCode: verificationCode,
        }),
      );
    }
  }, [verificationId, verificationCode, userId]);

  // useLoaderSuccess(verifyEmailLoader) does *not* work in this case
  // because there's a race between submitting email verification request
  // and fetching users (where we determine if the user is verified).
  useEffect(() => {
    if (verifyEmailLoader.status === "success" && user.verified) {
      navigate(redirectPath || createProjectGitUrl());
      dispatch(resetRedirectPath());
    }
  }, [user.verified, verifyEmailLoader.status]);

  if (verifyEmailLoader.isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <HeroBgLayout>
      <Group>
        <h2 className="mt-6 text-center text-3xl font-semibold text-gray-900">
          Check your Email
        </h2>
        {loader.lastSuccess !== 0 && user.verified ? (
          <Banner variant="success">
            You are verified!{" "}
            <Link to={homeUrl()} className="text-white underline">
              Continue to dashboard
            </Link>
          </Banner>
        ) : null}
        <div className="flex text-center items-center justify-center">
          <div className="max-w-2xl">
            {verifyEmailLoader.isError ? (
              <Banner variant="error">
                <p className="text-h3 text-white leading-normal">
                  Failed to verify your email, the token may have expired.
                  Resend the verification email and try again.
                </p>
                <p>{verifyEmailLoader.message}</p>
              </Banner>
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
      </Group>
    </HeroBgLayout>
  );
};
