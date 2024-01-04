import {
  fetchAppsByCertId,
  fetchEndpointsByCertId,
  selectCertificateById,
} from "@app/deploy";
import { useQuery, useSelector } from "@app/react";
import { useParams } from "react-router";
import { AppListByCertificate } from "../shared";

export const CertDetailAppsPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchAppsByCertId({ certId: id }));
  useQuery(fetchEndpointsByCertId({ certId: id }));
  const cert = useSelector((s) => selectCertificateById(s, { id }));
  return <AppListByCertificate certId={id} envId={cert.environmentId} />;
};
