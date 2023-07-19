import { metricTunnelApi } from "@app/api";
import { createReducerMap, createTable } from "@app/slice-helpers";
import {
  AppState,
  ContainerMetrics,
  DeployContainer,
  MetricHorizons,
} from "@app/types";
import { createSelector } from "@reduxjs/toolkit";
import { put } from "saga-query";

export interface MetricTunnelContainerResponse {
  columns: (string | null | number)[][];
}

export type Dataset = {
  label?: string;
  pointRadius?: number;
  pointHoverRadius?: number;
  data: number[];
};
export type ChartToCreate = {
  title: string;
  labels?: string[];
  datasets?: Dataset[];
};
const metricLabelForMemoryLabelsByContainer = (containerId: string) => [
  `${containerId} (rss + buffers/cache)`,
  `${containerId} (rss)`,
];
const chartTitles: { [key: string]: string[] } = {
  Memory: ["memory_all"],
  CPU: ["cpu_pct"],
  "File System": ["fs"],
  IOPS: ["iops"],
  "Load Average": ["la"],
};

const getContainerMetricsId = ({
  containerId,
  metricName,
  metricLabel,
  metricHorizon,
}: {
  containerId: string;
  metricName: string;
  metricLabel: string;
  metricHorizon: MetricHorizons;
}): string => `${containerId}-${metricName}-${metricLabel}-${metricHorizon}`;

// partial generator for ts object of containermetrics
interface ContainerMetricPayload {
  containerId: string;
  metricName: string;
  metricHorizon: MetricHorizons;
  payload: MetricTunnelContainerResponse;
  serviceId: string;
}
export const deserializeContainerMetricsResponse = ({
  containerId,
  metricName,
  metricHorizon: metricTimeRange,
  payload,
  serviceId,
}: ContainerMetricPayload): { [key: string]: ContainerMetrics } => {
  const result: { [key: string]: ContainerMetrics } = {};
  const dateColumn = payload.columns.find((column) => column?.[0] === "time_0");
  if (!dateColumn) {
    return result;
  }

  const dateData: string[] = dateColumn.slice(1) as string[];
  payload.columns.forEach((column) => {
    let id = "";
    const containerMetric: ContainerMetrics = {
      containerId,
      id,
      serviceId,
      metricName,
      metricLabel: "",
      metricTimeRange,
      values: [],
    };
    column.forEach((row, rowNumber) => {
      if (row !== "time_0" && row !== "time_1") {
        if (rowNumber === 0 && typeof row === "string") {
          id = getContainerMetricsId({
            containerId,
            metricName,
            metricLabel: row,
            metricHorizon: metricTimeRange,
          });
          containerMetric.metricLabel = row;
        } else if (row !== null && typeof row === "number") {
          containerMetric.values.push({
            date: dateData?.[rowNumber] || "",
            value: row,
          });
        }
      }
    });
    containerMetric.id = id;
    if (id === "") {
      return;
    }
    result[id] = containerMetric;
  });
  return result;
};

const METRIC_TUNNEL_CONTAINER_METRICS = "containerMetrics";
const slice = createTable<ContainerMetrics>({
  name: METRIC_TUNNEL_CONTAINER_METRICS,
});
export const { add: addContainerMetrics } = slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => s[METRIC_TUNNEL_CONTAINER_METRICS],
);
// TODO - come back for must() if needed
const { selectTableAsList: selectContainerMetricsAsList } = selectors;
export const selectMetricsByContainer = createSelector(
  selectContainerMetricsAsList,
  (_: AppState, p: { containerId: string }) => p.containerId,
  (containerMetrics, containerId) =>
    containerMetrics.find(
      (containerMetric) => containerMetric.containerId === containerId,
    ),
);
export const selectMetricsByMetricContainerHorizon = createSelector(
  selectContainerMetricsAsList,
  (_: AppState, p: { containerId: string }) => p.containerId,
  (_: AppState, p: { metricName: string }) => p.metricName,
  (_: AppState, p: { metricHorizon: MetricHorizons }) => p.metricHorizon,
  (containerMetrics, containerId, metricName, metricHorizon) =>
    containerMetrics.find(
      (containerMetric) =>
        containerMetric.containerId === containerId &&
        containerMetric.metricName === metricName &&
        containerMetric.metricTimeRange === metricHorizon,
    ),
);
export const selectChartDataByMetricsToChartToCreate = createSelector(
  selectContainerMetricsAsList,
  (_: AppState, p: { containerId: string }) => p.containerId,
  (_: AppState, p: { metricNames: string[] }) => p.metricNames,
  (_: AppState, p: { metricHorizon: MetricHorizons }) => p.metricHorizon,
  (
    containerMetrics,
    containerId,
    metricNames,
    metricHorizon,
  ): ChartToCreate => {
    let title = "";
    for (const [chartTitle, chartTitleMetricNames] of Object.entries(
      chartTitles,
    )) {
      if (
        metricNames.filter((metricName) =>
          chartTitleMetricNames.includes(metricName),
        ).length > 0
      ) {
        title = chartTitle;
        break;
      }
    }
    if (title === "") {
      return {
        title,
      };
    }
    const result: ChartToCreate = {
      title,
    };
    const metrics = containerMetrics.filter(
      (containerMetric) =>
        containerMetric.containerId === containerId &&
        metricNames.includes(containerMetric.metricName) &&
        containerMetric.metricTimeRange === metricHorizon,
    );
    if (metrics.length === 0) {
      return result;
    }
    // all metrics use the same exact time horizon and currently are sent by the backend
    // with identical tick counts
    const labels: string[] = [];
    const datasets: Dataset[] = [];
    metrics.forEach((metric, idx) => {
      const dataset: Dataset = {
        label: metric.metricLabel,
        pointRadius: 0,
        pointHoverRadius: 5,
        data: [],
      };
      metric.values.forEach((metricValue) => {
        if (idx === 0) {
          labels.push(metricValue.date);
        }
        dataset.data.push(metricValue.value);
      });
      datasets.push(dataset);
    });
    result.labels = labels;
    result.datasets = datasets;
    return result;
  },
);

export const reducers = createReducerMap(slice);

const getUtc = (): number => {
  return Date.now();
};

export const fetchMetricTunnelDataForContainer = metricTunnelApi.get<
  Omit<ContainerMetricPayload, "payload">,
  MetricTunnelContainerResponse
>(
  `/proxy/:containerId?horizon=:metricHorizon&ts=${getUtc()}&metric=:metricName&requestedTicks=600`,
  function* (ctx, next) {
    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    const containerMetrics = deserializeContainerMetricsResponse({
      payload: ctx.json.data,
      ...ctx.payload,
    });

    yield* put(addContainerMetrics(containerMetrics));
  },
);
