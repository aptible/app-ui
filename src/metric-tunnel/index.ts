import { cacheTimer, metricTunnelApi, thunks } from "@app/api";
import { dateFromToday } from "@app/date";
import {
  fetchContainersByReleaseIdWithDeleted,
  fetchReleasesByServiceWithDeleted,
  selectContainersByCurrentReleaseAndHorizon,
  selectReleasesByServiceAfterDate,
  selectServiceById,
} from "@app/deploy";
import { createReducerMap, createTable } from "@app/slice-helpers";
import { AppState, ContainerMetrics, MetricHorizons } from "@app/types";
import { metricHorizonAsSeconds } from "@app/ui/shared/metrics-controls";
import { createSelector } from "@reduxjs/toolkit";
import {
  all,
  call,
  delay,
  put,
  select,
  selectLoaders,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
  takeLeading,
} from "saga-query";

export interface MetricTunnelContainerResponse {
  columns: (string | null | number)[][];
}

export type Dataset = {
  label?: string;
  pointRadius?: number;
  pointHoverRadius?: number;
  data: (number | { x: string | number; y: number })[];
};
export type ChartToCreate = {
  title: string;
  labels?: string[];
  datasets?: Dataset[];
};
export type FlatTableOfMetricsData = {
  [metric: string]: (number | string)[];
  time: string[];
};

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

export const selectMetricDataAsFlatTableByContainer = createSelector(
  selectContainerMetricsAsList,
  (_: AppState, p: { containerIds: string[] }) => p.containerIds,
  (_: AppState, p: { metricHorizon: MetricHorizons }) => p.metricHorizon,
  (containerMetrics, containerIds, metricHorizon): FlatTableOfMetricsData => {
    const result: FlatTableOfMetricsData = {
      time: [],
    };
    containerMetrics
      .filter(
        (containerMetric: ContainerMetrics) =>
          containerIds.includes(containerMetric.containerId) &&
          containerMetric.metricTimeRange === metricHorizon,
      )
      .forEach((containerMetric: ContainerMetrics, idx) => {
        if (idx === 0) {
          result.time = containerMetric.values.map((elem) => elem.date);
        }
        result[
          `${containerMetric.metricName} - ${containerMetric.metricLabel}`
        ] = containerMetric.values.map((elem) => elem.value);
      });
    return result;
  },
);

export const selectMetricDataByChart = createSelector(
  selectContainerMetricsAsList,
  (_: AppState, p: { containerIds: string[] }) => p.containerIds,
  (_: AppState, p: { metricNames: string[] }) => p.metricNames,
  (_: AppState, p: { metricHorizon: MetricHorizons }) => p.metricHorizon,
  (
    containerMetrics,
    containerIds,
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
        containerIds.includes(containerMetric.containerId) &&
        metricNames.includes(containerMetric.metricName) &&
        containerMetric.metricTimeRange === metricHorizon,
    );
    if (metrics.length === 0) {
      return result;
    }
    // all metrics use the same exact time horizon and currently are sent by the backend
    // with identical tick counts
    const datasets: Dataset[] = [];
    metrics.forEach((metric) => {
      const dataset: Dataset = {
        label: `${metric.metricName} - ${metric.metricLabel}`,
        pointRadius: 0,
        pointHoverRadius: 5,
        data: [],
      };
      metric.values.forEach((metricValue) => {
        dataset.data.push({
          x: metricValue.date,
          y: metricValue.value,
        });
      });
      datasets.push(dataset);
    });
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
  `/proxy/:containerId?horizon=:metricHorizon&ts=${getUtc()}&metric=:metricName&requestedTicks=300`,
  { saga: cacheTimer() },
  function* (ctx, next) {
    const key = metricsKey(ctx.payload.serviceId, ctx.payload.metricHorizon);
    const id = `${ctx.key}-${ctx.payload.containerId}-${ctx.payload.metricName}-${key}`;
    yield* put(
      setLoaderStart({
        id,
      }),
    );
    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    const containerMetrics = deserializeContainerMetricsResponse({
      payload: ctx.json.data,
      ...ctx.payload,
    });

    yield* put(addContainerMetrics(containerMetrics));
    yield* put(
      setLoaderSuccess({
        id,
      }),
    );
  },
);

