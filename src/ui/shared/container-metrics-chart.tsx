import { fetchMetricTunnelDataForContainer } from "@app/metric-tunnel";
import { DeployContainer } from "@app/types";
import React, { useEffect } from "react";
import { Line } from "react-chartjs-2";
import { useCache } from "saga-query/react";
import { Loading } from "./loading";

type Dataset = {
  label?: string;
  pointRadius?: number;
  pointHoverRadius?: number;
  data: number[];
};

type ChartToCreate = {
  title: string;
  labels?: string[];
  datasets?: Dataset[];
};

const chartGroups = {
  CPU: ["cpu_pct"],
  "Load Average": ["la"],
  Memory: ["memory_all"],
  "File System": ["fs"],
  IOPS: ["iops"],
};

const LineChartWrapper = ({
  chart: { labels, datasets, title },
}: { chart: ChartToCreate }) =>
  labels && datasets && title ? (
    <Line
      datasetIdKey="id"
      data={{
        labels,
        datasets,
      }}
      options={{
        responsive: true,
        maintainAspectRatio: true,
        animation: {
        duration: 0,
        easing: 'linear'
      },
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
            },
          },
          title: {
            font: {
              size: 20,
              weight: "normal",
            },
            color: "#595E63",
            align: "start",
            display: true,
            text: title,
          },
        },
        scales: {
          x: {
            border: {
              color: "#111920",
            },
            grid: {
              display: false,
            },
            ticks: {
              color: "#111920",
              maxRotation: 0,
              minRotation: 0,
              maxTicksLimit: 7,
            },
          },
          y: {
            min: 0,
            border: {
              display: false,
            },
            ticks: {
              color: "#111920",
            },
          },
        },
      }}
    />
  ) : null;

export const ContainerMetricsChart = ({
  container,
  dataToFetch,
}: { container: DeployContainer; dataToFetch: string[] }) => {
  const foundCharts: { [key: string]: boolean } = {
    CPU: false,
    "Load Average": false,
    Memory: false,
    "File System": false,
    IOPS: false,
  };

  // WARNING - this requires a better long term solution. We are doing this just to set up the
  // queries / transform data for viewing this in browser (as there are concurrent metrictunnel changes to this)
  // We likely will want a cachable/datastore-based solution at some point. This is temporary
  const constructQueries = dataToFetch.map((datumToFetch) => {
    Object.entries(chartGroups).map(([key, value]) => {
      if (value.includes(datumToFetch)) {
        foundCharts[key] = true;
      }
    });
    return useCache(
      fetchMetricTunnelDataForContainer({
        containerId: container.id,
        horizon: "1h",
        metric: datumToFetch,
      }),
    );
  });
  useEffect(() => {
    constructQueries.forEach((query) => query.trigger());
  }, [constructQueries.length]);
  if (
    constructQueries
      .map((query) => query.isLoading || query.isInitialLoading)
      .some((queryStatus) => queryStatus)
  ) {
    return <Loading />;
  }

  const chartsToCreate: ChartToCreate[] = [];
  Object.entries(foundCharts).forEach(([key, value]) => {
    if (value) {
      chartsToCreate.push({
        title: key,
      });
    }
  });

  // combine all the query data into a singular dataset
  chartsToCreate.forEach((chartToCreate, idx) => {
    const labels: string[] = [];
    const datasets: Dataset[] = [];
    constructQueries.forEach((query, queryIdx) => {
      if (!chartGroups[chartToCreate.title].includes(dataToFetch[queryIdx])) {
        return;
      }

      // timefield is always time_0, deltas are used sometimes with time_1 where available
      query.data.columns.forEach(
        (colDataSeries: (string | number)[], colDataSeriesIdx: number) => {
          const colName =
            typeof colDataSeries[0] === "string" &&
            colDataSeries[0].includes("time_")
              ? colDataSeries[0]
              : `${dataToFetch[queryIdx]} - ${colDataSeries[0]}`;
          if (colName === "time_0" && labels.length === 0) {
            colDataSeries.forEach((date, idx) => {
              if (idx === 0 || typeof date !== "string") {
                return;
              }
              labels.push(date);
            });
          } else if (!colName.includes("time_")) {
            const dataSeries: Dataset = {
              label: colName,
              // pointRadius: 0,
              // pointHoverRadius: 5,
              data: [],
            };
            colDataSeries.forEach((elem: string | number, idx) => {
              if (idx === 0 || typeof elem !== "number") {
                return;
              }
              dataSeries.data.push(elem);
            });
            datasets.push(dataSeries);
          }
        },
      );
    });
    chartToCreate.labels = labels;
    chartToCreate.datasets = datasets;
    chartsToCreate[idx] = chartToCreate;
  });

  // prune date indices that have no data at all

  return (
    <div>
      {chartsToCreate.map((chartToCreate) => (
        <div className="bg-white p-5 my-4 shadow rounded-lg border border-black-100 relative w-full max-h-[400px]">
          <LineChartWrapper chart={chartToCreate} />
        </div>
      ))}
    </div>
  );
};

export const MemoizedContainerMetricsChart = React.memo(ContainerMetricsChart);
