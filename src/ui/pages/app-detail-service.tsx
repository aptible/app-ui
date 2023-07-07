import { useCache, useQuery } from "@app/fx";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import {
  fetchEnvironmentServices,
  fetchRelease,
  selectAppById,
  selectServiceById,
} from "@app/deploy";
import { AppState, DeployContainer } from "@app/types";

import { LoadResources, Loading, TableHead, Td } from "../shared";
import {
  fetchContainersByReleaseId,
  selectContainersByReleaseId,
} from "@app/deploy/container";
import { fetchMetricTunnelForAppCpu } from "@app/metric-tunnel";
import { useEffect } from "react";

const AppServiceDataTable = ({
  container,
  dataToFetch,
}: { container: DeployContainer; dataToFetch: string[] }) => {
  const constructQueries = dataToFetch.map((datumToFetch) =>
    useCache(
      fetchMetricTunnelForAppCpu({
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
  const resultantData: { [columnName: string]: string[] | number[] } = {};
  constructQueries.forEach((query, queryIdx) => {
    // timefield is always time_0, deltas are used sometimes with time_1 where available
    query.data.columns.forEach((colDataSeries: string[] | number[]) => {
      const colName =
        typeof colDataSeries[0] === "string" &&
        colDataSeries[0].includes("time_")
          ? colDataSeries[0]
          : `${dataToFetch[queryIdx]} - ${colDataSeries[0]}`;
      resultantData[colName] = [];
      colDataSeries.forEach((elem: string | number, idx) => {
        if (idx === 0) {
          return;
        }
        resultantData[colName].push(elem);
      });
    });
  });
  console.log(resultantData);
  // keep the date columns in front
  const prefixedColumnHeaders = Object.keys(resultantData).filter((column) =>
    column.includes("time_"),
  );
  const columnHeaders = prefixedColumnHeaders.concat(
    Object.keys(resultantData)
      .sort()
      .filter((column) => !column.includes("time_")),
  );
  const tableRows = [];
  for (let i = 0; i < Object.values(resultantData)[0].length; i += 1) {
    tableRows.push(
      <tr key={`${i}`}>
        {columnHeaders.map((columnHeader) => (
          <Td key={`${i}-${columnHeader}`}>{resultantData[columnHeader][i]}</Td>
        ))}
      </tr>,
    );
  }

  return (
    <>
      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg my-4 mx-4 sm:my-auto sm:mx-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <TableHead headers={columnHeaders} />
          <tbody className="divide-y divide-gray-200 bg-white">
            {tableRows}
          </tbody>
        </table>
      </div>
    </>
  );
  return <p>{container.id}</p>;
};

export function AppDetailServicePage() {
  const { id = "", serviceId = "" } = useParams();
  const app = useSelector((s: AppState) => selectAppById(s, { id }));
  const query = useQuery(fetchEnvironmentServices({ id: app.environmentId }));
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: serviceId }),
  );
  useQuery(fetchRelease({ id: service.currentReleaseId }));
  useQuery(fetchContainersByReleaseId({ releaseId: service.currentReleaseId }));
  const containers = useSelector((s: AppState) =>
    selectContainersByReleaseId(s, { releaseId: service.currentReleaseId }),
  );

  const dataToFetch = ["cpu_pct", "la", "memory_all"];
  return (
    <LoadResources query={query} isEmpty={false}>
      {containers.map((container) => (
        <AppServiceDataTable
          key={container.id}
          container={container}
          dataToFetch={dataToFetch}
        />
      ))}
    </LoadResources>
  );
}
