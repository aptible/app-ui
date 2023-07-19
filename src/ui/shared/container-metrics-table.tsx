import { Loading } from "./loading";
import { TableHead, Td } from "./table";
import { fetchMetricTunnelDataForContainer } from "@app/metric-tunnel";
import { DeployContainer } from "@app/types";
import { useEffect } from "react";
import { useCache } from "saga-query/react";

export const ContainerMetricsDataTable = ({
  container,
  dataToFetch,
  viewHorizon,
}: {
  container: DeployContainer;
  dataToFetch: string[];
  viewHorizon: MetricHorizons;
}) => {
  // WARNING - this requires a better long term solution. We are doing this just to set up the
  // queries / transform data for viewing this in browser (as there are concurrent metrictunnel changes to this)
  // We likely will want a cachable/datastore-based solution at some point. This is temporary
  const constructQueries = dataToFetch.map((datumToFetch) =>
    useCache(
      fetchMetricTunnelDataForContainer({
        containerId: container.id,
        horizon: viewHorizon,
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
  const resultantData: { [columnName: string]: (string | number)[] } = {};
  constructQueries.forEach((query, queryIdx) => {
    // timefield is always time_0, deltas are used sometimes with time_1 where available
    query.data.columns.forEach((colDataSeries: (string | number)[]) => {
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
      <tr className="hover:bg-gray-50" key={`${i}`}>
        {columnHeaders.map((columnHeader) => (
          <Td className="text-gray-900" key={`${i}-${columnHeader}`}>
            {resultantData[columnHeader][i]}
          </Td>
        ))}
      </tr>,
    );
  }

  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg lg:w-full w-[calc(100vw-7.5rem)]">
      <table className="min-w-full divide-y divide-gray-300">
        <TableHead headers={columnHeaders} />
        <tbody className="divide-y divide-gray-200 bg-white">{tableRows}</tbody>
      </table>
    </div>
  );
};
