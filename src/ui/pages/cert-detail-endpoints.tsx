import { EndpointList } from "../shared";
import {
  fetchEndpointsByCertId,
  selectCertificateById,
  selectEndpointsByCertificateId,
} from "@app/deploy";
import { AppState } from "@app/types";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { useQuery } from "saga-query/react";

export const CertDetailEndpointsPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchEndpointsByCertId({ certId: id }));
  const cert = useSelector((s: AppState) => selectCertificateById(s, { id }));
  const endpoints = useSelector((s: AppState) =>
    selectEndpointsByCertificateId(s, {
      certificateId: id,
      envId: cert.environmentId,
    }),
  );
  return <EndpointList exposedPorts={[]} endpoints={endpoints} />;
};
