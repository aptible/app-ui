import { ReactElement } from "react";
import { useParams } from "react-router";
import { useQuery } from "saga-query/react";

import type { AppState, DeployCertificate } from "@app/types";

import {
  ExternalLink,
  InputSearch,
  LoadResources,
  Pill,
  ResourceHeader,
  ResourceListView,
  TableHead,
  Td,
  pillStyles,
  tokens,
} from "../shared";
import { EmptyResourcesTable } from "../shared/empty-resources-table";
import { prettyEnglishDate } from "@app/date";
import {
  fetchCertificates,
  fetchEndpointsByEnvironmentId,
  selectCertificatesByEnvId,
  selectEndpointByEnvironmentAndCertificateId,
} from "@app/deploy";
import { appServicesUrl } from "@app/routes";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const CertificateTrustedPill = ({
  certificate,
}: {
  certificate: DeployCertificate;
}): ReactElement => {
  return (
    <Pill
      className={
        certificate.trusted || certificate.acme
          ? pillStyles.success
          : pillStyles.error
      }
    >
      {certificate.trusted || certificate.acme ? "Trusted" : "Untrusted"}
    </Pill>
  );
};

const ManagedHTTPSPill = ({
  certificate,
}: {
  certificate: DeployCertificate;
}): ReactElement | null => {
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
  const endpointsForCertificate = useSelector((s: AppState) =>
    selectEndpointByEnvironmentAndCertificateId(s, {
      certificateId: certificate.id,
      envId: certificate.environmentId,
    }),
  );

  return (
    <Td className="flex-1">
      <div className="flex">
        <p className="leading-4">
          <span className={tokens.type.darker}>
            {endpointsForCertificate.length > 0
              ? endpointsForCertificate.map((endpointForCertificate, idx) => (
                  <>
                    {idx > 0 ? <br /> : null}
                    <span>
                      <Link
                        to={appServicesUrl(certificate.id)}
                        key={endpointForCertificate.id}
                      >
                        endpointForCertificate.endpointForCertificate
                      </Link>
                    </span>
                  </>
                ))
              : "No Endpoint Found"}
          </span>
        </p>
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
        <div className="leading-4 flex flex-col gap-2">
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
  "Services",
  "Status",
];

const CertificatesResourceHeaderTitleBar = ({
  certificates,
  resourceHeaderType = "title-bar",
  search = "",
  searchOverride = "",
  onChange,
}: {
  certificates: DeployCertificate[];
  resourceHeaderType?: "title-bar" | "simple-text" | "hidden";
  search?: string;
  searchOverride?: string;
  onChange?: (ev: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  switch (resourceHeaderType) {
    case "hidden":
      return null;
    case "title-bar":
      return (
        <ResourceHeader
          title="Certificates"
          filterBar={
            <div className="pt-1">
              {searchOverride ? undefined : (
                <InputSearch
                  placeholder="Search certificates..."
                  search={search}
                  onChange={() => {}}
                />
              )}
              <p className="flex text-gray-500 mt-4 text-base">
                {certificates.length} Certificate
                {certificates.length !== 1 && "s"}
              </p>
            </div>
          }
        />
      );
    case "simple-text":
      return (
        <p className="flex text-gray-500 text-base">
          {certificates.length} Certificate{certificates.length !== 1 && "s"}
        </p>
      );
    default:
      return null;
  }
};

export const EnvironmentCertificatesPage = () => {
  const { id = "" } = useParams();
  const query = useQuery(fetchCertificates({ id }));
  useQuery(fetchEndpointsByEnvironmentId({ id }));
  const certificates = useSelector((s: AppState) =>
    selectCertificatesByEnvId(s, { envId: id }),
  );

  return (
    <LoadResources
      empty={
        <EmptyResourcesTable
          headers={certificatesHeaders}
          titleBar={
            <CertificatesResourceHeaderTitleBar
              certificates={certificates}
              resourceHeaderType="simple-text"
            />
          }
        />
      }
      query={query}
      isEmpty={certificates.length === 0}
    >
      <ResourceListView
        header={
          <CertificatesResourceHeaderTitleBar
            certificates={certificates}
            resourceHeaderType="simple-text"
          />
        }
        tableHeader={<TableHead headers={certificatesHeaders} />}
        tableBody={
          <>
            {certificates.map((certificate) => (
              <tr key={certificate.id}>
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
