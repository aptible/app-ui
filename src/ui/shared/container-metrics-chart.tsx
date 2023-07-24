import cn from "classnames";
import { Line } from "react-chartjs-2";

import { prettyChartDateTime } from "@app/date";
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
    }

    if (d !== prev) {
      return false;
    }
  }

  return true;
};

const Plot = ({
  id,
  chart: { labels, datasets, title },
}: { id: string; chart: ChartToCreate }) => {
  const x = new Set<string>();
  labels.forEach((l) => {
    x.add(l);
  });
  const dedupe = [...x];
  const xMax = dedupe.length;

  if (datasets.length === 0) {
    return <div>no data</div>;
  }

  // options
  const tickMax = 5;
  const margin = { top: 30, bottom: 30, left: 30, right: 30 };
  const strokeWidth = 2;

  const h = 400;
  const w = 538;
  // adjust width and height to accommodate margins
  const width = w - margin.left - margin.right - strokeWidth * 2;
  const height = h - margin.top - margin.bottom;

  // just grab the first dataset for now
  const first = datasets[0];
  const sameVal = isSameVal(first.data);
  // find the max Y value
  const ySort = [...first.data].sort();
  let dataMaxY = ySort[ySort.length - 1];
  // coerce to 1 to prevent failures calc when (N/0)
  if (dataMaxY === 0) {
    dataMaxY = 1;
  }

  // figure out tick intervals
  const tickIntervalY = dataMaxY / (dataMaxY === 1 ? tickMax : tickMax - 1);
  const yMax = tickIntervalY * tickMax;

  const calcY = (d: number) => {
    // find the y-value's placement on the chart by taking the current value
    // and the max value possible in this chart (including adding an extra
    // tick to the chart)
    const ypct = d / yMax;
    // svg default's 0,0 to be the top-left of the DOM element so we
    // have to do some math to invert the position based on the height of the
    // chart and the y-value's placement
    const y = Math.abs(height - height * ypct) - strokeWidth;
    return y;
  };

  const calcX = (i: number) => {
    // find the corresponding x-value
    const lbl = labels[i];
    // find its position inside the deduplicated x-values
    // not sure if i need this tbh
    const e = dedupe.findIndex((p) => p === lbl);
    // find x-value's placement on the chart by getting it's ratio
    // between its element number in the dedupe'd array and the last
    // element in the array
    const xpct = e / xMax;
    const x = width * xpct;
    return x;
  };

  const plot = () => {
    // if the entire dataset is the same value then draw a line
    if (sameVal) {
      const d = first.data[0];
      const y = calcY(d);
      return <path d={`M 0,${y} H ${width}`} stroke="red" />;
    }

    // plot the points
    return first.data.map((d, i) => {
      const x = calcX(i);
      const y = calcY(d);
      return <circle key={i} cx={x} cy={y} r={strokeWidth} fill="red" />;
    });
  };

  const yGrid = () => {
    // grid data
    const tickY: number[] = [];
    for (let i = 1; i <= tickMax; i += 1) {
      const y = calcY(i * tickIntervalY);
      tickY.push(y);
    }
    return tickY.map((y, i) => {
      const value = (i + 1) * tickIntervalY;
      return (
        <g>
          <path
            key={y}
            d={`M 0,${y} H ${width}`}
            stroke="#ccc"
            strokeWidth={strokeWidth}
            strokeLinecap="square"
          />
          <text
            transform={"translate(-5, 4)"}
            x={0}
            y={y}
            fontSize={10}
            textAnchor="end"
          >
            {yMax <= 10 ? value.toFixed(2) : Math.floor(value)}
          </text>
        </g>
      );
    });
  };

  const xGrid = () => {
    const tickIntervalX = Math.floor(xMax / tickMax);
    const tickX: { value: number; label: string }[] = [];
    for (let i = 0; i <= tickMax; i += 1) {
      const element = i * tickIntervalX;
      const index = i === tickMax ? element - 1 : element;
      const x = calcX(index);
      tickX.push({ value: x, label: labels[index] });
    }

    return (
      <g transform={`translate(0, ${height + 20})`}>
        {tickX.map((opt) => {
          return (
            <text x={opt.value} y={0} fontSize={8} textAnchor="middle">
              {prettyChartDateTime(opt.label)}
            </text>
          );
        })}
      </g>
    );
  };

  const yAxis = () => {
    return <path d={`M -${strokeWidth},${height} V 0`} />;
  };

  const xAxis = () => {
    return <path d={`M 0,${height} H ${width}`} />;
  };

  return (
    <>
      <div>{title}</div>
      <svg
        id={id}
        viewBox={`0 0 ${w} ${h}`}
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
      >
        <title>{title}</title>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {yGrid()}
          {xGrid()}

          <g stroke="black" strokeWidth={strokeWidth} strokeLinecap="square">
            {yAxis()}
            {xAxis()}
          </g>

          <g strokeWidth={strokeWidth} strokeLinecap="square">
            {plot()}
          </g>
        </g>
      </svg>
    </>
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
    <div
      className={cn(
        "bg-white shadow rounded-lg border border-black-100 h-[400px]",
        "w-auto",
      )}
    >
      <Plot
        id={`${containerIdsKey}-${metricNames.join("-")}-${metricHorizon}`}
        chart={chartToCreate}
      />
      {/* <LineChartWrapper
        key={containerIdsKey}
        keyId={`${containerIdsKey}-${metricNames.join("-")}-${metricHorizon}`}
        chart={chartToCreate}
      />*/}
    </div>
  );
};
