import { batchActions, useQuery } from "@app/fx";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import {
  fetchEnvironmentServices,
  fetchReleasesByServiceWithDeleted,
  selectAppById,
  selectReleasesAfterDate,
  selectReleasesByServiceAfterDate,
  selectServiceById,
} from "@app/deploy";
import { AppState, MetricHorizons } from "@app/types";

import { Loading } from "../shared";
import { ContainerMetricsChart } from "../shared/container-metrics-chart";
import { ContainerMetricsDataTable } from "../shared/container-metrics-table";
import {
  MetricTabTypes,
  MetricsHorizonControls,
  MetricsViewControls,
} from "../shared/metrics-controls";
import { dateFromToday } from "@app/date";
import {
  fetchContainersByReleaseIdWithDeleted,
  selectContainersByReleaseIdsByLayerType,
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
  useQuery(fetchEnvironmentServices({ id: app.environmentId }));
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: serviceId }),
  );
  const dispatch = useDispatch();
  useQuery(fetchReleasesByServiceWithDeleted({ serviceId: service.id }));

  // we always go back exactly one week, though it might be a bit too far for some that way
  // we do not have to refetch this if the component state changes as this is fairly expensive
  const releases = useSelector((s: AppState) =>
    selectReleasesByServiceAfterDate(s, {
      serviceId,
      date: dateFromToday(-7).toISOString(),
    }),
  );
  const releaseIds = releases.map((release) => release.id);
  const containers = useSelector((s: AppState) =>
    selectContainersByReleaseIdsByLayerType(s, {
      layers: layersToSearchForContainers,
      releaseIds,
    }),
  );

  const containerIds = containers
    .map((container) => container.id)
    .sort()
    .join("-");

  useEffect(() => {
    const actions: AnyAction[] = [];
    releaseIds.map((releaseId) => {
      actions.push(fetchContainersByReleaseIdWithDeleted({ releaseId }));
    });
    if (actions.length === 0) {
      return;
    }
    dispatch(batchActions(actions));
  }, [releaseIds.join("-")]);

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
        {viewTab === "chart" ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <ContainerMetricsChart
              containers={containers}
              metricNames={["cpu_pct"]}
              metricHorizon={metricHorizon}
            />
            <ContainerMetricsChart
              containers={containers}
              metricNames={["memory_all"]}
              metricHorizon={metricHorizon}
            />
            <ContainerMetricsChart
              containers={containers}
              metricNames={["la"]}
              metricHorizon={metricHorizon}
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

export const Component = AppDetailServicePage;
