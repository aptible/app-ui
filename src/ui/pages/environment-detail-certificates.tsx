import { ReactElement, useEffect, useState } from "react";
import { useParams } from "react-router";
import { useCache, useQuery } from "saga-query/react";

import type { AppState, DeployCertificate, HalEmbedded } from "@app/types";

import {
  Box,
  ButtonIcon,
  IconPlusCircle,
  InputSearch,
  LoadResources,
} from "../shared";
import {
  fetchCertificates,
  selectAppsByCertificateId,
  selectCertificatesByEnvId,
  selectEndpointByEnvironmentAndCertificateId,
} from "@app/deploy";
import { useSelector } from "react-redux";
import { prettyEnglishDate } from "@app/date";
import { Link } from "react-router-dom";
import { appServicesUrl } from "@app/routes";
import cn from "classnames";

const CertificateTrustedPill = ({
  certificate,
}: {
  certificate: DeployCertificate;
}): ReactElement => {
  const className = cn(
    "rounded-full border-2",
    "text-sm font-semibold ",
    "px-2 flex justify-between items-center w-fit",
  );

  return (
    <div
      className={cn(
        className,
        certificate.trusted
          ? "bg-lime-100 text-green-400 border-lime-300"
          : "bg-red-100 text-red-400 border-red-300",
      )}
    >
      <div>{certificate.trusted ? "Trusted" : "Untrusted"}</div>
    </div>
  );
};

const ManagedHTTPSPill = ({
  certificate,
}: {
  certificate: DeployCertificate;
}): ReactElement | null => {
  return certificate.acme ? (
    <div
      className={cn(
        "rounded-full border-2",
        "text-sm font-semibold ",
        "px-2 flex justify-between items-center w-fit",
        "bg-lime-100 text-green-400 border-lime-300",
      )}
    >
      )<div>Managed HTTPS</div>
    </div>
  ) : null;
};

const CertificateBox = ({
  certificate,
  envId,
}: { certificate: DeployCertificate; envId: string }): ReactElement => {
  const appsForCertificate = useSelector((s: AppState) =>
    selectAppsByCertificateId(s, { envId, certificateId: certificate.id }),
  );
  const endpointsForCertificate = useSelector((s: AppState) =>
    selectEndpointByEnvironmentAndCertificateId(s, {
      certificateId: certificate.id,
      envId: envId,
    }),
  );

  return (
    <Box key={certificate.id}>
      <div className="flex w-1/1">
        <div className="flex-col w-1/2">
          <h1 className="text-lg text-gray-500 flex">
            <span className="mr-2">
              {endpointsForCertificate?.[0]?.externalHost || ""}
            </span>
            <CertificateTrustedPill certificate={certificate} />
            <ManagedHTTPSPill certificate={certificate} />
          </h1>
          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-900">Valid</h3>
            <p>
              {prettyEnglishDate(certificate.notBefore)} -{" "}
              {prettyEnglishDate(certificate.notAfter)}
            </p>
          </div>
          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-900">Issuer</h3>
            <p>{certificate.issuerCommonName || "Unknown Issuer"}</p>
          </div>
          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-900">
              Fingerprint
            </h3>
            {certificate.sha256Fingerprint || "00000000"}
          </div>
        </div>
        <div className="flex-col w-1/2">
          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-900">Apps</h3>
            {appsForCertificate.map((app) => (
              <p className="text-blue-500" key={app.id}>
                <Link to={appServicesUrl(app.id)}>{app.handle}</Link>
              </p>
            ))}
          </div>
        </div>
      </div>
    </Box>
  );
};

export const EnvironmentCertificatesPage = () => {
  const [search, setSearch] = useState("");
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(ev.currentTarget.value);

  const { id = "" } = useParams();
  const query = useQuery(fetchCertificates({ id }));
  const certificates = useSelector((s: AppState) =>
    selectCertificatesByEnvId(s, { envId: id }),
  );

  return (
    <LoadResources query={query} isEmpty={certificates.length === 0}>
      <div className="mt-4">
        <div className="flex justify-between w-100">
          <div className="flex w-1/2">
            <ButtonIcon icon={<IconPlusCircle />}>New Certificate</ButtonIcon>
          </div>
          <div className="flex w-1/2 justify-end">
            <InputSearch
              className="self-end float-right]"
              placeholder="Search certificates ..."
              search={search}
              onChange={onChange}
            />
          </div>
        </div>
      </div>
      <div className="mb-4">
        {!certificates.length ? (
          <p className="mt-4">You do not have any certificates to show.</p>
        ) : (
          certificates.map((certificate) => {
            return (
              <CertificateBox
                key={certificate.id}
                certificate={certificate}
                envId={id}
              />
            );
          })
        )}
      </div>
    </LoadResources>
  );
};
