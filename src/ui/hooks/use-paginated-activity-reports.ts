import {
  fetchEnvActivityReports,
  selectActivityReportsByIds,
} from "@app/deploy";
import { useCache, useSelector } from "@app/react";
import type { DeployActivityReport, HalEmbedded } from "@app/types";
import { useState } from "react";
import type { PaginateProps } from "./use-paginate";

export function usePaginatedActivityReportsByEnvId(envId: string) {
  const [page, setPage] = useState(1);
  const action = fetchEnvActivityReports({ id: envId, page });
  return usePaginatedActivityReports(action, page, setPage);
}

function usePaginatedActivityReports(
  action: any,
  page: number,
  setPage: (n: number) => void,
): PaginateProps<DeployActivityReport> & { isLoading: boolean } {
  const cache = useCache<HalEmbedded<{ activityReports: string[] }>>(action);
  const ids = cache.data?._embedded.activity_reports || [];
  const reports = useSelector((s) => selectActivityReportsByIds(s, { ids }));

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
    data: reports,
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
