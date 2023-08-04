import cn from "classnames";
import { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useLoader } from "saga-query/react";

import { prettyEnglishDateWithTime } from "@app/date";
import { deleteBackup, selectDatabaseById } from "@app/deploy";
import { databaseDetailUrl, operationDetailUrl } from "@app/routes";
import { capitalize } from "@app/string-utils";
import { AppState, DeployBackup } from "@app/types";

import { BannerMessages } from "../banner";
import { ButtonDestroy } from "../button";
import { ResourceListView } from "../resource-list-view";
import { TableHead, Td } from "../table";
import { tokens } from "../tokens";

const BackupTypePill = ({ manual }: { manual: boolean }): ReactElement => {
  const className = cn(
    "rounded-full border-2",
    "text-sm font-semibold ",
    "px-2 flex justify-between items-center w-fit",
  );

  return (
    <div
      className={cn(
        className,
        manual
          ? "bg-indigo-100 text-indigo-400 border-indigo-300"
          : "bg-lime-100 text-green-400 border-lime-300",
      )}
    >
      <div>{manual ? "Manual" : "Auto"}</div>
    </div>
  );
};

const DeleteBackup = ({ envId, id }: { envId: string; id: string }) => {
  const dispatch = useDispatch();
  const action = deleteBackup({ id });
  const loader = useLoader(action);
  const onClick = () => {
    dispatch(action);
  };

  return (
    <ButtonDestroy
      envId={envId}
      variant="delete"
      size="sm"
      onClick={onClick}
      isLoading={loader.isLoading}
    >
      Delete
    </ButtonDestroy>
  );
};

const BackupListRow = ({
  backup,
}: {
  backup: DeployBackup;
}) => {
  const db = useSelector((s: AppState) =>
    selectDatabaseById(s, { id: backup.databaseId }),
  );
  const createdByOpId = backup.createdFromOperationId;

  return (
    <tr className="group hover:bg-gray-50" key={`${backup.id}`}>
      <Td>
        <div className={tokens.type["normal lighter"]}>{backup.id}</div>
      </Td>

      <Td>
        <Link to={databaseDetailUrl(backup.databaseId)}>{db.handle}</Link>
      </Td>

      <Td className="flex-1">
        <div className="text-gray-900">
          <BackupTypePill manual={backup.manual} />
        </div>
      </Td>

      <Td className="flex-1">
        <div className="text-gray-900">{backup.size} GB</div>
      </Td>

      <Td className="flex-1">
        <div className="text-gray-900">
          {backup.awsRegion
            .split("-")
            .map((s) => capitalize(s))
            .join("-")}
        </div>
      </Td>

      <Td className="flex-1 pl-4">
        <div className={tokens.type.darker}>
          {prettyEnglishDateWithTime(backup.createdAt)}
        </div>
      </Td>

      <Td className="flex-1">
        <div className="text-gray-900">{backup.createdByEmail}</div>
      </Td>

      <Td className="flex-1">
        <div className="text-gray-900">
          <Link to={operationDetailUrl(createdByOpId)}>{createdByOpId}</Link>
        </div>
      </Td>

      <Td>
        <DeleteBackup id={backup.id} envId={backup.environmentId} />
      </Td>
    </tr>
  );
};

export const DatabaseBackupsList = ({
  backups,
}: {
  backups: DeployBackup[];
}) => {
  const loader = useLoader(deleteBackup);

  return (
    <div className="my-4">
      <div className="mb-4">
        <BannerMessages {...loader} />
      </div>

      <ResourceListView
        tableHeader={
          <TableHead
            headers={[
              "ID",
              "Database",
              "Type",
              "Size",
              "Region",
              "Created At",
              "Creator",
              "Created from Operation",
              "Actions",
            ]}
          />
        }
        tableBody={
          <>
            {backups.map((backup) => (
              <BackupListRow key={backup.id} backup={backup} />
            ))}
          </>
        }
      />
    </div>
  );
};
