import {
  fetchDatabaseBackupsByEnvironment,
  fetchDatabasesByEnvId,
  selectOrphanedBackupsByEnvId,
} from "@app/deploy";
import { useQuery } from "@app/fx";
import type { AppState } from "@app/types";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { BackupRpView, Banner, DatabaseBackupsList, Group } from "../shared";

export const EnvironmentBackupsPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchDatabasesByEnvId({ envId: id }));
  useQuery(fetchDatabaseBackupsByEnvironment({ id, orphaned: true }));
  const backups = useSelector((s: AppState) =>
    selectOrphanedBackupsByEnvId(s, { envId: id }),
  );

  return (
    <Group>
      <BackupRpView envId={id} />

      <Banner variant="info">
        <b>Only backups retained from deleted databases are shown below.</b> To
        manage backups for a database, see the Backups tab on the database
        itself. Removing an original backup deletes its copies. Deleting a copy
        does not delete the original backup.
      </Banner>

      <DatabaseBackupsList backups={backups} showDatabase showFinal />
    </Group>
  );
};
