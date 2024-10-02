import { fetchDatabasesByEnvId } from "@app/deploy";
import { useQuery } from "@app/react";
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
        <p><strong>Backups of Deprovisioned Databases</strong></p>
        <p>Both Final and Manual backups from deleted databases are shown below. Final backups follow the backup retention policy, while Manual backups are retained indefinitely by default. To manage backups for an active database, visit the Backups tab on the database itself.</p>
      </Banner>

      <Banner variant="warning">
        <p><strong>Deleting Copies of Backups </strong></p>
        <p>Removing an original backup deletes all its copies, but deleting a copy does not affect the original. See the documentation for more information.</p>
      </Banner>

      <DatabaseBackupsList paginated={paginated} showDatabase showFinal />
    </Group>
  );
};
