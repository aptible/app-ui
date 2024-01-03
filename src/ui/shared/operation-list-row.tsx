import { prettyDateTime, timeBetween } from "@app/date";
import { DeployOperationResponse } from "@app/deploy";
import { capitalize } from "@app/string-utils";
import { OperationStatus } from "@app/types";
import { SyntheticEvent } from "react";
import { ButtonIcon } from "./button";
import {
  IconCheckCircle,
  IconCopy,
  IconDownload,
  IconInfo,
  IconX,
} from "./icons";
import { Td } from "./table";

interface OperationCellProps {
  operation: DeployOperationResponse;
}

export const IconForOperation = ({
  operationStatus,
}: {
  operationStatus: OperationStatus;
}) => {
  if (operationStatus === "succeeded") {
    return <IconCheckCircle color="#00633F" />;
  } else if (operationStatus === "queued" || operationStatus === "running") {
    return <IconInfo color="#4361FF" />;
  }
  return <IconX color="#AD1A1A" />;
};

const OperationPrimaryCell = ({ operation }: OperationCellProps) => {
  return (
    <Td className="flex-1">
      <div className="font-base text-gray-900">
        {prettyDateTime(operation.created_at)}
      </div>
      <div className="font-light text-gray-500">
        Duration:{" "}
        {timeBetween({
          startDate: operation.created_at,
          endDate: operation.updated_at,
        })}
      </div>
    </Td>
  );
};

const OperationCell = ({ operation }: OperationCellProps) => {
  return (
    <Td className="flex-1 flex flex-no-wrap">
      <div className="mt-2 mr-2">
        <IconForOperation operationStatus={operation.status} />
      </div>
      <div>
        <div className="font-base text-gray-900">
          {capitalize(operation.type)} {capitalize(operation.status)}
        </div>
        <div className="font-light text-gray-500">ID: {operation.id}</div>
      </div>
    </Td>
  );
};

const ViewLogsCell = ({ operation }: OperationCellProps) => {
  return (
    <Td className="flex-1 justify-center">
      <div className="flex justify-center">
        <ButtonIcon
          icon={<IconCopy className="-mr-2" variant="sm" />}
          onClick={(e: SyntheticEvent) => {
            e.preventDefault();
            // the only choices are app or database for this flag
            navigator.clipboard.writeText(
              `aptible operation:logs ${operation.id}`,
            );
          }}
          variant="white"
        />
      </div>
    </Td>
  );
};

const DownloadLogsCell = ({ operation }: OperationCellProps) => {
  // TODO - need to revisit this link
  return (
    <Td className="flex-1">
      <div className="flex justify-center">
        <a
          href={`/operations/${operation.id}/logs`}
          target="_blank"
          rel="noreferrer"
        >
          <ButtonIcon
            icon={<IconDownload className="-mr-2" variant="sm" />}
            variant="white"
          />
        </a>
      </div>
    </Td>
  );
};

export const OperationListRow = ({ operation }: OperationCellProps) => {
  return (
    <tr className="group hover:bg-gray-50">
      <OperationPrimaryCell operation={operation} />
      <OperationCell operation={operation} />
      <ViewLogsCell operation={operation} />
      <DownloadLogsCell operation={operation} />
    </tr>
  );
};
