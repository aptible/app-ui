import { DeployCertificate } from "@app/types";

import { prettyDate } from "@app/date";
import { Pill } from "./pill";
import { tokens } from "./tokens";

interface CertProp {
  cert: DeployCertificate;
}

export const CertTrustedPill = ({ cert }: CertProp) => {
  return (
    <Pill variant={cert.trusted ? "success" : "error"}>
      {cert.trusted ? "Trusted" : "Untrusted"}
    </Pill>
  );
};

export const CertManagedHTTPSPill = ({ cert }: CertProp) => {
  if (!cert.acme) return null;
  return <Pill variant="success">Managed HTTPS</Pill>;
};

export const CertValidDateRange = ({ cert }: CertProp) => {
  const isExpired = new Date(cert.notAfter) <= new Date();
  return (
    <div>
      <div className={tokens.type.darker}>
        {prettyDate(cert.notBefore)} - {prettyDate(cert.notAfter)}
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
