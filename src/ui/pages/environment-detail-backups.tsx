import { useSelector } from "react-redux";
import { useParams } from "react-router";

import {
  fetchDatabaseBackupsByEnvironment,
  fetchDatabasesByEnvId,
  selectOrphanedBackupsByEnvId,
} from "@app/deploy";
import { useQuery } from "@app/fx";
import type { AppState } from "@app/types";

import { BackupRpView, Banner, DatabaseBackupsList } from "../shared";

export const EnvironmentBackupsPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchDatabasesByEnvId({ envId: id }));
  useQuery(fetchDatabaseBackupsByEnvironment({ id, orphaned: true }));
  const backups = useSelector((s: AppState) =>
    selectOrphanedBackupsByEnvId(s, { envId: id }),
  );

  return (
    <div className="flex flex-col">
      <BackupRpView envId={id} />
      <Banner variant="info" className="mt-6">
        <b>Only backups retained from deleted databases are shown below.</b>{" "}
        Removing an original backup deletes its copies. Deleting a copy does not
        delete the original backup.
      </Banner>
      <DatabaseBackupsList backups={backups} />
    </div>
  );
};
