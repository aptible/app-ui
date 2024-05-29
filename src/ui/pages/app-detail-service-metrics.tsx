import { dateFromToday } from "@app/date";
import {
  calcMetrics,
  fetchApp,
  selectReleasesByServiceAfterDate,
  selectServiceById,
} from "@app/deploy";
import { selectContainersByCurrentReleaseAndHorizon } from "@app/deploy";
import {
  fetchAllMetricsByServiceId,
  metricHorizonAsSeconds,
  selectMetricsLoaded,
} from "@app/metric-tunnel";
import { useQuery, useSelector } from "@app/react";
import type { MetricHorizons } from "@app/types";
import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  ContainerMetricsChart,
  ContainerMetricsDataTable,
  Loading,
  LoadingSpinner,
  type MetricTabTypes,
  MetricsHorizonControls,
  MetricsViewControls,
} from "../shared";

const layersToSearchForContainers = ["app"];

export function AppDetailServiceMetricsPage() {
  const { id = "", serviceId = "" } = useParams();
  const [viewTab, setViewTab] = useState<MetricTabTypes>("chart");
  const [metricHorizon, setMetricHorizon] = useState<MetricHorizons>("1h");
  useQuery(fetchApp({ id: id }));
  const metrics: any[] = ["cpu_pct", "la", "memory_all"];
  const loader = useQuery(
    fetchAllMetricsByServiceId({
      serviceId,
      metrics,
      metricHorizon,
    }),
  );
  const metricsLoaded = useSelector((s) =>
    selectMetricsLoaded(s, {
      serviceId,
      metricHorizon,
    }),
  );
  const service = useSelector((s) => selectServiceById(s, { id: serviceId }));

  // we always go back exactly one week, though it might be a bit too far for some that way
  // we do not have to refetch this if the component state changes as this is fairly expensive
  const releases = useSelector((s) =>
    selectReleasesByServiceAfterDate(s, {
      id: serviceId,
      date: dateFromToday(-7).toISOString(),
    }),
  );
  const releaseIds = releases.map((release) => release.id);
  const horizonInSeconds = metricHorizonAsSeconds(metricHorizon);
  const containers = useSelector((s) =>
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

  if (!containers.length) {
    return <Loading />;
  }

  const chartWrapperClassName =
    containers.length > 2 ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-2";

  return (
    <>
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
          <div className="flex gap-2 items-center">
            <span className="text-black-500">{pct}%</span>
            <LoadingSpinner color="#595E63" />
          </div>
        ) : null}
      </div>
      <div className="my-4">
        {viewTab === "chart" ? (
          <div className={`grid ${chartWrapperClassName} gap-4`}>
            <ContainerMetricsChart
              containers={containers}
              limit={`${totalCPU * 100}% CPU`}
              metricNames={["cpu_pct"]}
              metricHorizon={metricHorizon}
              helpText="Total amount of CPU your container has used from the host system."
              yAxisUnit="%"
            />
            <ContainerMetricsChart
              containers={containers}
              metricNames={["memory_all"]}
              limit={`${service.containerMemoryLimitMb} MB`}
              metricHorizon={metricHorizon}
              helpText="Total amount of memory your container has requested from the host system."
              yAxisUnit=" MB"
            />
            <ContainerMetricsChart
              containers={containers}
              metricNames={["la"]}
              metricHorizon={metricHorizon}
              helpText="Total runnable and blocked tasks (threads) in your container."
            />
          </div>
        ) : (
          <ContainerMetricsDataTable
            containers={containers}
            metricHorizon={metricHorizon}
          />
        )}
      </div>
    </>
  );
}

export const Component = AppDetailServiceMetricsPage;
