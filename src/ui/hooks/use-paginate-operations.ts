import {
  fetchOperationsByAppId,
  fetchOperationsByDatabaseId,
  fetchOperationsByEndpointId,
  fetchOperationsByEnvId,
  fetchOperationsByOrgId,
  fetchOperationsByServiceId,
  selectActivityByIdsForTable,
} from "@app/deploy";
import { useCache, useSelector } from "@app/react";
import type { DeployActivityRow, HalEmbedded } from "@app/types";
import { useState } from "react";
import type { PaginateProps } from "./use-paginate";

export function usePaginatedOpsByOrgId(orgId: string) {
  const [page, setPage] = useState(1);
  const action = fetchOperationsByOrgId({ id: orgId, page });
  return usePaginatedOperations(action, page, setPage);
}

export function usePaginatedOpsByEnvId(envId: string) {
  const [page, setPage] = useState(1);
  const action = fetchOperationsByEnvId({ id: envId, page });
  return usePaginatedOperations(action, page, setPage);
}

export function usePaginatedOpsByAppId(appId: string) {
  const [page, setPage] = useState(1);
  const action = fetchOperationsByAppId({ page, id: appId });
  return usePaginatedOperations(action, page, setPage);
}

export function usePaginatedOpsByDatabaseId(dbId: string) {
  const [page, setPage] = useState(1);
  const action = fetchOperationsByDatabaseId({ page, id: dbId });
  return usePaginatedOperations(action, page, setPage);
}

export function usePaginatedOpsByServiceId(serviceId: string) {
  const [page, setPage] = useState(1);
  const action = fetchOperationsByServiceId({ page, id: serviceId });
  return usePaginatedOperations(action, page, setPage);
}

export function usePaginatedOpsByEndpointId(endpointId: string) {
  const [page, setPage] = useState(1);
  const action = fetchOperationsByEndpointId({ page, id: endpointId });
  return usePaginatedOperations(action, page, setPage);
}

function usePaginatedOperations(
  action: any,
  page: number,
  setPage: (n: number) => void,
): PaginateProps<DeployActivityRow> & { isLoading: boolean } {
  const cache = useCache<HalEmbedded<{ operations: string[] }>>(action);
  const opIds = cache.data?._embedded.operations || [];
  const operations = useSelector((s) =>
    selectActivityByIdsForTable(s, {
      ids: opIds,
    }),
  );

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
    data: operations,
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
