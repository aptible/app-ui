import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { Link } from "react-router-dom";

import { prettyEnglishDate } from "@app/date";
import {
  fetchAllCertsByEnvId,
  selectAppsByCertificateId,
  selectCertificatesByEnvId,
} from "@app/deploy";
import { useQuery } from "@app/fx";
import { appEndpointsUrl } from "@app/routes";
import type { AppState, DeployCertificate } from "@app/types";

import {
  EmptyResourcesTable,
  LoadResources,
  Pill,
  ResourceListView,
  TableHead,
  Td,
  pillStyles,
  tokens,
} from "../shared";

const CertificateTrustedPill = ({
  certificate,
}: {
  certificate: DeployCertificate;
}) => {
  return (
    <Pill
      className={certificate.trusted ? pillStyles.success : pillStyles.error}
    >
      {certificate.trusted ? "Trusted" : "Untrusted"}
    </Pill>
  );
};

const ManagedHTTPSPill = ({
  certificate,
}: {
  certificate: DeployCertificate;
}) => {
  return certificate.acme ? (
    <Pill className={pillStyles.success}>Managed HTTPS</Pill>
  ) : null;
};

const CertificatePrimaryCell = ({
  certificate,
}: { certificate: DeployCertificate }) => {
  return (
    <Td className="flex-1">
      <div className="flex">
        <p className="leading-4">
          <span className={tokens.type.darker}>
            {certificate.commonName || "Unnamed"}
          </span>
        </p>
      </div>
    </Td>
  );
};

const CertificateValidDateRangeCell = ({
  certificate,
}: { certificate: DeployCertificate }) => {
  return (
    <Td className="flex-1">
      <div className="flex">
        <p className="leading-4">
          <span className={tokens.type.darker}>
            {prettyEnglishDate(certificate.notBefore)} -{" "}
            {prettyEnglishDate(certificate.notAfter)}
          </span>
          {new Date(certificate.notAfter) <= new Date() ? (
            <>
              <br />
              <span className="text-sm text-red">Expired</span>
            </>
          ) : null}
        </p>
      </div>
    </Td>
  );
};

const CertificateIssuerCell = ({
  certificate,
}: { certificate: DeployCertificate }) => {
  return (
    <Td className="flex-1">
      <div className="flex">
        <p className="leading-4">
          <span className={tokens.type.darker}>
            {certificate.issuerOrganization || "Unknown Issuer"}
          </span>
          <br />
          <span className={tokens.type["small lighter"]}>
            Fingerprint: {certificate.sha256Fingerprint.slice(0, 8) || "N/A"}
          </span>
        </p>
      </div>
    </Td>
  );
};

const CertificateServicesCell = ({
  certificate,
}: { certificate: DeployCertificate }) => {
  const appsForCertificate = useSelector((s: AppState) =>
    selectAppsByCertificateId(s, {
      certificateId: certificate.id,
      envId: certificate.environmentId,
    }),
  );

  return (
    <Td className="flex-1">
      <div className="flex">
        <div className={`${tokens.type.darker} leading-4`}>
          {appsForCertificate.length > 0
            ? appsForCertificate.flat().map((appForCertificate, idx) => (
                <div key={`${appForCertificate.id}-${idx}`}>
                  <Link
                    to={appEndpointsUrl(appForCertificate.id)}
                    key={appForCertificate.id}
                  >
                    {appForCertificate.handle}
                  </Link>
                </div>
              ))
            : "No Apps Found"}
        </div>
      </div>
    </Td>
  );
};

const CertificateStatusCell = ({
  certificate,
}: { certificate: DeployCertificate }) => {
  return (
    <Td className="flex-1">
      <div className="flex">
        <div className="leading-4 flex flex-row">
          <CertificateTrustedPill certificate={certificate} />
          <ManagedHTTPSPill certificate={certificate} />
        </div>
      </div>
    </Td>
  );
};

const certificatesHeaders = [
  "Certificate",
  "Date Range",
  "Issuer",
  "Apps",
  "Status",
];

export const EnvironmentCertificatesPage = () => {
  const { id = "" } = useParams();
  const query = useQuery(fetchAllCertsByEnvId({ id }));
  const certificates = useSelector((s: AppState) =>
    selectCertificatesByEnvId(s, { envId: id }),
  );

  return (
    <LoadResources
      empty={
        <EmptyResourcesTable
          headers={certificatesHeaders}
          titleBar={
            <p className="flex text-gray-500 text-base mb-4">
              {certificates.length} Certificate
              {certificates.length !== 1 && "s"}
            </p>
          }
        />
      }
      query={query}
      isEmpty={certificates.length === 0}
    >
      <ResourceListView
        header={
          <p className="flex text-gray-500 text-base mb-4">
            {certificates.length} Certificate{certificates.length !== 1 && "s"}
          </p>
        }
        tableHeader={<TableHead headers={certificatesHeaders} />}
        tableBody={
          <>
            {certificates.map((certificate) => (
              <tr className="group hover:bg-gray-50" key={certificate.id}>
                <CertificatePrimaryCell certificate={certificate} />
                <CertificateValidDateRangeCell certificate={certificate} />
                <CertificateIssuerCell certificate={certificate} />
                <CertificateServicesCell certificate={certificate} />
                <CertificateStatusCell certificate={certificate} />
              </tr>
            ))}
          </>
        }
      />
    </LoadResources>
  );
};
