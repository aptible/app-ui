import { useParams } from "react-router";
import { useQuery } from "saga-query/react";

import { fetchLogDrains, fetchMetricDrains } from "@app/deploy";

export const EnvironmentIntegrationsPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchMetricDrains({ id }));
  useQuery(fetchLogDrains({ id }));

  return null;
};
