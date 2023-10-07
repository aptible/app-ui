import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { Link } from "react-router-dom";

import {
  fetchAllCertsByEnvId,
  selectAppsByCertId,
  selectCertificatesByEnvId,
} from "@app/deploy";
import { useQuery } from "@app/fx";
import {
  appEndpointsUrl,
  certDetailUrl,
  environmentCreateCertUrl,
} from "@app/routes";
import type { AppState, DeployCertificate } from "@app/types";

import {
  ButtonSensitive,
  CertIssuer,
  CertManagedHTTPSPill,
  CertTrustedPill,
  CertValidDateRange,
  EmptyResourcesTable,
  IconPlusCircle,
  LoadResources,
  ResourceListView,
  TableHead,
  Td,
  tokens,
} from "../shared";

const CertificatePrimaryCell = ({
  certificate,
}: { certificate: DeployCertificate }) => {
  return (
    <Td>
      <Link
        to={certDetailUrl(certificate.id)}
        className="text-black group-hover:text-indigo hover:text-indigo"
      >
        {certificate.id}
      </Link>
    </Td>
  );
};

const CertificateName = ({
  certificate,
}: { certificate: DeployCertificate }) => {
  return (
    <Td>
      <Link
        to={certDetailUrl(certificate.id)}
        className="text-black group-hover:text-indigo hover:text-indigo"
      >
        {certificate.commonName}
      </Link>
    </Td>
  );
};

const CertificateValidDateRangeCell = ({
  certificate,
}: { certificate: DeployCertificate }) => {
  return (
    <Td>
      <CertValidDateRange cert={certificate} />
    </Td>
  );
};

const CertificateIssuerCell = ({
  certificate,
}: { certificate: DeployCertificate }) => {
  return (
    <Td>
      <CertIssuer cert={certificate} />
    </Td>
  );
};

const CertificateServicesCell = ({
  certificate,
}: { certificate: DeployCertificate }) => {
  const appsForCertificate = useSelector((s: AppState) =>
    selectAppsByCertId(s, {
      certId: certificate.id,
      envId: certificate.environmentId,
    }),
  );

  return (
    <Td>
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
    </Td>
  );
};

const CertificateStatusCell = ({
  certificate,
}: { certificate: DeployCertificate }) => {
  return (
    <Td className="w-[225px]">
      <div className="flex gap-2 items-center">
        <CertTrustedPill cert={certificate} />
        <CertManagedHTTPSPill cert={certificate} />
      </div>
    </Td>
  );
};

const certificatesHeaders = [
  "ID",
  "Certificate",
  "Date Range",
  "Issuer",
  "Apps",
  "Status",
];

export const EnvironmentCertificatesPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const query = useQuery(fetchAllCertsByEnvId({ id }));
  const certificates = useSelector((s: AppState) =>
    selectCertificatesByEnvId(s, { envId: id }),
  );
  const createCert = () => {
    navigate(environmentCreateCertUrl(id));
  };

  const titleBar = (
    <div className="flex flex-col flex-col-reverse gap-4 text-gray-500 text-base mb-4">
      <div className="text-gray-500">
        {certificates.length} Certificate
        {certificates.length !== 1 && "s"}
      </div>
      <ButtonSensitive className="w-fit" envId={id} onClick={createCert}>
        <IconPlusCircle variant="sm" className="mr-1" /> New Certificate
      </ButtonSensitive>
    </div>
  );

  return (
    <LoadResources
      empty={
        <EmptyResourcesTable
          headers={certificatesHeaders}
          titleBar={titleBar}
        />
      }
      query={query}
      isEmpty={certificates.length === 0}
    >
      <ResourceListView
        header={titleBar}
        tableHeader={<TableHead headers={certificatesHeaders} />}
        tableBody={
          <>
            {certificates.map((certificate) => (
              <tr className="group hover:bg-gray-50" key={certificate.id}>
                <CertificatePrimaryCell certificate={certificate} />
                <CertificateName certificate={certificate} />
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
