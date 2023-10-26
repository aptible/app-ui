import { selectMetricDataAsFlatTableByContainer } from "@app/metric-tunnel";
import { AppState, DeployContainer, MetricHorizons } from "@app/types";
import { useSelector } from "react-redux";
import { TBody, THead, Table, Td, Th, Tr } from "./table";

export const ContainerMetricsDataTable = ({
  containers,
  metricHorizon,
}: {
  containers: DeployContainer[];
  metricHorizon: MetricHorizons;
}) => {
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
      <Tr key={`${i}`}>
        {columnHeaders.map((columnHeader) => (
          <Td className="text-gray-900" key={`${i}-${columnHeader}`}>
            {metricTableData[columnHeader][i]}
          </Td>
        ))}
      </Tr>,
    );
  }

  return (
    <Table>
      <THead>
        {columnHeaders.map((header) => {
          return <Th key={header}>{header}</Th>;
        })}
      </THead>
      <TBody>{tableRows}</TBody>
    </Table>
  );
};
