import { fetchMetricTunnelDataForContainer } from "@app/metric-tunnel";
import { DeployContainer } from "@app/types";
import { useEffect } from "react";
import { Line } from "react-chartjs-2";
import { useCache } from "saga-query/react";
import { Loading } from "./loading";

type Dataset = {
  label?: string;
  pointRadius: number;
  pointHoverRadius: number;
  data: number[];
};

export const ContainerMetricsChart = ({
  container,
  dataToFetch,
}: { container: DeployContainer; dataToFetch: string[] }) => {
  // WARNING - this requires a better long term solution. We are doing this just to set up the
  // queries / transform data for viewing this in browser (as there are concurrent metrictunnel changes to this)
  // We likely will want a cachable/datastore-based solution at some point. This is temporary
  const constructQueries = dataToFetch.map((datumToFetch) =>
    useCache(
      fetchMetricTunnelDataForContainer({
        containerId: container.id,
        horizon: "1h",
        metric: datumToFetch,
      }),
    ),
  );
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

  // combine all the query data into a singular dataset
  const labels: string[] = [];
  const datasets: Dataset[] = [];
  constructQueries.forEach((query, queryIdx) => {
    // timefield is always time_0, deltas are used sometimes with time_1 where available
    query.data.columns.forEach(
      (colDataSeries: (string | number)[], colDataSeriesIdx: number) => {
        const colName =
          typeof colDataSeries[0] === "string" &&
          colDataSeries[0].includes("time_")
            ? colDataSeries[0]
            : `${dataToFetch[queryIdx]} - ${colDataSeries[0]}`;
        if (colName === "time_0") {
          colDataSeries.forEach((date, idx) => {
            if (idx === 0 || typeof date !== "string") {
              return;
            }
            labels.push(date);
          });
        } else if (!colName.includes("time_")) {
          const dataSeries: Dataset = {
            label: colName,
            pointRadius: 0,
            pointHoverRadius: 5,
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

  return (
    <div className="bg-white p-5 my-4 shadow rounded-lg border border-black-100">
      <Line
        datasetIdKey="id"
        data={{
          labels,
          datasets,
        }}
        options={{
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
              text: "Provisional",
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
              },
            },
            y: {
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
    </div>
  );
};
