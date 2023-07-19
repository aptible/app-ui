import { ChartToCreate } from "./metrics-controls";
import { Line } from "react-chartjs-2";

import {
  CategoryScale,
  Chart as ChartJS,
  Colors,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from "chart.js";
import "chartjs-adapter-date-fns";
import zoomPlugin from "chartjs-plugin-zoom";

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
  zoomPlugin,
);

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
              tooltipFormat: "dd ",
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
  keyId,
  chartToCreate,
}: {
  keyId: string;
  chartToCreate: ChartToCreate;
}) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="bg-white px-5 pt-1 pb-5 shadow rounded-lg border border-black-100 relative min-h-[400px] bg-[url('/thead-bg.png')] bg-[length:100%_46px] bg-no-repeat">
        <LineChartWrapper keyId={keyId} chart={chartToCreate} />
      </div>
    </div>
  );
};
