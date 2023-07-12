import { Button, IconHamburger, IconMetrics, LoadResources } from "../shared";
import { ContainerMetricsChart } from "../shared/container-metrics-chart";
import { ContainerMetricsDataTable } from "../shared/container-metrics-table";
import {
  fetchContainersByReleaseId,
  fetchEnvironmentServices,
  fetchRelease,
  fetchService,
  selectContainersByReleaseIdByLayerType,
  selectDatabaseById,
  selectServiceById,
} from "@app/deploy";
import { AppState } from "@app/types";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { useQuery } from "saga-query/react";

export function DatabaseMetricsPage() {
  const { id = "" } = useParams();
  const db = useSelector((s: AppState) => selectDatabaseById(s, { id }));
  const [viewTab, setViewTab] = useState<"table" | "chart">("chart");
  const [viewHorizon, setViewHorizon] = useState<"1h" | "1d" | "1w">("1h");
  const query = useQuery(fetchEnvironmentServices({ id: db.environmentId }));
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: db.serviceId }),
  );
  useQuery(fetchService({ id: db.serviceId }));
  useQuery(fetchRelease({ id: service.currentReleaseId }));
  useQuery(fetchContainersByReleaseId({ releaseId: service.currentReleaseId }));
  const containers = useSelector((s: AppState) =>
    selectContainersByReleaseIdByLayerType(s, {
      layers: ["app", "database"],
      releaseId: service.currentReleaseId,
    }),
  );

  const dataToFetch = ["cpu_pct", "la", "memory_all", "iops", "fs"];

  return (
    <>
      <div className="flex gap-4 justify-start">
        <div className="flex">
          <Button
            className={`rounded-r-none ${
              viewTab === "chart" ? "pointer-events-none !bg-black-100" : ""
            }`}
            variant="white"
            size="md"
            disabled={viewTab === "chart"}
            onClick={() => setViewTab("chart")}
          >
            <IconMetrics className="inline h-5 mr-1 mt-0" />
            Charts
          </Button>
          <Button
            className={`rounded-l-none ${
              viewTab === "table" ? "pointer-events-none !bg-black-100" : ""
            }`}
            variant="white"
            size="md"
            disabled={viewTab === "table"}
            onClick={() => setViewTab("table")}
          >
            <IconHamburger className="inline h-5 mr-1 mt-0" />
            Table
          </Button>
        </div>
        <div className="flex">
          <Button
            className={`rounded-r-none ${
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
            className={`rounded-l-none ${
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
            className={`rounded-l-none ${
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
      </div>
      <LoadResources query={query} isEmpty={false}>
        {containers.map((container) => (
          <div className="my-4">
            {viewTab === "chart" ? (
              <ContainerMetricsChart
                key={`${container.id}-chart`}
                viewHorizon={viewHorizon}
                container={container}
                dataToFetch={dataToFetch}
              />
            ) : (
              <ContainerMetricsDataTable
                viewHorizon={viewHorizon}
                key={container.id}
                container={container}
                dataToFetch={dataToFetch}
              />
            )}
          </div>
        ))}
      </LoadResources>
    </>
  );
}
