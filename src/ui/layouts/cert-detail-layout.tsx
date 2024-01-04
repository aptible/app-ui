import {
  cancelPollCert,
  fetchEnvironmentById,
  pollCert,
  selectCertificateById,
  selectEnvironmentById,
} from "@app/deploy";
import { useLoader, useQuery, useSelector } from "@app/react";
import {
  certDetailAppsUrl,
  certDetailEndpointsUrl,
  certDetailSettingsUrl,
  environmentCertificatesUrl,
} from "@app/routes";
import type { DeployCertificate } from "@app/types";
import { useMemo } from "react";
import { Outlet, useParams } from "react-router-dom";
import { usePoller } from "../hooks";
import {
  CertIssuer,
  CertManagedHTTPSPill,
  CertTrustedPill,
  CertValidDateRange,
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  TabItem,
} from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";

function CertHeader({ cert }: { cert: DeployCertificate }) {
  return (
    <DetailHeader>
      <DetailTitleBar
        title="Certificate Details"
        icon={
          <img
            src={"/resource-types/logo-vhost.png"}
            className="w-[32px] h-[32px] mr-3"
            aria-label="Certificate"
          />
        }
        docsUrl="https://www.aptible.com/docs/custom-certificate"
      />

      <DetailInfoGrid>
        <DetailInfoItem title="ID">{cert.id}</DetailInfoItem>
        <DetailInfoItem title="Certificate">{cert.commonName}</DetailInfoItem>
        <DetailInfoItem title="Date Range">
          <CertValidDateRange cert={cert} />
        </DetailInfoItem>
        <DetailInfoItem title="Issuer">
          <CertIssuer cert={cert} />
        </DetailInfoItem>

        <DetailInfoItem title="Trust Status">
          <div className="flex items-center gap-2">
            <CertTrustedPill cert={cert} />
            <CertManagedHTTPSPill cert={cert} />
          </div>
        </DetailInfoItem>
      </DetailInfoGrid>
    </DetailHeader>
  );
}

function CertPageHeader() {
  const { id = "" } = useParams();
  const action = useMemo(() => pollCert({ id }), [id]);
  const cancel = useMemo(() => cancelPollCert(), []);
  usePoller({ action, cancel });
  const cert = useSelector((s) => selectCertificateById(s, { id }));
  useQuery(fetchEnvironmentById({ id: cert.environmentId }));
  const env = useSelector((s) =>
    selectEnvironmentById(s, { id: cert.environmentId }),
  );
  const loader = useLoader(action);

  const crumbs = [
    { name: env.handle, to: environmentCertificatesUrl(cert.environmentId) },
  ];
  const tabs: TabItem[] = [
    { name: "Apps", href: certDetailAppsUrl(cert.id) },
    { name: "Endpoints", href: certDetailEndpointsUrl(cert.id) },
    { name: "Settings", href: certDetailSettingsUrl(cert.id) },
  ];
  return (
    <DetailPageHeaderView
      {...loader}
      breadcrumbs={crumbs}
      title={cert.commonName}
      detailsBox={<CertHeader cert={cert} />}
      tabs={tabs}
    />
  );
}

export const CertDetailLayout = () => {
  return (
    <AppSidebarLayout header={<CertPageHeader />}>
      <Outlet />
    </AppSidebarLayout>
  );
};
