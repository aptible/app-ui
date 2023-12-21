import { fetchDatabasesByEnvId } from "@app/deploy";
import { useQuery } from "@app/fx";
import { useParams } from "react-router";
import { usePaginatedBackupsByEnvId } from "../hooks";
import { BackupRpView, Banner, DatabaseBackupsList, Group } from "../shared";

export const EnvironmentBackupsPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchDatabasesByEnvId({ envId: id }));
  const paginated = usePaginatedBackupsByEnvId(id, true);

  return (
    <Group>
      <BackupRpView envId={id} />

      <Banner variant="info">
        <b>Only backups retained from deleted databases are shown below.</b> To
        manage backups for a database, see the Backups tab on the database
        itself. Removing an original backup deletes its copies. Deleting a copy
        does not delete the original backup.
      </Banner>

      <DatabaseBackupsList paginated={paginated} showDatabase showFinal />
    </Group>
  );
};
