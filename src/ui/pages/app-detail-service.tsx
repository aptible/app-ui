import { batchActions, useQuery } from "@app/fx";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import {
  fetchEnvironmentServices,
  fetchRelease,
  selectAppById,
  selectServiceById,
} from "@app/deploy";
import { AppState, MetricHorizons } from "@app/types";

import { LoadResources, Loading } from "../shared";
import { ContainerMetricsChart } from "../shared/container-metrics-chart";
import { ContainerMetricsDataTable } from "../shared/container-metrics-table";
import {
  MetricTabTypes,
  MetricsHorizonControls,
  MetricsViewControls,
} from "../shared/metrics-controls";
import {
  fetchContainersByReleaseId,
  selectContainersByReleaseIdByLayerType,
} from "@app/deploy/container";
import { fetchMetricTunnelDataForContainer } from "@app/metric-tunnel";
import { useEffect, useState } from "react";
import { AnyAction } from "redux";

const metrics = ["cpu_pct", "la", "memory_all"];
const layersToSearchForContainers = ["app", "database"];

export function AppDetailServicePage() {
  const { id = "", serviceId = "" } = useParams();
  const [viewTab, setViewTab] = useState<MetricTabTypes>("chart");
  const [metricHorizon, setMetricHorizon] = useState<MetricHorizons>("1h");
  const app = useSelector((s: AppState) => selectAppById(s, { id }));
  const query = useQuery(fetchEnvironmentServices({ id: app.environmentId }));
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: serviceId }),
  );
  const dispatch = useDispatch();
  useQuery(fetchRelease({ id: service.currentReleaseId }));
  useQuery(fetchContainersByReleaseId({ releaseId: service.currentReleaseId }));
  const containers = useSelector((s: AppState) =>
    selectContainersByReleaseIdByLayerType(s, {
      layers: layersToSearchForContainers,
      releaseId: service.currentReleaseId,
    }),
  );

  const containerIds = [...containers]
    .sort()
    .map((container) => container.id)
    .join("-");

  useEffect(() => {
    const actions: AnyAction[] = [];
    containers.forEach((container) =>
      metrics.forEach((metricName) => {
        actions.push(
          fetchMetricTunnelDataForContainer({
            containerId: container.id,
            metricName,
            metricHorizon: metricHorizon,
            serviceId: service.id,
          }),
        );
      }),
    );
    if (actions.length === 0) {
      return;
    }
    dispatch(batchActions(actions));
  }, [service.id, containerIds, metricHorizon]);

  if (!containers) {
    return <Loading />;
  }

  return (
    <>
      <div className="flex gap-4 justify-start">
        <MetricsViewControls
          viewMetricTab={viewTab}
          setViewMetricTab={setViewTab}
        />
        <MetricsHorizonControls
          viewHorizon={metricHorizon}
          setViewHorizon={setMetricHorizon}
        />
      </div>
      <div className="my-4">
        <LoadResources query={query} isEmpty={false}>
          {viewTab === "chart" ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <ContainerMetricsChart
                containers={containers}
                metricNames={["cpu_pct"]}
                metricHorizon={metricHorizon}
              />
              <ContainerMetricsChart
                containers={containers}
                metricNames={["la"]}
                metricHorizon={metricHorizon}
              />
              <ContainerMetricsChart
                containers={containers}
                metricNames={["memory_all"]}
                metricHorizon={metricHorizon}
              />
            </div>
          ) : (
            <ContainerMetricsDataTable
              containers={containers}
              metricHorizon={metricHorizon}
            />
          )}
        </LoadResources>
      </div>
    </>
  );
}

export const Component = AppDetailServicePage;
