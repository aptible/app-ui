import { cacheTimer, metricTunnelApi } from "@app/api";

const getUtc = (): number => {
  return Date.now();
};

export const fetchMetricTunnelDataForContainer = metricTunnelApi.get<
  { containerId: string; horizon: string; metric: string },
  any
>(
  `/proxy/:containerId?horizon=:horizon&ts=${getUtc()}&metric=:metric&requestedTicks=100`,
  { saga: cacheTimer() },
  metricTunnelApi.cache(),
);
