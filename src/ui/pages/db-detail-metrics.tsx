import { dateFromToday } from "@app/date";
import {
  calcMetrics,
  fetchDatabase,
  fetchEnvironmentServices,
  fetchService,
  selectContainersByCurrentReleaseAndHorizon,
  selectDatabaseById,
  selectReleasesByServiceAfterDate,
  selectServiceById,
} from "@app/deploy";
import {
  fetchAllMetricsByServiceId,
  selectMetricsLoaded,
} from "@app/metric-tunnel";
import { AppState, MetricHorizons } from "@app/types";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { useQuery } from "saga-query/react";
import { LoadResources, Loading, LoadingSpinner } from "../shared";
import { ContainerMetricsChart } from "../shared/container-metrics-chart";
import { ContainerMetricsDataTable } from "../shared/container-metrics-table";
import {
  MetricTabTypes,
  MetricsHorizonControls,
  MetricsViewControls,
  metricHorizonAsSeconds,
} from "../shared/metrics-controls";

const layersToSearchForContainers = ["database"];

export function DatabaseMetricsPage() {
  const { id = "" } = useParams();
  const [viewTab, setViewTab] = useState<MetricTabTypes>("chart");
  const [metricHorizon, setMetricHorizon] = useState<MetricHorizons>("1h");
  useQuery(fetchDatabase({ id }));
  const db = useSelector((s: AppState) => selectDatabaseById(s, { id }));
  const query = useQuery(fetchEnvironmentServices({ id: db.environmentId }));
  const serviceId = db.serviceId;
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: serviceId }),
  );
  useQuery(fetchService({ id: serviceId }));

  const metrics: any[] = ["cpu_pct", "la", "memory_all", "iops", "fs"];
  const loader = useQuery(
    fetchAllMetricsByServiceId({
      serviceId,
      metrics,
      metricHorizon,
    }),
  );
  const metricsLoaded = useSelector((s: AppState) =>
    selectMetricsLoaded(s, {
      serviceId,
      metricHorizon,
    }),
  );

  // we always go back exactly one week, though it might be a bit too far for some that way
  // we do not have to refetch this if the component state changes as this is fairly expensive
  const releases = useSelector((s: AppState) =>
    selectReleasesByServiceAfterDate(s, {
      serviceId,
      date: dateFromToday(-7).toISOString(),
    }),
  );
  const releaseIds = releases.map((release) => release.id);
  const horizonInSeconds = metricHorizonAsSeconds(metricHorizon);
  const containers = useSelector((s: AppState) =>
    selectContainersByCurrentReleaseAndHorizon(s, {
      layers: layersToSearchForContainers,
      releaseIds,
      horizonInSeconds,
      currentReleaseId: service.currentReleaseId,
    }),
  );
  const totalRequests = containers.length * metrics.length;
  const pct = ((metricsLoaded / totalRequests) * 100).toFixed(2);
  const { totalCPU } = calcMetrics([service]);

  if (!containers) {
    return <Loading />;
  }

  return (
    <LoadResources query={query} isEmpty={false}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <MetricsViewControls
            viewMetricTab={viewTab}
            setViewMetricTab={setViewTab}
          />
          <MetricsHorizonControls
            viewHorizon={metricHorizon}
            setViewHorizon={setMetricHorizon}
          />
        </div>

        {loader.isLoading ? (
          <div className="flex gap-2">
            <span className="text-black-500">{pct}%</span>
            <LoadingSpinner color="#595E63" />
          </div>
        ) : null}
      </div>
      <div className="my-4">
        {viewTab === "chart" ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <ContainerMetricsChart
              containers={containers}
              limit={`${totalCPU * 100}% CPU`}
              metricNames={["cpu_pct"]}
              metricHorizon={metricHorizon}
              helpText="Total amount of CPU your container has used from the host system."
              yAxisLabel="CPU Usage (%)"
              yAxisUnit="%"
            />
            <ContainerMetricsChart
              containers={containers}
              limit={`${service.containerMemoryLimitMb} MB`}
              metricNames={["memory_all"]}
              metricHorizon={metricHorizon}
              helpText="Total amount of memory your container has requested from the host system."
              yAxisLabel="Memory Usage (MB)"
              yAxisUnit=" MB"
            />
            <ContainerMetricsChart
              containers={containers}
              metricNames={["fs"]}
              metricHorizon={metricHorizon}
              helpText="Total used disk space compared to total available space. A small amount is reserved for usage by the system."
              yAxisLabel="Disk Usage (GB)"
              yAxisUnit=" GB"
            />
            <ContainerMetricsChart
              containers={containers}
              metricNames={["iops"]}
              metricHorizon={metricHorizon}
              helpText="IO activity of your database, compared to the baseline performance of its underlying volume."
              yAxisLabel="IOPS (#)"
            />
            <ContainerMetricsChart
              containers={containers}
              metricNames={["la"]}
              metricHorizon={metricHorizon}
              helpText="Total runnable and blocked tasks (threads) in your container."
              yAxisLabel="Load Average (#)"
            />
          </div>
        ) : (
          <ContainerMetricsDataTable
            containers={containers}
            metricHorizon={metricHorizon}
          />
        )}
      </div>
    </LoadResources>
  );
}

export const Component = DatabaseMetricsPage;
