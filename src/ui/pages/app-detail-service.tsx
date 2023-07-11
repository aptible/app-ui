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

import { LoadResources } from "../shared";
import { ContainerMetricsDataTable } from "../shared/container-metrics-table";
import {
  fetchContainersByReleaseId,
  selectContainersByReleaseIdByLayerType,
} from "@app/deploy/container";

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
    selectContainersByReleaseIdByLayerType(s, {
      layers: ["app", "database"],
      releaseId: service.currentReleaseId,
    }),
  );

  const dataToFetch = ["cpu_pct", "la", "memory_all"];
  return (
    <LoadResources query={query} isEmpty={false}>
      {containers.map((container) => (
        <div className="my-2">
          <ContainerMetricsDataTable
            key={container.id}
            container={container}
            dataToFetch={dataToFetch}
          />
        </div>
      ))}
    </LoadResources>
  );
}
