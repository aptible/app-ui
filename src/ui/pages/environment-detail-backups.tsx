import { useSelector } from "react-redux";
import { useParams } from "react-router";

import {
  fetchDatabaseBackupsByEnvironment,
  selectBackupsByEnvId,
} from "@app/deploy";
import { useQuery } from "@app/fx";
import type { AppState } from "@app/types";

import { BackupRpView, Banner, DatabaseBackupsList } from "../shared";

export const EnvironmentBackupsPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchDatabaseBackupsByEnvironment({ id }));
  const backups = useSelector((s: AppState) =>
    selectBackupsByEnvId(s, { envId: id }),
  );

  return (
    <div className="flex flex-col">
      <BackupRpView envId={id} />
      <Banner variant="info" className="mt-6">
        <p>
          <b>Only backups retained from deleted databases are shown below.</b>{" "}
          Removing an original backup deletes its copies. Deleting a copy does
          not delete the original backup.
        </p>
      </Banner>
      <DatabaseBackupsList backups={backups} />
    </div>
  );
};
