import { useQuery } from "@app/fx";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import {
  fetchEnvironmentServices,
  fetchRelease,
  selectAppById,
  selectServiceById,
} from "@app/deploy";
import { AppState } from "@app/types";

import { DetailPageSections, LoadResources, ServicesOverview } from "../shared";
import {
  fetchContainersByReleaseId,
  selectContainersByReleaseId,
} from "@app/deploy/container";
import { fetchMetricTunnelForAppCpu } from "@app/metric-tunnel";

export function AppDetailServicePage() {
  const { id = "", serviceId = "" } = useParams();
  const app = useSelector((s: AppState) => selectAppById(s, { id }));
  const query = useQuery(fetchEnvironmentServices({ id: app.environmentId }));
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: serviceId }),
  );
  useQuery(fetchRelease({ id: service.currentReleaseId }));
  useQuery(fetchContainersByReleaseId({ releaseId: service.currentReleaseId }));
  const containers = useSelector((s: AppState) =>
    selectContainersByReleaseId(s, { releaseId: service.currentReleaseId }),
  );
  // useCache(fetchMetricTunnelForAppCpu({ containerId: }))

  return (
    <LoadResources query={query} isEmpty={false}>
      Metrics
    </LoadResources>
  );
}
