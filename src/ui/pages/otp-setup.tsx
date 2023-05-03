import QRCode from "qrcode.react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLoader } from "saga-query/react";

import { selectOtp, setupOtp } from "@app/mfa";
import { selectCurrentUserId, updateUser } from "@app/users";

import {
  BannerMessages,
  Button,
  ExternalLink,
  FormGroup,
  Input,
  Loading,
} from "../shared";

export const OtpSetupPage = () => {
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);
  const otpLoader = useLoader(setupOtp);
  const userLoader = useLoader(updateUser);
  const otp = useSelector(selectOtp);
  const [error, setError] = useState("");
  const [mfa, setMFA] = useState("");
  const [secret, setSecret] = useState("");

  useEffect(() => {
    if (!otp.uri) {
      return;
    }
    const search = new URLSearchParams(otp.uri.replace(/.*\?/, "?"));
    setSecret(search.get("secret") || "");
  }, [otp.uri]);

  useEffect(() => {
    if (!userId) {
      return;
    }
    dispatch(setupOtp({ userId }));
  }, [userId]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) {
      return;
    }
    if (!otp.id) {
      return;
    }
    if (!mfa) {
      setError("must enter token");
      return;
    }

    dispatch(
      updateUser({
        type: "otp",
        userId,
        otp_enabled: true,
        current_otp_configuration: otp.currentUrl,
        current_otp_configuration_id: otp.id,
        otp_token: mfa,
      }),
    );
  };

  return (
    <div className="flex p-16 justify-center">
      <div className="max-w-md">
        <div className="mb-2">
          2-factor authentication will be enabled for your account after
          confirmation.
        </div>
        <div>
          To proceed, scan the QR code below with your 2FA app (we recommend
          using{" "}
          <ExternalLink
            href="https://support.google.com/accounts/answer/1066447?hl=en"
            variant="info"
          >
            Google Authenticator
          </ExternalLink>
          ), input the code generated, and click on Enable 2FA.
        </div>

        {otpLoader.isLoading ? (
          <Loading />
        ) : (
          <div>
            <div className="my-4">
              <div className="flex my-4 justify-center align-center">
                <QRCode value={otp.uri} />
              </div>
              <div>Your 2FA URL: {otp.uri}</div>
              <div>Your 2FA Secret: {secret}</div>
            </div>
            <form onSubmit={onSubmit}>
              <FormGroup
                label="2FA Token"
                htmlFor="input-mfa"
                feedbackVariant={error ? "danger" : "info"}
              >
                <Input
                  name="mfa"
                  type="mfa"
                  value={mfa}
                  onChange={(e) => setMFA(e.currentTarget.value)}
                  data-testid="input-mfa"
                />
                <div>{error}</div>
              </FormGroup>
              <Button
                type="submit"
                disabled={!!error || !mfa}
                isLoading={userLoader.isLoading}
              >
                Enable 2FA
              </Button>
              <div className="mt-4">
                <BannerMessages {...userLoader} />
                {otpLoader.isError ? <BannerMessages {...otpLoader} /> : null}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
