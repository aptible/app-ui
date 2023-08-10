import { Navigate, useParams } from "react-router";

import { certDetailAppsUrl } from "@app/routes";

export const CertDetailPage = () => {
  const { id = "" } = useParams();
  return <Navigate replace to={certDetailAppsUrl(id)} />;
};
