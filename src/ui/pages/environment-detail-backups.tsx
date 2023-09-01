import { useSelector } from "react-redux";
import { useParams } from "react-router";

import {
  fetchDatabaseBackupsByEnvironment,
  selectBackupsByEnvId,
} from "@app/deploy";
import { useQuery } from "@app/fx";
import type { AppState } from "@app/types";

import { BackupRpView, DatabaseBackupsList } from "../shared";

export const EnvironmentBackupsPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchDatabaseBackupsByEnvironment({ id }));
  const backups = useSelector((s: AppState) =>
    selectBackupsByEnvId(s, { envId: id }),
  );

  return (
    <div className="flex flex-col">
      <BackupRpView envId={id} />
      <DatabaseBackupsList backups={backups} />
    </div>
  );
};
