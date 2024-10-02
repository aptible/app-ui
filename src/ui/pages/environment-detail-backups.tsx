import { fetchDatabasesByEnvId } from "@app/deploy";
import { useQuery } from "@app/react";
import { useParams } from "react-router";
import { usePaginatedBackupsByEnvId } from "../hooks";
import {
  BackupRpView,
  Banner,
  DatabaseBackupsList,
  Group,
  tokens,
} from "../shared";

export const EnvironmentBackupsPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchDatabasesByEnvId({ envId: id }));
  const paginated = usePaginatedBackupsByEnvId(id, true);

  return (
    <Group>
      <BackupRpView envId={id} />
      <Banner variant="info">
        <p>
          <strong>
            Both Final and Manual backups from deleted databases are shown
            below.
          </strong>{" "}
          Final backups follow the backup retention policy, while Manual backups
          are retained indefinitely by default. To manage backups for an active
          database, visit the Backups tab on the database itself.
        </p>
        <p>
          <strong>Deleting Copies of Backups: </strong>Removing an original
          backup deletes all its copies, but deleting a copy does not affect the
          original —{" "}
          <a
            href=" https://www.aptible.com/docs/core-concepts/managed-databases/managing-databases/database-backups"
            target="_blank"
            rel="noreferrer"
          >
            view documentation.
          </a>
        </p>
      </Banner>
      <h3 className={tokens.type.h3}>Backups of Deprovisioned Databases</h3>
      <DatabaseBackupsList paginated={paginated} showDatabase showFinal />
    </Group>
  );
};
