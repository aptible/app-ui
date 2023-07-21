import { TableHead, Td } from "./table";
import { selectMetricDataAsFlatTableByContainer } from "@app/metric-tunnel";
import { AppState, DeployContainer, MetricHorizons } from "@app/types";
import { useSelector } from "react-redux";

export const ContainerMetricsDataTable = ({
  containers,
  metricHorizon,
}: {
  containers: DeployContainer[];
  metricHorizon: MetricHorizons;
}) => {
  // will support multiple containers next, placeholder for this (and for debugging/verification)
  const containerIds = containers.map((container) => container.id);

  const metricTableData = useSelector((s: AppState) =>
    selectMetricDataAsFlatTableByContainer(s, {
      containerIds,
      metricHorizon,
    }),
  );
  // keep the date columns in front
  const prefixedColumnHeaders = Object.keys(metricTableData).filter((column) =>
    column.includes("time"),
  );
  const columnHeaders = prefixedColumnHeaders.concat(
    Object.keys(metricTableData)
      .sort()
      .filter((column) => !column.includes("time")),
  );
  const tableRows = [];
  for (let i = 0; i < Object.values(metricTableData)[0].length; i += 1) {
    tableRows.push(
      <tr className="hover:bg-gray-50" key={`${i}`}>
        {columnHeaders.map((columnHeader) => (
          <Td className="text-gray-900" key={`${i}-${columnHeader}`}>
            {metricTableData[columnHeader][i]}
          </Td>
        ))}
      </tr>,
    );
  }

  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg w-[calc(100vw-7.5rem)]">
      <table className="overflow-x-auto min-w-full divide-y divide-gray-300">
        <TableHead headers={columnHeaders} />
        <tbody className="divide-y divide-gray-200 bg-white">{tableRows}</tbody>
      </table>
    </div>
  );
};
