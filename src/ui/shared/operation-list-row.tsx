import { prettyEnglishDateWithTime, timeBetween } from "@app/date";
import {
  selectAppById,
  selectDatabaseById,
  selectEnvironmentById,
} from "@app/deploy";
import { extractIdFromLink, extractResourceNameFromLink } from "@app/hal";
import { capitalize } from "@app/string-utils";
import { AppState, DeployOperationResponse, OperationStatus } from "@app/types";
import { SyntheticEvent, useEffect, useState } from "react";
import { useSelector } from "react-redux";
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
}: { operationStatus: OperationStatus }) => {
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
        {prettyEnglishDateWithTime(operation.created_at)}
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
  const resourceType = extractResourceNameFromLink(operation._links.resource);
  const resourceId = extractIdFromLink(operation._links.resource);
  const environmentId = extractIdFromLink(operation._links.account);
  const [resourceHandle, setResourceHandle] = useState("");
  const resource = useSelector((s: AppState) =>
    resourceType === "database"
      ? selectDatabaseById(s, { id: resourceId })
      : selectAppById(s, { id: resourceId }),
  );
  const environment = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: environmentId }),
  );

  useEffect(() => {
    setResourceHandle(resource.handle);
  }, [resource.handle]);

  return (
    <Td className="flex-1 justify-center">
      <div className="flex justify-center">
        <ButtonIcon
          icon={<IconCopy className="-mr-2" variant="sm" />}
          onClick={(e: SyntheticEvent) => {
            e.preventDefault();
            // the only choices are app or database for this flag
            const resourceString = resourceType === "database" ? "db" : "app";
            navigator.clipboard.writeText(
              `aptible logs --${resourceString} ${resourceHandle} --env ${environment.handle}`,
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
    <tr>
      <OperationPrimaryCell operation={operation} />
      <OperationCell operation={operation} />
      <ViewLogsCell operation={operation} />
      <DownloadLogsCell operation={operation} />
    </tr>
  );
};
