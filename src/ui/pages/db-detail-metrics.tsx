import { Button, LoadResources } from "../shared";
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
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { useQuery } from "saga-query/react";
import { ContainerMetricsChart } from "../shared/container-metrics-chart";
import { useState } from "react";

export function DatabaseMetricsPage() {
  const { id = "" } = useParams();
  const db = useSelector((s: AppState) => selectDatabaseById(s, { id }));
  const [viewTab, setViewTab] = useState<"table" | "chart">("chart");
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
      <div className="flex m-auto gap-2">
        <Button
          className={`rounded-r-none ${
            viewTab === "chart" ? "pointer-events-none bg-black-100" : ""
          }`}
          variant="white"
          size="xs"
          disabled={viewTab === "chart"}
          onClick={() => setViewTab("chart")}
        >
          Chart
        </Button>
        <Button
          className={`rounded-l-none ${
            viewTab === "table" ? "pointer-events-none bg-black-100" : ""
          }`}
          variant="white"
          size="xs"
          disabled={viewTab === "table"}
          onClick={() => setViewTab("table")}
        >
          Table
        </Button>
      </div>
      <LoadResources query={query} isEmpty={false}>
        {containers.map((container) => (
          <div className="my-4">
            {viewTab === "chart" ? (
              <ContainerMetricsChart
                key={`${container.id}-chart`}
                container={container}
                dataToFetch={dataToFetch}
              />
            ) : (
              <ContainerMetricsDataTable
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
