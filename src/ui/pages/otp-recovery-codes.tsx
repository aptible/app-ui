import { HalEmbedded } from "@app/types";
import { fetchOtpCodes } from "@app/mfa";
import { useCache } from "saga-query/react";

import { useCurrentUser } from "../hooks";
import { Loading } from "../shared";

interface OtpCode {
  id: string;
  value: string;
  used: boolean;
}
type OtpResponse = HalEmbedded<{ otp_recovery_codes: OtpCode[] }>;

export const OtpRecoveryCodesPage = () => {
  const { user } = useCurrentUser();
  const { data, isLoading } = useCache<OtpResponse>(
    fetchOtpCodes({ otpId: user.currentOtpId }),
  );

  if (isLoading) {
    return <Loading />;
  }
  if (!data) {
    return <div>Woops</div>;
  }
  const codes = data._embedded.otp_recovery_codes;

  return (
    <div className="py-4 px-16">
      <div>Recovery codes</div>
      {codes.map((d) => {
        return (
          <div key={d.id} className="my-2">
            {d.value}
          </div>
        );
      })}
    </div>
  );
};
