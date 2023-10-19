import { useCache } from "@app/fx";
import { fetchOtpCodes } from "@app/mfa";
import { settingsUrl } from "@app/routes";
import { HalEmbedded } from "@app/types";
import { useCurrentUser } from "../hooks";
import { Box, BoxGroup, Breadcrumbs, Loading } from "../shared";

interface OtpCode {
  id: string;
  value: string;
  used: boolean;
}
type OtpResponse = HalEmbedded<{ otp_recovery_codes: OtpCode[] }>;

export const OtpRecoveryCodesPage = () => {
  const [user] = useCurrentUser();
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
    <BoxGroup>
      <Breadcrumbs
        crumbs={[
          { name: "Settings", to: settingsUrl() },
          { name: "Recovery Codes", to: null },
        ]}
      />
      <Box>
        {codes.map((d) => {
          return (
            <div key={d.id} className="my-2">
              {d.value}
            </div>
          );
        })}
      </Box>
    </BoxGroup>
  );
};
