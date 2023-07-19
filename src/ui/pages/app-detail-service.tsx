import { useQuery } from "@app/fx";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import {
  fetchEnvironmentServices,
  fetchRelease,
  selectAppById,
  selectServiceById,
} from "@app/deploy";
import { AppState } from "@app/types";

import { LoadResources } from "../shared";
import { ContainerMetricsChart } from "../shared/container-metrics-chart";
import { ContainerMetricsDataTable } from "../shared/container-metrics-table";
import {
  ChartToCreate,
  Dataset,
  MetricTabTypes,
  MetricsHorizonControls,
  MetricsViewControls,
  processDataSeries,
} from "../shared/metrics-controls";
import {
  fetchContainersByReleaseId,
  selectContainersByReleaseIdByLayerType,
} from "@app/deploy/container";
import {
  MetricHorizons,
  fetchMetricTunnelDataForContainer,
  gatherMetricsForContainers,
} from "@app/metric-tunnel";
import { useState } from "react";

export function AppDetailServicePage() {
  const { id = "", serviceId = "" } = useParams();
  const [viewTab, setViewTab] = useState<MetricTabTypes>("chart");
  const [viewHorizon, setViewHorizon] = useState<MetricHorizons>("1h");
  const app = useSelector((s: AppState) => selectAppById(s, { id }));
  const query = useQuery(fetchEnvironmentServices({ id: app.environmentId }));
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: serviceId }),
  );
  useQuery(fetchRelease({ id: service.currentReleaseId }));
  useQuery(fetchContainersByReleaseId({ releaseId: service.currentReleaseId }));
  const containers = useSelector((s: AppState) =>
    selectContainersByReleaseIdByLayerType(s, {
      layers: ["app", "database"],
      releaseId: service.currentReleaseId,
    }),
  );

  const metrics = ["cpu_pct", "la", "memory_all"];
  const chartMetricsData = useQuery(
    gatherMetricsForContainers({
      metrics,
      containers,
      viewHorizon,
    }),
  );

  const foundCharts: { [foundChartKey: string]: boolean } = {
    Memory: false,
    CPU: false,
    "File System": false,
    IOPS: false,
    "Load Average": false,
  };

  const chartGroups: { [chartGroupKey: string]: string[] } = {
    Memory: ["memory_all"],
    CPU: ["cpu_pct"],
    "File System": ["fs"],
    IOPS: ["iops"],
    "Load Average": ["la"],
  };

  const chartsToCreate: ChartToCreate[] = [];
  Object.entries(foundCharts).forEach(([key, value]) => {
    if (value) {
      chartsToCreate.push({
        title: key,
      });
    }
  });
  // if (chartMetricsData?length) {
  //   console.log()
  console.log(chartMetricsData);
  // }
  chartsToCreate.forEach((chartToCreate: any, idx) => {
    // combine all the query data into a singular dataset
    const labels: string[] = [];
    const datasets: Dataset[] = [];
    chartMetricsData.forEach((query, queryIdx) => {
      if (!chartGroups[chartToCreate.title].includes(metrics[queryIdx])) {
        return;
      }

      // timefield is always time_0, deltas are used sometimes with time_1 where available
      query.data.columns.forEach((colDataSeries: (string | number)[]) => {
        const colName =
          typeof colDataSeries[0] === "string" &&
          colDataSeries[0].includes("time_")
            ? colDataSeries[0]
            : `${metrics[queryIdx]} - ${colDataSeries[0]}`;
        if (colName === "time_0" && labels.length === 0) {
          colDataSeries.forEach((date, idx) => {
            if (idx === 0 || typeof date !== "string") {
              return;
            }
            labels.push(date);
          });
        } else if (!colName.includes("time_")) {
          datasets.push(processDataSeries({ colDataSeries, colName }));
        }
      });
    });
    chartToCreate.labels = labels;
    chartToCreate.datasets = datasets;
    chartsToCreate[idx] = chartToCreate;
  });

  console.log(chartsToCreate);

  return (
    <>
      <div className="flex gap-4 justify-start">
        <MetricsViewControls
          viewMetricTab={viewTab}
          setViewMetricTab={setViewTab}
        />
        <MetricsHorizonControls
          viewHorizon={viewHorizon}
          setViewHorizon={setViewHorizon}
        />
      </div>
      <LoadResources query={query} isEmpty={false}>
        {chartsToCreate.map((chartToCreate, idx) => (
          <div className="my-4" key={`${chartToCreate}-${idx}`}>
            {viewTab === "chart" ? (
              <ContainerMetricsChart
                keyId={idx.toString()}
                chartToCreate={chartToCreate}
              />
            ) : null}
          </div>
        ))}
      </LoadResources>
    </>
  );
}

export const Component = AppDetailServicePage;
