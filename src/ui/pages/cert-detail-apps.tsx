import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { useQuery } from "saga-query/react";

import {
  fetchAppsByCertId,
  fetchEndpointsByCertId,
  selectAppsByCertId,
  selectCertificateById,
} from "@app/deploy";
import { AppState } from "@app/types";
import { AppList, AppsResourceHeaderTitleBar } from "../shared";

export const CertDetailAppsPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchAppsByCertId({ certId: id }));
  useQuery(fetchEndpointsByCertId({ certId: id }));

  const cert = useSelector((s: AppState) => selectCertificateById(s, { id }));
  const apps = useSelector((s: AppState) =>
    selectAppsByCertId(s, {
      certId: id,
      envId: cert.environmentId,
    }),
  );

  const titleBar = (
    <AppsResourceHeaderTitleBar apps={apps} resourceHeaderType="simple-text" />
  );
  return <AppList apps={apps} headerTitleBar={titleBar} />;
};
