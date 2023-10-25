import { prettyEnglishDateWithTime } from "@app/date";
import { deleteBackup, selectDatabaseById } from "@app/deploy";
import {
  backupRestoreUrl,
  databaseDetailUrl,
  operationDetailUrl,
} from "@app/routes";
import { AppState, DeployBackup } from "@app/types";
import { usePaginate } from "@app/ui/hooks";
import cn from "classnames";
import { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useLoader } from "saga-query/react";
import { BannerMessages } from "../banner";
import { ButtonCreate, ButtonDestroy } from "../button";
import { Group } from "../group";
import { DescBar, FilterBar, PaginateBar } from "../resource-list-view";
import { EmptyTr, TBody, THead, Table, Td, Th, Tr } from "../table";
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
      requireConfirm
    >
      Delete
    </ButtonDestroy>
  );
};

const BackupListRow = ({
  backup,
  showDatabase = true,
}: {
  backup: DeployBackup;
  showDatabase?: boolean;
}) => {
  const navigate = useNavigate();
  const db = useSelector((s: AppState) =>
    selectDatabaseById(s, { id: backup.databaseId }),
  );
  const createdByOpId = backup.createdFromOperationId;
  const onRestore = () => {
    navigate(backupRestoreUrl(backup.id));
  };

  return (
    <Tr>
      <Td>
        <div className={tokens.type["normal lighter"]}>
          {backup.copiedFromId ? `Copy of ${backup.copiedFromId}` : backup.id}
        </div>
      </Td>

      {showDatabase ? (
        <Td>
          <Link
            className="text-black group-hover:text-indigo hover:text-indigo"
            to={databaseDetailUrl(backup.databaseId)}
          >
            {db.handle}
          </Link>
        </Td>
      ) : null}

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
          {backup.awsRegion.split("-").join("-")}
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
          <Link
            className="text-black group-hover:text-indigo hover:text-indigo"
            to={operationDetailUrl(createdByOpId)}
          >
            {createdByOpId}
          </Link>
        </div>
      </Td>

      <Td className="flex gap-2 justify-end mr-4">
        <ButtonCreate
          envId={backup.environmentId}
          onClick={onRestore}
          size="sm"
        >
          Restore
        </ButtonCreate>
        <DeleteBackup id={backup.id} envId={backup.environmentId} />
      </Td>
    </Tr>
  );
};

export const DatabaseBackupsList = ({
  backups,
  showDatabase = true,
}: {
  backups: DeployBackup[];
  showDatabase?: boolean;
}) => {
  const loader = useLoader(deleteBackup);
  const paginated = usePaginate(backups);

  return (
    <Group>
      <Group size="sm">
        <BannerMessages {...loader} />

        <FilterBar>
          <Group variant="horizontal" size="lg" className="items-center">
            <DescBar>{paginated.totalItems} Backups</DescBar>
            <PaginateBar {...paginated} />
          </Group>
        </FilterBar>
      </Group>

      <Table>
        <THead>
          <Th>ID</Th>
          {showDatabase ? <Th>Database</Th> : null}
          <Th>Type</Th>
          <Th>Region</Th>
          <Th>Created At</Th>
          <Th>Creator</Th>
          <Th>Operation ID</Th>
          <Th>Actions</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? (
            <EmptyTr colSpan={showDatabase ? 8 : 7} />
          ) : null}
          {paginated.data.map((backup) => (
            <BackupListRow
              key={backup.id}
              backup={backup}
              showDatabase={showDatabase}
            />
          ))}
        </TBody>
      </Table>
    </Group>
  );
};
