import {
  fetchAppsByCertId,
  fetchEndpointsByCertId,
  selectCertificateById,
} from "@app/deploy";
import { useQuery } from "@app/fx";
import { AppState } from "@app/types";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { AppListByCertificate } from "../shared";

export const CertDetailAppsPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchAppsByCertId({ certId: id }));
  useQuery(fetchEndpointsByCertId({ certId: id }));
  const cert = useSelector((s: AppState) => selectCertificateById(s, { id }));
  return <AppListByCertificate certId={id} envId={cert.environmentId} />;
};
