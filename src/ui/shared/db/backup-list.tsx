import { prettyEnglishDateWithTime } from "@app/date";
import { deleteBackup } from "@app/deploy";
import { useLoader } from "@app/fx";
import {
  backupRestoreUrl,
  databaseDetailUrl,
  operationDetailUrl,
} from "@app/routes";
import { DeployBackup } from "@app/types";
import { usePaginate } from "@app/ui/hooks";
import cn from "classnames";
import { ReactElement } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BannerMessages } from "../banner";
import { ButtonCreate, ButtonDestroy } from "../button";
import { Group } from "../group";
import { DescBar, FilterBar, PaginateBar } from "../resource-list-view";
import { EmptyTr, TBody, THead, Table, Td, Th, Tr } from "../table";
import { tokens } from "../tokens";

const BackupTypePill = ({
  manual,
  final,
}: { manual: boolean; final: boolean }): ReactElement => {
  const className = cn(
    "rounded-full border-2",
    "text-sm font-semibold ",
    "px-2 flex justify-between items-center w-fit",
  );
  let type = "";
  if (final) {
    type = "Final";
  } else if (manual) {
    type = "Manual";
  } else {
    type = "Auto";
  }

  return (
    <div
      className={cn(
        className,
        manual
          ? "bg-indigo-100 text-indigo-400 border-indigo-300"
          : "bg-lime-100 text-green-400 border-lime-300",
      )}
    >
      <div>{type}</div>
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
  showFinal = false,
}: {
  backup: DeployBackup;
  showDatabase?: boolean;
  showFinal?: boolean;
}) => {
  const navigate = useNavigate();
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
            {backup.databaseHandle}
          </Link>
        </Td>
      ) : null}

      <Td className="flex-1">
        <div className="text-gray-900">
          <BackupTypePill manual={backup.manual} final={showFinal} />
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

      <Td variant="right" className="flex gap-2">
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
  showFinal = false,
}: {
  backups: DeployBackup[];
  showDatabase?: boolean;
  showFinal?: boolean;
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
          <Th>Size</Th>
          <Th>Region</Th>
          <Th>Created At</Th>
          <Th>Creator</Th>
          <Th>Operation ID</Th>
          <Th variant="right">Actions</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? (
            <EmptyTr colSpan={showDatabase ? 9 : 8} />
          ) : null}
          {paginated.data.map((backup) => (
            <BackupListRow
              key={backup.id}
              backup={backup}
              showDatabase={showDatabase}
              showFinal={showFinal}
            />
          ))}
        </TBody>
      </Table>
    </Group>
  );
};
