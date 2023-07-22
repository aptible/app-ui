import { LoadResources, Loading } from "../shared";
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
  fetchEnvironmentServices,
  fetchReleasesByServiceWithDeleted,
  fetchService,
  selectContainersByReleaseIdsByLayerType,
  selectDatabaseById,
  selectReleasesAfterDate,
  selectServiceById,
} from "@app/deploy";
import { fetchMetricTunnelDataForContainer } from "@app/metric-tunnel";
import { AppState, MetricHorizons } from "@app/types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { AnyAction } from "redux";
import { batchActions } from "saga-query";
import { useQuery } from "saga-query/react";

const metrics = ["cpu_pct", "la", "memory_all", "iops", "fs"];
const layersToSearchForContainers = ["app", "database"];

export function DatabaseMetricsPage() {
  const { id = "" } = useParams();
  const [viewTab, setViewTab] = useState<MetricTabTypes>("chart");
  const [metricHorizon, setMetricHorizon] = useState<MetricHorizons>("1h");
  const db = useSelector((s: AppState) => selectDatabaseById(s, { id }));
  const query = useQuery(fetchEnvironmentServices({ id: db.environmentId }));
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: db.serviceId }),
  );
  const dispatch = useDispatch();
  useQuery(fetchService({ id: db.serviceId }));

  const releases = useSelector((s: AppState) =>
    selectReleasesAfterDate(s, {
      id: service.currentReleaseId,
      serviceId: service.id,
      date: dateFromToday(-7).toISOString(),
    }),
  );
  const releaseIds = releases.map((release) => release.id);

  useQuery(fetchReleasesByServiceWithDeleted({ serviceId: service.id }));
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
    <LoadResources query={query} isEmpty={false}>
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
              metricNames={["fs"]}
              metricHorizon={metricHorizon}
            />
            <ContainerMetricsChart
              containers={containers}
              metricNames={["iops"]}
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
    </LoadResources>
  );
}

export const Component = DatabaseMetricsPage;
