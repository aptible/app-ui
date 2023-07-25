import { batchActions, useQuery } from "@app/fx";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import {
  fetchEnvironmentServices,
  fetchReleasesByServiceWithDeleted,
  selectAppById,
  selectReleasesByServiceAfterDate,
  selectServiceById,
} from "@app/deploy";
import { AppState, MetricHorizons } from "@app/types";

import { IconInfo, Loading, Tooltip } from "../shared";
import { ContainerMetricsChart } from "../shared/container-metrics-chart";
import { ContainerMetricsDataTable } from "../shared/container-metrics-table";
import {
  MetricTabTypes,
  MetricsHorizonControls,
  MetricsViewControls,
  metricHorizonAsSeconds,
} from "../shared/metrics-controls";
import { dateFromToday, secondsFromNow } from "@app/date";
import {
  fetchContainersByReleaseIdWithDeleted,
  selectContainersByReleaseIdsByLayerType,
} from "@app/deploy/container";
import { fetchMetricTunnelDataForContainer } from "@app/metric-tunnel";
import { useEffect, useState } from "react";
import { AnyAction } from "redux";

const maxDataSeries = 100;
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
    const horizonInSeconds = metricHorizonAsSeconds(metricHorizon);
    let requestsMade = 0;
    const actions: AnyAction[] = [];
    for (const container of containers) {
      if (requestsMade >= maxDataSeries) {
        break;
      }
      for (const metricName of metrics) {
        if (requestsMade >= maxDataSeries) {
          break;
        }
        // either fetch the current release OR ensure that the container was last updated within the time horizon
        if (
          container.releaseId === service.currentReleaseId ||
          container.updatedAt >= secondsFromNow(-horizonInSeconds).toISOString()
        ) {
          actions.push(
            fetchMetricTunnelDataForContainer({
              containerId: container.id,
              metricName,
              metricHorizon: metricHorizon,
              serviceId: service.id,
            }),
          );
          requestsMade += 1;
        }
      }
    }
    if (actions.length === 0) {
      return;
    }
    dispatch(batchActions(actions));
  }, [service.id, containerIds, metricHorizon]);

  if (!containers) {
    return <Loading />;
  }

  const chartWrapperClassName =
    containers.length > 2 ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-2";

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
        <Tooltip
          fluid
          text={`Showing up to ${maxDataSeries} data series (one per line on a line graph) worth of metrics.`}
        >
          <IconInfo className="h-5 mt-2 opacity-50 hover:opacity-100" />
        </Tooltip>
      </div>
      <div className="my-4">
        {viewTab === "chart" ? (
          <div className={`grid ${chartWrapperClassName} gap-4`}>
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
