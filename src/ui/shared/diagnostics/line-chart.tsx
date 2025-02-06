import {
  CategoryScale,
  Chart as ChartJS,
  Colors,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  type TimeUnit,
  Title,
  Tooltip,
} from "chart.js";
import React, { useContext, useEffect } from "react";
import "chartjs-adapter-luxon";
import type { Annotation } from "@app/aptible-ai";
import { Line } from "react-chartjs-2";
import { annotationsPlugin } from "../../../chart/chartjs-plugin-annotations";
import { verticalLinePlugin } from "../../../chart/chartjs-plugin-vertical-line";
import type { HoverState } from "./hover";

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
  verticalLinePlugin,
  annotationsPlugin,
);

export const DiagnosticsLineChart = ({
  showLegend = true,
  keyId,
  chart: { labels, datasets: originalDatasets, title },
  xAxisUnit,
  yAxisLabel,
  yAxisUnit,
  annotations = [],
  synchronizedHoverContext,
}: {
  showLegend?: boolean;
  keyId: string;
  chart: {
    title: string;
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
    }>;
  };
  xAxisUnit: TimeUnit;
  yAxisLabel?: string;
  yAxisUnit?: string;
  annotations?: Annotation[];
  synchronizedHoverContext: React.Context<HoverState>;
}) => {
  const { timestamp, setTimestamp } = useContext(synchronizedHoverContext);
  const chartRef = React.useRef<ChartJS<"line">>();

  // Truncate sha256 resource names to 8 chars
  const datasets = originalDatasets.map((dataset) => ({
    ...dataset,
    label:
      dataset.label.length === 64 ? dataset.label.slice(0, 8) : dataset.label,
  }));

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    if (!timestamp) {
      chart.setActiveElements([]);
      chart.tooltip?.setActiveElements([], { x: 0, y: 0 });
      chart.update();
      return;
    }

    const timestampIndex = labels.indexOf(timestamp);
    if (timestampIndex === -1) return;

    const activeElements = datasets.reduce<
      {
        datasetIndex: number;
        index: number;
      }[]
    >((acc, dataset, datasetIndex) => {
      if (!dataset.data[timestampIndex]) return acc;

      return [
        ...acc,
        {
          datasetIndex,
          index: timestampIndex,
        },
      ];
    }, []);

    chart.setActiveElements(activeElements);
    chart.tooltip?.setActiveElements(activeElements, { x: 0, y: 0 });
    chart.update();
  }, [timestamp, labels, datasets]);

  const formatYAxisTick = (value: number, unit?: string) => {
    const unitStr = unit?.trim() ?? "";

    if (!unitStr) return value;

    if (unitStr === "%") return `${value}%`;
    if (unitStr.endsWith("B")) return `${value}${unitStr}`;

    return value;
  };

  if (!datasets || !title) return null;

  return (
    <Line
      ref={chartRef}
      datasetIdKey={keyId}
      data={{
        labels,
        datasets,
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          tooltip: {
            enabled: true,
            mode: "index",
            intersect: false,
          },
          colors: {
            forceOverride: true,
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
            display: false,
            text: title,
            padding: showLegend
              ? undefined
              : {
                  top: 10,
                  bottom: 30,
                },
          },
          annotations: annotations,
        },
        interaction: {
          mode: "index",
          intersect: false,
        },
        onHover: (event, elements, chart) => {
          if (!event.native) return;

          if (elements && elements.length > 0) {
            const timestamp = labels[elements[0].index];
            setTimestamp(timestamp);
          } else {
            setTimestamp(null);
          }
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
            adapters: {
              date: {
                zone: "UTC",
              },
            },
            time: {
              tooltipFormat: "yyyy-MM-dd HH:mm:ss 'UTC'",
              unit: xAxisUnit,
              displayFormats: {
                minute: "HH:mm 'UTC'",
                day: "MMM dd",
              },
            },
            type: "time",
          },
          y: {
            min: 0,
            border: {
              display: false,
            },
            title: yAxisLabel
              ? {
                  display: true,
                  text: yAxisLabel,
                }
              : undefined,
            ticks: {
              callback: (value) => formatYAxisTick(value as number, yAxisUnit),
              color: "#111920",
            },
          },
        },
      }}
    />
  );
};
