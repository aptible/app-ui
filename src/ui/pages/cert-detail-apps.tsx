import {
  fetchAppsByCertId,
  fetchEndpointsByCertId,
  selectCertificateById,
} from "@app/deploy";
import { AppState } from "@app/types";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { useQuery } from "saga-query/react";
import { AppListByCertificate } from "../shared";

export const CertDetailAppsPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchAppsByCertId({ certId: id }));
  useQuery(fetchEndpointsByCertId({ certId: id }));
  const cert = useSelector((s: AppState) => selectCertificateById(s, { id }));
  return <AppListByCertificate certId={id} envId={cert.environmentId} />;
};
