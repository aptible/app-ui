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
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { Link } from "react-router-dom";
import { usePaginate } from "../hooks";
import {
  ActionBar,
  ButtonSensitive,
  CertIssuer,
  CertManagedHTTPSPill,
  CertTrustedPill,
  CertValidDateRange,
  DescBar,
  EmptyTr,
  FilterBar,
  Group,
  IconPlusCircle,
  PaginateBar,
  TBody,
  THead,
  Table,
  Td,
  Th,
  Tr,
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

export const EnvironmentCertificatesPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  useQuery(fetchAllCertsByEnvId({ id }));
  const certificates = useSelector((s: AppState) =>
    selectCertificatesByEnvId(s, { envId: id }),
  );
  const createCert = () => {
    navigate(environmentCreateCertUrl(id));
  };

  const paginated = usePaginate(certificates);

  return (
    <Group>
      <FilterBar>
        <div className="mb-1">
          <ActionBar>
            <ButtonSensitive className="w-fit" envId={id} onClick={createCert}>
              <IconPlusCircle variant="sm" className="mr-1" /> New Certificate
            </ButtonSensitive>
          </ActionBar>
        </div>

        <Group variant="horizontal" size="lg" className="items-center">
          <DescBar>{paginated.totalItems} Certificates</DescBar>
          <PaginateBar {...paginated} />
        </Group>
      </FilterBar>

      <Table>
        <THead>
          <Th variant="center">ID</Th>
          <Th>Certificate</Th>
          <Th>Date Range</Th>
          <Th>Issuer</Th>
          <Th variant="center">Apps</Th>
          <Th variant="center">Status</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={6} /> : null}
          {paginated.data.map((certificate) => (
            <Tr key={certificate.id}>
              <CertificatePrimaryCell certificate={certificate} />
              <CertificateName certificate={certificate} />
              <CertificateValidDateRangeCell certificate={certificate} />
              <CertificateIssuerCell certificate={certificate} />
              <CertificateServicesCell certificate={certificate} />
              <CertificateStatusCell certificate={certificate} />
            </Tr>
          ))}
        </TBody>
      </Table>
    </Group>
  );
};
