import {
  fetchBackupsByDatabaseIdPage,
  fetchBackupsByEnvIdPage,
  selectBackupsByIds,
} from "@app/deploy";
import { useCache, useSelector } from "@app/react";
import type { DeployBackup, HalEmbedded } from "@app/types";
import { useState } from "react";
import type { PaginateProps } from "./use-paginate";

export function usePaginatedBackupsByDatabaseId(dbId: string) {
  const [page, setPage] = useState(1);
  const action = fetchBackupsByDatabaseIdPage({ page, id: dbId });
  return usePaginatedBackups(action, page, setPage);
}

export function usePaginatedBackupsByEnvId(
  envId: string,
  onlyOrphaned: boolean,
) {
  const [page, setPage] = useState(1);
  const action = fetchBackupsByEnvIdPage({ id: envId, onlyOrphaned, page });
  return usePaginatedBackups(action, page, setPage);
}

function usePaginatedBackups(
  action: any,
  page: number,
  setPage: (n: number) => void,
): PaginateProps<DeployBackup> & { isLoading: boolean } {
  const cache = useCache<HalEmbedded<{ backups: string[] }>>(action);
  const backupIds = cache.data?._embedded.backups || [];
  const backups = useSelector((s) => selectBackupsByIds(s, { ids: backupIds }));

  const itemsPerPage = cache.data?.per_page || 40;
  const totalItems = cache.data?.total_count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  return {
    isLoading: cache.isLoading,
    page,
    setPage,
    totalItems,
    totalPages,
    itemsPerPage,
    data: backups,
    setItemsPerPage: () => {},
    prev: () => {
      if (page === 1) {
        return;
      }
      setPage(page - 1);
    },
    next: () => {
      if (page === totalPages) {
        return;
      }
      setPage(page + 1);
    },
  };
}
