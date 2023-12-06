import { logout } from "@app/auth";
import { useLoader, useLoaderSuccess } from "@app/fx";
import { resetOtpVerify } from "@app/mfa";
import { loginUrl } from "@app/routes";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { HeroBgLayout } from "../layouts";
import { BannerMessages, Box, Button, Group, Loading } from "../shared";

export const OtpResetVerifyPage = () => {
  const dispatch = useDispatch();
  const { challengeId = "", verificationCode = "" } = useParams();
  const navigate = useNavigate();
  const loader = useLoader(resetOtpVerify);

  const logoutSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    dispatch(logout());
    navigate(loginUrl());
  };

  const onConfirm = () => {
    dispatch(
      resetOtpVerify({
        challengeId: challengeId,
        verificationCode: verificationCode,
      }),
    );
  };

  useLoaderSuccess(loader, () => {
    dispatch(logout());
    navigate(loginUrl());
  });

  if (loader.isLoading) {
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
          Confirm Aptible 2FA Reset
        </h2>

        <div>
          Clicking Reset 2FA below will complete the process and redirect you to
          the login page.
        </div>

        <BannerMessages {...loader} />

        <Button onClick={onConfirm}>Reset 2FA</Button>

        <Box>
          <Button
            onClick={logoutSubmit}
            className="font-semibold w-full"
            variant="white"
          >
            Log Out
          </Button>
        </Box>
      </Group>
    </HeroBgLayout>
  );
};
