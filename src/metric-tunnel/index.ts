import { cacheTimer, metricTunnelApi, thunks } from "@app/api";
import { dateFromToday } from "@app/date";
import {
  fetchContainersByReleaseIdWithDeleted,
  fetchReleasesByServiceWithDeleted,
  selectContainersByCurrentReleaseAndHorizon,
  selectReleasesByServiceAfterDate,
  selectServiceById,
} from "@app/deploy";
import { call, delay, parallel, select, takeLeading } from "@app/fx";
import { createSelector } from "@app/fx";
import { WebState, schema } from "@app/schema";
import { ContainerMetrics, MetricHorizons } from "@app/types";

export const metricHorizonAsSeconds = (metricHorizon: MetricHorizons) =>
  ({
    "1h": 60 * 60,
    "1d": 60 * 60 * 24,
    "1w": 60 * 60 * 24 * 7,
  })[metricHorizon];

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

export const selectContainerMetricsAsList =
  schema.containerMetrics.selectTableAsList;
export const selectMetricsByContainer = createSelector(
  selectContainerMetricsAsList,
  (_: WebState, p: { containerId: string }) => p.containerId,
  (containerMetrics, containerId) =>
    containerMetrics.find(
      (containerMetric) => containerMetric.containerId === containerId,
    ),
);

export const selectMetricsByMetricContainerHorizon = createSelector(
  selectContainerMetricsAsList,
  (_: WebState, p: { containerId: string }) => p.containerId,
  (_: WebState, p: { metricName: string }) => p.metricName,
  (_: WebState, p: { metricHorizon: MetricHorizons }) => p.metricHorizon,
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
  (_: WebState, p: { containerIds: string[] }) => p.containerIds,
  (_: WebState, p: { metricHorizon: MetricHorizons }) => p.metricHorizon,
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
  (_: WebState, p: { containerIds: string[] }) => p.containerIds,
  (_: WebState, p: { metricNames: string[] }) => p.metricNames,
  (_: WebState, p: { metricHorizon: MetricHorizons }) => p.metricHorizon,
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

const getUtc = (): number => {
  return Date.now();
};

export const fetchMetricTunnelDataForContainer = metricTunnelApi.get<
  Omit<ContainerMetricPayload, "payload">,
  MetricTunnelContainerResponse
>(
  `/proxy/:containerId?horizon=:metricHorizon&ts=${getUtc()}&metric=:metricName&requestedTicks=300`,
  { supervisor: cacheTimer() },
  function* (ctx, next) {
    const key = metricsKey(ctx.payload.serviceId, ctx.payload.metricHorizon);
    const id = `${ctx.key}-${ctx.payload.containerId}-${ctx.payload.metricName}-${key}`;
    yield* schema.update(schema.loaders.start({ id }));

    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    const containerMetrics = deserializeContainerMetricsResponse({
      payload: ctx.json.value,
      ...ctx.payload,
    });

    yield* schema.update([
      schema.containerMetrics.add(containerMetrics),
      schema.loaders.success({ id }),
    ]);
  },
);

export const fetchContainersByServiceId = thunks.create<{ serviceId: string }>(
  "fetch-containers-by-service-id",
  function* (ctx, next) {
    const { serviceId } = ctx.payload;
    const id = ctx.key;
    yield* schema.update(schema.loaders.start({ id }));
    const releaseCtx = yield* call(() =>
      fetchReleasesByServiceWithDeleted.run(
        fetchReleasesByServiceWithDeleted({ serviceId: ctx.payload.serviceId }),
      ),
    );
    if (!releaseCtx.json.ok) {
      yield* schema.update(schema.loaders.error({ id }));
      yield* next();
      return releaseCtx;
    }
    const releases = yield* select((s: WebState) =>
      selectReleasesByServiceAfterDate(s, {
        serviceId,
        date: dateFromToday(-7).toISOString(),
      }),
    );
    const releaseIds = releases.map((release) => release.id);

    const fx = releaseIds.map(
      (releaseId) => () =>
        fetchContainersByReleaseIdWithDeleted.run(
          fetchContainersByReleaseIdWithDeleted({ releaseId }),
        ),
    );
    const group = yield* parallel(fx);
    yield* group;

    yield* schema.update(schema.loaders.success({ id }));
    yield* next();
  },
);

type MetricName = "cpu_pct" | "la" | "memory_all" | "iops" | "fs";

export const fetchMetricByServiceId = thunks.create<{
  serviceId: string;
  metricHorizon: MetricHorizons;
  metricName: MetricName;
}>("fetch-metric-by-service-id", function* (ctx, next) {
  const id = ctx.key;
  yield* schema.update(schema.loaders.start({ id }));
  const { serviceId, metricHorizon, metricName } = ctx.payload;
  const service = yield* select((s: WebState) =>
    selectServiceById(s, { id: serviceId }),
  );

  // we always go back exactly one week, though it might be a bit too far for some that way
  // we do not have to refetch this if the component state changes as this is fairly expensive
  const releases = yield* select((s: WebState) =>
    selectReleasesByServiceAfterDate(s, {
      serviceId,
      date: dateFromToday(-7).toISOString(),
    }),
  );
  const releaseIds = releases.map((release) => release.id);

  const layersToSearchForContainers = ["app", "database"];
  const horizonInSeconds = metricHorizonAsSeconds(metricHorizon);
  const containers = yield* select((s: WebState) =>
    selectContainersByCurrentReleaseAndHorizon(s, {
      layers: layersToSearchForContainers,
      releaseIds,
      horizonInSeconds,
      currentReleaseId: service.currentReleaseId,
    }),
  );

  const BATCH_REQUEST_LIMIT = 20;
  const totalRequests = containers.length;
  let curContainerIndex = 0;

  while (curContainerIndex <= totalRequests - 1) {
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

      fx.push(() =>
        fetchMetricTunnelDataForContainer.run(
          fetchMetricTunnelDataForContainer({
            containerId: container.id,
            metricName,
            metricHorizon: metricHorizon,
            serviceId: serviceId,
          }),
        ),
      );
    }

    const group = yield* parallel(fx);
    yield* group;
    yield* delay(250);
  }

  yield* schema.update(schema.loaders.start({ id }));
  yield* next();
});

export const metricsKey = (serviceId: string, metricHorizon: string) => {
  return `${serviceId}-${metricHorizon}`;
};

export const selectMetricsLoaded = createSelector(
  schema.loaders.selectTable,
  (_: WebState, p: { serviceId: string }) => p.serviceId,
  (_: WebState, p: { metricHorizon: string }) => p.metricHorizon,
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
    supervisor: takeLeading,
  },
  function* (ctx, next) {
    const { serviceId, metrics, metricHorizon } = ctx.payload;
    const id = ctx.key;
    yield* schema.update(schema.loaders.start({ id }));

    yield* call(() =>
      fetchContainersByServiceId.run(fetchContainersByServiceId({ serviceId })),
    );

    const fx: any[] = [];
    metrics.forEach((metricName) => {
      fx.push(() =>
        fetchMetricByServiceId.run(
          fetchMetricByServiceId({
            serviceId,
            metricName,
            metricHorizon,
          }),
        ),
      );
    });
    const group = yield* parallel(fx);
    yield* group;

    yield* schema.update(schema.loaders.success({ id }));
    yield* next();
  },
);
