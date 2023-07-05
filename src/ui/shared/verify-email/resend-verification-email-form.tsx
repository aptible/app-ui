import { useLoader } from "@app/fx";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { resendVerification } from "@app/auth";
import { selectOrigin } from "@app/env";

import { Button } from "../button";
import { selectCurrentUserId } from "@app/users";

export const ResendVerificationEmail = () => {
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);
  const origin = useSelector(selectOrigin);
  const resendVerificationLoader = useLoader(resendVerification);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(resendVerification({ userId, origin }));
  };

  useEffect(() => {
    if (resendVerificationLoader.status === "success") {
      // TODO: toast?
      console.log("Successfully resent email verification");
    } else if (resendVerificationLoader.status === "error") {
      console.log("Error sending email verification");
    }
  }, [resendVerificationLoader.status]);

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col justify-between">
        <Button
          className="semibold"
          isLoading={resendVerificationLoader.isLoading}
          disabled={resendVerificationLoader.isLoading}
          type="submit"
          data-testid="send-verification-email-submit"
        >
          Resend Verification Email
        </Button>
      </div>
    </form>
  );
};
