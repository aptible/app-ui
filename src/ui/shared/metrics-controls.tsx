import { Button } from "./button";
import { IconHamburger, IconMetrics } from "./icons";
import { MetricHorizons } from "@app/deploy";

export type MetricTabTypes = "table" | "chart";
export type Dataset = {
  label?: string;
  pointRadius?: number;
  pointHoverRadius?: number;
  data: number[];
};
export type ChartToCreate = {
  title: string;
  labels?: string[];
  datasets?: Dataset[];
};

export const processDataSeries = ({
  colDataSeries,
  colName,
}: { colDataSeries: any; colName: string }) => {
  const dataSeries: Dataset = {
    label: colName,
    pointRadius: 0,
    pointHoverRadius: 5,
    data: [],
  };
  colDataSeries.forEach(
    (elem: string | number | undefined | null, idx: number) => {
      if (idx === 0) return;
      if (typeof elem !== "number") return;
      dataSeries.data.push(elem);
    },
  );

  return dataSeries;
};

export const MetricsViewControls = ({
  viewMetricTab,
  setViewMetricTab,
}: {
  viewMetricTab: MetricTabTypes;
  setViewMetricTab: (metricTabTypes: MetricTabTypes) => void;
}) => {
  return (
    <div className="flex">
      <Button
        className={`rounded-r-none ${
          viewMetricTab === "chart" ? "pointer-events-none !bg-black-100" : ""
        }`}
        variant="white"
        size="md"
        disabled={viewMetricTab === "chart"}
        onClick={() => setViewMetricTab("chart")}
      >
        <IconMetrics className="inline h-5 mr-1 mt-0" />
        Charts
      </Button>
      <Button
        className={`rounded-l-none ${
          viewMetricTab === "table" ? "pointer-events-none !bg-black-100" : ""
        }`}
        variant="white"
        size="md"
        disabled={viewMetricTab === "table"}
        onClick={() => setViewMetricTab("table")}
      >
        <IconHamburger className="inline h-5 mr-1 mt-0" />
        Table
      </Button>
    </div>
  );
};

export const MetricsHorizonControls = ({
  viewHorizon,
  setViewHorizon,
}: {
  viewHorizon: MetricHorizons;
  setViewHorizon: (metricHorizon: MetricHorizons) => void;
}) => {
  return (
    <div className="flex">
      <Button
        className={`rounded-r-none hover:z-10 ${
          viewHorizon === "1h" ? "pointer-events-none !bg-black-100" : ""
        }`}
        variant="white"
        size="md"
        disabled={viewHorizon === "1h"}
        onClick={() => setViewHorizon("1h")}
      >
        1H
      </Button>
      <Button
        className={`rounded-none -ml-[1px] -mr-[1px] hover:z-10 ${
          viewHorizon === "1d" ? "pointer-events-none !bg-black-100" : ""
        }`}
        variant="white"
        size="md"
        disabled={viewHorizon === "1d"}
        onClick={() => setViewHorizon("1d")}
      >
        1D
      </Button>
      <Button
        className={`rounded-l-none hover:z-10 ${
          viewHorizon === "1w" ? "pointer-events-none !bg-black-100" : ""
        }`}
        variant="white"
        size="md"
        disabled={viewHorizon === "1w"}
        onClick={() => setViewHorizon("1w")}
      >
        1W
      </Button>
    </div>
  );
};
