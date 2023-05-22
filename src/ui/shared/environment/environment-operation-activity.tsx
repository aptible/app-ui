import { useSelector } from "react-redux";

import { prettyDateRelative } from "@app/date";
import { selectEnvironmentById } from "@app/deploy";
import { capitalize } from "@app/string-utils";
import { AppState, DeployOperation, OperationStatus } from "@app/types";

import { IconCheckCircle, IconInfo, IconX } from "../icons";
import { Td } from "../table";

export const IconForResource = (operationStatus: OperationStatus) => {
  if (operationStatus === "succeeded") {
    return <IconCheckCircle color="#00633F" />;
  } else if (operationStatus === "queued" || operationStatus === "running") {
    return <IconInfo color="#4361FF" />;
  }
  return <IconX color="#AD1A1A" />;
};

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
      <Td className="pl-4 py-0 pr-0">{IconForResource(operation.status)}</Td>
      <Td className="pl-0 2xl:flex-cell-md sm:flex-cell-sm">
        <span className="font-semibold text-black">
          {capitalize(operation.resourceType)} {operation.type}{" "}
          {operation.status}{" "}
        </span>
        <span className="text-black">
          for {environment?.handle ?? "Unknown"}
        </span>
        <br />
        <span style={{ textTransform: "capitalize" }}>
          {prettyDateRelative(operation.createdAt)}
        </span>
      </Td>
    </tr>
  );
};
