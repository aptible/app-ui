import { resendVerification } from "@app/auth";
import { selectOrigin } from "@app/config";
import { useDispatch, useLoader, useSelector } from "@app/react";
import { selectCurrentUserId } from "@app/users";
import { BannerMessages } from "../banner";
import { Button } from "../button";
import { Loading } from "../loading";

export const ResendVerificationEmail = () => {
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);
  const origin = useSelector(selectOrigin);
  const loader = useLoader(resendVerification);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(resendVerification({ userId, origin }));
  };

  if (userId === "") {
    return <Loading />;
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col justify-between">
        <BannerMessages {...loader} />

        <Button
          className="semibold"
          disabled={userId === ""}
          isLoading={loader.isLoading}
          type="submit"
        >
          Resend Verification Email
        </Button>
      </div>
    </form>
  );
};
