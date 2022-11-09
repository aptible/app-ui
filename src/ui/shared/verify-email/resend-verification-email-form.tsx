import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLoader } from "saga-query/react";

import { resendVerification } from "@app/auth";
import { selectJWTToken } from "@app/token";
import { selectOrigin } from "@app/env";

import { Button } from "../../shared";

export const ResendVerificationEmail = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectJWTToken);
  const origin = useSelector(selectOrigin);
  const resendVerificationLoader = useLoader(resendVerification);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(resendVerification({ userId: user.id, origin }));
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
      <div className="flex flex-col justify-between mt-9 mb-6">
        <Button
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
