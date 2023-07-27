import { Line } from "react-chartjs-2";

import { IconInfo, IconRefresh } from "./icons";
import { Tooltip } from "./tooltip";
import { ChartToCreate, selectMetricDataByChart } from "@app/metric-tunnel";
import { AppState, DeployContainer, MetricHorizons } from "@app/types";
import {
  CategoryScale,
  Chart as ChartJS,
  Colors,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  TimeUnit,
  Title,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { useSelector } from "react-redux";

ChartJS.register(
  CategoryScale,
  Colors,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
);

const timeHorizonToChartJSUnit = (metricHorizon: MetricHorizons): TimeUnit =>
  ({
    "1h": "minute" as TimeUnit,
    "1d": "minute" as TimeUnit,
    "1w": "day" as TimeUnit,
  })[metricHorizon];

const LineChartWrapper = ({
  showLegend = true,
  keyId,
  chart: { labels, datasets, title },
  xAxisUnit,
}: {
  showLegend?: boolean;
  keyId: string;
  chart: ChartToCreate;
  xAxisUnit: TimeUnit;
}) =>
  datasets && title ? (
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
          colors: {
            forceOverride: true, // needed to persist colors during repaint/refresh
          },
          legend: {
            display: showLegend,
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
            padding: showLegend
              ? undefined
              : {
                  top: 10,
                  bottom: 30,
                },
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
              unit: xAxisUnit,
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
  containers,
  limit,
  metricNames,
  metricHorizon,
  helpText,
}: {
  containers: DeployContainer[];
  limit?: string;
  metricNames: string[];
  metricHorizon: MetricHorizons;
  helpText?: string;
}) => {
  const containerIds = containers.map((container) => container.id).sort();
  // for now, we only use the FIRST container id pending cross-release
  const chartToCreate = useSelector((s: AppState) =>
    selectMetricDataByChart(s, {
      containerIds,
      metricNames,
      metricHorizon,
    }),
  );
  if (chartToCreate.title === "" || chartToCreate.datasets?.length === 0) {
    return null;
  }

  return (
    <div className="bg-white px-5 pt-1 pb-5 shadow rounded-lg border border-black-100 relative min-h-[400px] bg-[url('/thead-bg.png')] bg-[length:100%_46px] bg-no-repeat">
      {helpText || limit ? (
        <div className="relative w-full">
          {limit ? (
            <span className="text-sm text-gray-500 absolute right-10 top-2.5">
              Limit: 1000 MB
            </span>
          ) : null}
          {helpText ? (
            <div className="absolute right-5 top-2.5">
              <Tooltip text={helpText} autoSizeWidth rightAnchored>
                <IconInfo className="h-5 mt-0.5 opacity-50 hover:opacity-100 cursor-pointer absolute" />
              </Tooltip>
            </div>
          ) : null}
        </div>
      ) : null}
      <LineChartWrapper
        showLegend={(chartToCreate.datasets?.length || 0) <= 4}
        keyId={`${containerIds.join("-")}-${metricNames.join(
          "-",
        )}-${metricHorizon}`}
        xAxisUnit={timeHorizonToChartJSUnit(metricHorizon)}
        chart={chartToCreate}
      />
    </div>
  );
};
