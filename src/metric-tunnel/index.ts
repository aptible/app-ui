import { cacheTimer, metricTunnelApi } from "@app/api";

export const fetchMetricTunnelForAppCpu = metricTunnelApi.get<
  { containerId: string; horizon: string; metric: string },
  any
>(
  `/proxy/:containerId?horizon=:horizon&ts=${new Date().getTime()}&metric=:metric`,
  { saga: cacheTimer() },
  metricTunnelApi.cache(),
);
