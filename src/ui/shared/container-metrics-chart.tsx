import { Line } from "react-chartjs-2";
import cn from 'classnames';

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
  Title,
  Tooltip,
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

const isSameVal = (data: number[]) => {
    let prev = -1;
    for (let i = 0; i < data.length; i += 1) {
      const d = data[i];
      if (i === 0) {
        prev = d;
        continue;
      };

      if (d !== prev) {
        return false;
      }
    }

    return true;
  }

const Plot = ({
  id,
  chart: { labels, datasets, title },
}: { id: string; chart: ChartToCreate }) => {
  console.log(datasets);
  const x = new Set<string>();
  labels.forEach((l) => {
    x.add(l);
  });
  const dedupe = [...x];

  if (datasets.length === 0) {
    return <div>no data</div>;
  }

  const tickMax = 5;
  const margin = { top: 0, bottom: 20, left: 30, right: 20 };

  const strokeWidth = 2;
  const h = 500;
  const w = 673;
  const width = w - margin.left - margin.right - (strokeWidth * 2);
  const height = h - margin.top - margin.bottom;
  const minX = 0;
  const maxX = width;
  const first = datasets[0];
  const ySort = [...first.data].sort();
  // const sameVal = isSameVal(first.data);
  const dataMaxY = ySort[ySort.length - 1];

  // const dataMaxX = labels[labels.length - 1];
  const tickIntervalY = dataMaxY / tickMax - 1;
  const yMax = tickIntervalY * tickMax;

  const plot = () => {
    if (dataMaxY === 0) {
        return <path d={`M ${minX},${height} H ${maxX}`} stroke="red" strokeWidth={strokeWidth} strokeLinecap="square" />
    }

    /* if (sameVal) {
      const d = first.data[0];
      return <path d={`M 0,${height - height * d / yMax} H ${width}`} stroke="red" strokeWidth={strokeWidth} strokeLinecap="square" />
    } */

    return first.data.map((d, i) => {
      const lbl = labels[i];
      const e = dedupe.findIndex((p) => p === lbl);
      const xpct = e / dedupe.length;
      const x = width * xpct;

      const ypct = d / yMax;
      const y = Math.abs(height - height * ypct);

      console.log("CIRCLE", x, y);
      return <circle key={i} cx={x} cy={y} r={2} fill="red" />;
    })
  }

  // preserveAspectRatio="xMinYMax meet"
  return (
    <svg
      id={id}
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-full"
    >
      <g transform={`translate(${margin.left}, 0)`}>
        <g transform={`translate(${strokeWidth},-${margin.top + strokeWidth})`}>
          {plot()}
        </g>
        <path d={`M ${minX},${height} V ${minX}`} stroke="black" strokeWidth={strokeWidth} strokeLinecap="square" />
        <path d={`M ${minX},${height} H ${maxX}`} stroke="black" strokeWidth={strokeWidth} strokeLinecap="square" />
     </g>
    </svg>
  );
};

export const LineChartWrapper = ({
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
          colors: {
            forceOverride: true, // needed to persist colors during repaint/refresh
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
  containers,
  metricNames,
  metricHorizon,
}: {
  containers: DeployContainer[];
  metricNames: string[];
  metricHorizon: MetricHorizons;
}) => {
  // for now, we only use the FIRST container id pending cross-release
  const containerIds = containers.map((container) => container.id);
  const containerIdsKey = containerIds.join("-");
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
    <div className={cn(
      "bg-white shadow rounded-lg border border-black-100 h-[400px]",
      "w-full")}>
      <Plot
        id={`${containerIdsKey}-${metricNames.join("-")}-${metricHorizon}`}
        chart={chartToCreate}
      />
      {/*<LineChartWrapper
        key={containerIdsKey}
        keyId={`${containerIdsKey}-${metricNames.join("-")}-${metricHorizon}`}
        chart={chartToCreate}
      /> */}
    </div>
  );
};
