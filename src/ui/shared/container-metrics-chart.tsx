import { Loading } from "./loading";
import { fetchMetricTunnelDataForContainer } from "@app/metric-tunnel";
import { DeployContainer } from "@app/types";
import React, { useEffect } from "react";
import { Line } from "react-chartjs-2";
import { useCache } from "saga-query/react";
import { Dataset, processDataSeries } from "./container-metrics";

type ChartToCreate = {
  title: string;
  labels?: string[];
  datasets?: Dataset[];
};

const chartGroups: { [key: string]: string[] } = {
  Memory: ["memory_all"],
  CPU: ["cpu_pct"],
  "File System": ["fs"],
  IOPS: ["iops"],
  "Load Average": ["la"],
};

const LineChartWrapper = ({
  keyId,
  chart: { labels, datasets, title },
}: { keyId: string; chart: ChartToCreate }) =>
  labels && datasets && title ? (
    <Line
      datasetIdKey={keyId}
      data={{
        labels,
        datasets,
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0,
          easing: "linear",
        },
        plugins: {
          zoom: {
            zoom: {
              drag: {
                enabled: true,
              },
              wheel: {
                enabled: false,
              },
              pinch: {
                enabled: true,
              },
              mode: "xy",
            },
          },
          legend: {
            labels: {
              usePointStyle: true,
              boxHeight: 5,
              boxWidth: 3,
              padding: 20,
            },
          },
          title: {
            font: {
              size: 16,
              weight: "normal",
            },
            color: "#595E63",
            align: "start",
            display: true,
            text: title,
          },
        },
        interaction: {
          mode: "nearest",
          axis: "xy",
          intersect: false,
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
              autoSkip: true,
              maxTicksLimit: 5,
            },
            time: {
              tooltipFormat: "yyyy-MM-dd HH:mm:ss",
            },
            type: "time",
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
  viewHorizon,
}: {
  container: DeployContainer;
  dataToFetch: string[];
  viewHorizon: "1h" | "1d" | "1w";
}) => {
  const foundCharts: { [key: string]: boolean } = {
    Memory: false,
    CPU: false,
    "File System": false,
    IOPS: false,
    "Load Average": false,
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
        horizon: viewHorizon,
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
  chartsToCreate.forEach((chartToCreate: any, idx) => {
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
            datasets.push(processDataSeries({ colDataSeries, colName }));
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
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {chartsToCreate.map((chartToCreate, idx) => (
        <div className="bg-white px-5 pt-1 pb-5 shadow rounded-lg border border-black-100 relative min-h-[400px] bg-[url('/thead-bg.png')] bg-[length:100%_46px] bg-no-repeat">
          <LineChartWrapper keyId={idx} chart={chartToCreate} />
        </div>
      ))}
    </div>
  );
};

export const MemoizedContainerMetricsChart = React.memo(ContainerMetricsChart);
