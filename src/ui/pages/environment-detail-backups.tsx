import { useCache } from "@app/fx";
import { useParams } from "react-router";

import type { HalEmbedded } from "@app/types";

import { EmptyResources, Loading } from "../shared";
import { DatabaseBackupsList } from "../shared/db/backup-list";
import { HalBackups, fetchDatabaseBackupsByEnvironment } from "@app/deploy";

export const EnvironmentBackupsPage = () => {
  const { id = "" } = useParams();
  const query = useCache<HalEmbedded<HalBackups>>(
    fetchDatabaseBackupsByEnvironment({ id }),
  );

  if (query.isInitialLoading) {
    return <Loading />;
  }

  if (!query.data) {
    return <EmptyResources />;
  }

  const { backups } = query.data._embedded;

  return <DatabaseBackupsList query={query} backups={backups} />;
};
