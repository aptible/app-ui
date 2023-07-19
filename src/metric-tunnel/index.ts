import { cacheTimer, metricTunnelApi, thunks } from "@app/api";
import { createTable } from "@app/slice-helpers";
import { ApiGen, AppState, ContainerMetrics, DeployContainer, MetricHorizons } from "@app/types";
import { ActionWithPayload, all, call } from "saga-query";

export interface MetricTunnelContainerResponse {
  columns: ((string | null | number)[])[];
}

const getContainerMetricsId = ({
  containerId,
  metricName,
  metricTimeRange,
}: {
  containerId: string;
  metricName: string;
  metricTimeRange: MetricHorizons;
}): string => `${containerId}-${metricName}-${metricTimeRange}`;

// partial generator for ts object of containermetrics
interface ContainerMetricPayload {
  containerId: string,
  metricName: string,
  metricTimeRange: MetricHorizons,
  payload: MetricTunnelContainerResponse,
  serviceId: string,
}
export const deserializeContainerMetricsResponse = ({
  containerId,
  metricName,
  metricTimeRange,
  payload,
  serviceId,
}: ContainerMetricPayload): { [key: string]: ContainerMetrics } => {
  const result: { [key: string]: ContainerMetrics } = {};
  const dateColumn = payload.columns.find((column) => column?.[0] === "time_0");
  if (!dateColumn) {
    return result
  }

  const dateData: string[] = dateColumn.slice(1) as string[];

  payload.columns.forEach((column) => {
    const id = getContainerMetricsId({ containerId, metricName, metricTimeRange })
    const containerMetric: ContainerMetrics = {
      containerId,
      id,
      serviceId,
      metricName: '',
      metricTimeRange,
      values: []
    }
    column.forEach((row, rowNumber) => {
      if (row === "time_0") {
        // store the date values for reuse, pluck them on the way back in
      } else {
        if (rowNumber === 0 && typeof row === 'string') {
          containerMetric.metricName = row;
        } else if (row === null) {
          containerMetric.values.push({
            date: dateData?.[rowNumber] || "",
            value: 0,
          })
        } else if (typeof row === 'number') {
          containerMetric.values.push({
            date: dateData?.[rowNumber] || "",
            value: row
          })
        }
      }
    })
    result[id] = containerMetric
  })
  return result;
}

const METRIC_TUNNEL_CONTAINER_METRICS = "containerMetrics";
const slice = createTable<ContainerMetrics>({ name: METRIC_TUNNEL_CONTAINER_METRICS });
export const { add: addContainerMetrics } = slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => s[METRIC_TUNNEL_CONTAINER_METRICS],
);
// TODO - come back for must() if needed
const { selectTableAsList } = selectors;

const getUtc = (): number => {
  return Date.now();
};

export const fetchMetricTunnelDataForContainer = metricTunnelApi.get<
  Omit<ContainerMetricPayload, "payload">,
  MetricTunnelContainerResponse
>(
  `/proxy/:containerId?horizon=:horizon&ts=${getUtc()}&metric=:metric&requestedTicks=600`,
  function*(ctx, next) {
    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    const containerMetrics = deserializeContainerMetricsResponse({
      payload: ctx.json.data,
      ...ctx.payload
    })

    yield* put(addContainerMetrics(containerMetrics))
  }
);
// export const gatherMetricsForContainers = thunks.create<{
//   metrics: string[];
//   ntainers: DeployContainer[ ] ;  
//     Horizon: MetricHorizons;
//      er-metric -for-containers", function* (ctx, next) {
//   { metrics, containers, viewHorizon } = ctx.payload;
//   iesToExecute = metrics.flatMap((metric) =>
//     ainers.map((container) =>
//     gatherMetricForContainer({ 
//      container, 
//     metric, 
//   viewHorizon,
//     }),
//     
//       
//     t containerDataCtx: any[] = yield* all(queriesToExecute);
//    (Array.isArray(containerDataCtx)) {
//   const groupedData = containerDataCtx.map((data: any) => {
//     if (data.json.ok) {
//       return data.json.data;
//     }
//     });
//   con sole.log("GROUPED DATA", groupedData);
//     // process and store this in store some how?
//     return groupedData;
//   }
//
//   yield* next();
// });

