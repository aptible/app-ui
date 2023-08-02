import { useSelector } from "react-redux";
import { useParams } from "react-router";

import { fetchDatabaseBackups, selectBackupsByDatabaseId } from "@app/deploy";
import { useQuery } from "@app/fx";
import { AppState } from "@app/types";

import { DatabaseBackupsList } from "../shared";

export const DatabaseBackupsPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchDatabaseBackups({ id }));
  const backups = useSelector((s: AppState) =>
    selectBackupsByDatabaseId(s, { dbId: id }),
  );

  return <DatabaseBackupsList backups={backups} />;
};
