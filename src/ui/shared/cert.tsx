import { DeployCertificate } from "@app/types";

import { prettyEnglishDate } from "@app/date";
import { Pill, pillStyles } from "./pill";
import { tokens } from "./tokens";

interface CertProp {
  cert: DeployCertificate;
}

export const CertTrustedPill = ({ cert }: CertProp) => {
  return (
    <Pill className={cert.trusted ? pillStyles.success : pillStyles.error}>
      {cert.trusted ? "Trusted" : "Untrusted"}
    </Pill>
  );
};

export const CertManagedHTTPSPill = ({ cert }: CertProp) => {
  if (!cert.acme) return null;
  return <Pill className={pillStyles.success}>Managed HTTPS</Pill>;
};

export const CertValidDateRange = ({ cert }: CertProp) => {
  const isExpired = new Date(cert.notAfter) <= new Date();
  return (
    <div>
      <div className={tokens.type.darker}>
        {prettyEnglishDate(cert.notBefore)} - {prettyEnglishDate(cert.notAfter)}
      </div>
      {isExpired ? <div className="text-sm text-red">Expired</div> : null}
    </div>
  );
};

export const CertIssuer = ({ cert }: CertProp) => {
  return (
    <div>
      <div className={tokens.type.darker}>{cert.issuerOrganization}</div>
      <div className={tokens.type["small lighter"]}>
        Fingerprint: {cert.sha256Fingerprint.slice(0, 8)}
      </div>
    </div>
  );
};
