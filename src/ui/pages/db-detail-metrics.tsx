import { LoadResources } from "../shared";
import { ContainerMetricsChart } from "../shared/container-metrics-chart";
import { ContainerMetricsDataTable } from "../shared/container-metrics-table";
import {
  MetricHorizons,
  MetricTabTypes,
  MetricsHorizonControls,
  MetricsViewControls,
} from "../shared/metrics-controls";
import {
  fetchContainersByReleaseId,
  fetchEnvironmentServices,
  fetchRelease,
  fetchService,
  selectContainersByReleaseIdByLayerType,
  selectDatabaseById,
  selectServiceById,
} from "@app/deploy";
import { AppState } from "@app/types";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { useQuery } from "saga-query/react";

export function DatabaseMetricsPage() {
  const { id = "" } = useParams();
  const [viewTab, setViewTab] = useState<MetricTabTypes>("chart");
  const [viewHorizon, setViewHorizon] = useState<MetricHorizons>("1h");
  const db = useSelector((s: AppState) => selectDatabaseById(s, { id }));
  const query = useQuery(fetchEnvironmentServices({ id: db.environmentId }));
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: db.serviceId }),
  );
  useQuery(fetchService({ id: db.serviceId }));
  useQuery(fetchRelease({ id: service.currentReleaseId }));
  useQuery(fetchContainersByReleaseId({ releaseId: service.currentReleaseId }));
  const containers = useSelector((s: AppState) =>
    selectContainersByReleaseIdByLayerType(s, {
      layers: ["app", "database"],
      releaseId: service.currentReleaseId,
    }),
  );

  const dataToFetch = ["cpu_pct", "la", "memory_all", "iops", "fs"];
  return (
    <LoadResources query={query} isEmpty={false}>
      <div className="flex gap-4 justify-start">
        <MetricsViewControls
          viewMetricTab={viewTab}
          setViewMetricTab={setViewTab}
        />
        <MetricsHorizonControls
          viewHorizon={viewHorizon}
          setViewHorizon={setViewHorizon}
        />
      </div>
      {containers.map((container) => (
        <div className="my-4" key={container.id}>
          {viewTab === "chart" ? (
            <ContainerMetricsChart
              container={container}
              dataToFetch={dataToFetch}
              viewHorizon={viewHorizon}
            />
          ) : (
            <ContainerMetricsDataTable
              container={container}
              dataToFetch={dataToFetch}
              viewHorizon={viewHorizon}
            />
          )}
        </div>
      ))}
    </LoadResources>
  );
}

export const Component = DatabaseMetricsPage;
