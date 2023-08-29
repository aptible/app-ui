import { fetchEndpointsByCertId } from "@app/deploy";
import { useParams } from "react-router";
import { useQuery } from "saga-query/react";
import { EndpointsByCert } from "../shared";

export const CertDetailEndpointsPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchEndpointsByCertId({ certId: id }));
  return <EndpointsByCert certId={id} />;
};