export const fetchContainersByServiceId = thunks.create<{ serviceId: string }>(
  "fetch-containers-by-service-id",
  function* (ctx, next) {
    const { serviceId } = ctx.payload;
    yield* put(setLoaderStart({ id: ctx.key }));
    const releaseCtx = yield* call(
      fetchReleasesByServiceWithDeleted.run,
      fetchReleasesByServiceWithDeleted({ serviceId: ctx.payload.serviceId }),
    );
    if (!releaseCtx.json.ok) {
      yield* put(setLoaderError({ id: ctx.key }));
      yield* next();
      return releaseCtx;
    }
    const releases = yield* select(selectReleasesByServiceAfterDate, {
      serviceId,
      date: dateFromToday(-7).toISOString(),
    });
    const releaseIds = releases.map((release) => release.id);

    const fx = releaseIds.map((releaseId) =>
      call(
        fetchContainersByReleaseIdWithDeleted.run,
        fetchContainersByReleaseIdWithDeleted({ releaseId }),
      ),
    );
    yield* all(fx);

    yield* put(setLoaderSuccess({ id: ctx.key }));
    yield* next();
  },
);

type MetricName = "cpu_pct" | "la" | "memory_all" | "iops" | "fs";

export const fetchMetricByServiceId = thunks.create<{
  serviceId: string;
  metricHorizon: MetricHorizons;
  metricName: MetricName;
}>("fetch-metric-by-service-id", function* (ctx, next) {
  yield* put(setLoaderStart({ id: ctx.key }));
  const { serviceId, metricHorizon, metricName } = ctx.payload;
  const service = yield* select(selectServiceById, { id: serviceId });

  // we always go back exactly one week, though it might be a bit too far for some that way
  // we do not have to refetch this if the component state changes as this is fairly expensive
  const releases = yield* select(selectReleasesByServiceAfterDate, {
    serviceId,
    date: dateFromToday(-7).toISOString(),
  });
  const releaseIds = releases.map((release) => release.id);

  const layersToSearchForContainers = ["app", "database"];
  const horizonInSeconds = metricHorizonAsSeconds(metricHorizon);
  const containers = yield* select(selectContainersByCurrentReleaseAndHorizon, {
    layers: layersToSearchForContainers,
    releaseIds,
    horizonInSeconds,
    currentReleaseId: service.currentReleaseId,
  });

  const BATCH_REQUEST_LIMIT = 20;
  const totalRequests = containers.length;
  let curContainerIndex = 0;

  while (curContainerIndex < totalRequests - 1) {
    const fx: any[] = [];
    const loopMax = Math.min(
      totalRequests - curContainerIndex,
      BATCH_REQUEST_LIMIT,
    );
    for (let i = 0; i < loopMax; i += 1) {
      const container = containers[curContainerIndex];
      curContainerIndex += 1;
      if (!container) {
        continue;
      }

      fx.push(
        call(
          fetchMetricTunnelDataForContainer.run,
          fetchMetricTunnelDataForContainer({
            containerId: container.id,
            metricName,
            metricHorizon: metricHorizon,
            serviceId: serviceId,
          }),
        ),
      );
    }

    yield* all(fx);
    yield* delay(250);
  }

  yield* put(setLoaderSuccess({ id: ctx.key }));
  yield* next();
});

export const metricsKey = (serviceId: string, metricHorizon: string) => {
  return `${serviceId}-${metricHorizon}`;
};

export const selectMetricsLoaded = createSelector(
  selectLoaders,
  (_: AppState, p: { serviceId: string }) => p.serviceId,
  (_: AppState, p: { metricHorizon: string }) => p.metricHorizon,
  (loaders, serviceId, metricHorizon) => {
    const lds = Object.keys(loaders);
    const loaded = lds.filter((key) => {
      if (!key.includes(metricsKey(serviceId, metricHorizon))) {
        return false;
      }
      const loader = loaders[key];
      if (!loader) return false;
      return loader.status === "success";
    });
    return loaded.length;
  },
);

export const fetchAllMetricsByServiceId = thunks.create<{
  serviceId: string;
  metrics: MetricName[];
  metricHorizon: MetricHorizons;
}>(
  "fetch-all-metrics-by-service-id",
  {
    saga: takeLeading,
  },
  function* (ctx, next) {
    const { serviceId, metrics, metricHorizon } = ctx.payload;
    yield* put(setLoaderStart({ id: ctx.key }));

    yield* call(
      fetchContainersByServiceId.run,
      fetchContainersByServiceId({ serviceId }),
    );

    const fx: any[] = [];
    metrics.forEach((metricName) => {
      fx.push(
        call(
          fetchMetricByServiceId.run,
          fetchMetricByServiceId({
            serviceId,
            metricName,
            metricHorizon,
          }),
        ),
      );
    });
    yield* all(fx);

    yield* put(setLoaderSuccess({ id: ctx.key }));
    yield* next();
  },
);
