import { prettyDateRelative } from "@app/date";
import { selectEnvironmentById } from "@app/deploy";
import { capitalize } from "@app/string-utils";
import { AppState, DeployOperation } from "@app/types";
import { useSelector } from "react-redux";
import { Td } from "../table";
import { IconForResource } from "./environment-activity";

export const EnvironmentOperationActivity = ({
  operation,
}: {
  operation: DeployOperation;
}) => {
  const environment = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: operation.environmentId }),
  );

  return (
    <tr key={operation.id}>
      <Td className="py-0 pr-0">{IconForResource(operation.status)}</Td>
      <Td className="pl-0 2xl:flex-cell-md sm:flex-cell-sm">
        <span className="font-semibold text-black">
          {capitalize(operation.resourceType)} {operation.type}{" "}
          {operation.status}{" "}
        </span>
        <span>for {environment?.handle ?? "Unknown"}</span>
        <br />
        <span style={{ textTransform: "capitalize" }}>
          {prettyDateRelative(operation.createdAt)}
        </span>
      </Td>
    </tr>
  );
};
