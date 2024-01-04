import { fetchEndpointsByCertId } from "@app/deploy";
import { useQuery } from "@app/react";
import { useParams } from "react-router";
import { EndpointsByCert } from "../shared";

export const CertDetailEndpointsPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchEndpointsByCertId({ certId: id }));
  return <EndpointsByCert certId={id} />;
};
