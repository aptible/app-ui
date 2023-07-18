import { useQuery } from "@app/fx";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import {
  fetchEnvironmentServices,
  fetchRelease,
  selectAppById,
  selectServiceById,
} from "@app/deploy";
import { AppState } from "@app/types";

import { LoadResources } from "../shared";
import { ContainerMetricsDataTable } from "../shared/container-metrics-table";
import {
  MetricsHorizonControls,
  MetricsViewControls,
} from "../shared/metrics-controls";
import {
  fetchContainersByReleaseId,
  selectContainersByReleaseIdByLayerType,
} from "@app/deploy/container";
import { useState } from "react";

export function AppDetailServicePage() {
  const { id = "", serviceId = "" } = useParams();
  const [viewTab, setViewTab] = useState<"table" | "chart">("chart");
  const [viewHorizon, setViewHorizon] = useState<"1h" | "1d" | "1w">("1h");
  const app = useSelector((s: AppState) => selectAppById(s, { id }));
  const query = useQuery(fetchEnvironmentServices({ id: app.environmentId }));
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: serviceId }),
  );
  useQuery(fetchRelease({ id: service.currentReleaseId }));
  useQuery(fetchContainersByReleaseId({ releaseId: service.currentReleaseId }));
  const containers = useSelector((s: AppState) =>
    selectContainersByReleaseIdByLayerType(s, {
      layers: ["app", "database"],
      releaseId: service.currentReleaseId,
    }),
  );

  const dataToFetch = ["cpu_pct", "la", "memory_all"];
  return (
    <>
      <div className="flex gap-4 justify-start">
        <MetricsViewControls
          viewMetricTab={viewTab}
          setViewMetricTab={setViewTab}
        />
        <MetricsHorizonControls
          viewHorizon={viewHorizon}
          setViewHorizon={setViewHorizon}
        />
      </div>
      <LoadResources query={query} isEmpty={false}>
        {containers.map((container) => (
          <div className="my-4" key={container.id}>
            {viewTab === "chart" ? null : (
              <ContainerMetricsDataTable
                container={container}
                dataToFetch={dataToFetch}
                viewHorizon={viewHorizon}
              />
            )}
          </div>
        ))}
      </LoadResources>
    </>
  );
}
