import { EndpointsByCert } from "../shared";
import { fetchEndpointsByCertId } from "@app/deploy";
import { useParams } from "react-router";
import { useQuery } from "saga-query/react";

export const CertDetailEndpointsPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchEndpointsByCertId({ certId: id }));
  return <EndpointsByCert certId={id} />;
};
