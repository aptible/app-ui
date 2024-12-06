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
import { useSearchParams } from "react-router-dom";
import type { PaginateProps } from "./use-paginate";

function filterOps() {
  const [params, _setParams] = useSearchParams();
  const FILTER_ALL = "all";
  let resourceType = params.get("resource_type") || "";
  let operationType = params.get("operation_type") || "";
  let operationStatus = params.get("operation_status") || "";
  if (resourceType === FILTER_ALL) resourceType = "";
  if (operationType === FILTER_ALL) operationType = "";
  if (operationStatus === FILTER_ALL) operationStatus = "";

  return { resourceType, operationType, operationStatus };
}

export function usePaginatedOpsByOrgId(orgId: string) {
  const [page, setPage] = useState(1);
  const action = fetchOperationsByOrgId({ id: orgId, page, ...filterOps() });
  return usePaginatedOperations(action, page, setPage);
}

export function usePaginatedOpsByEnvId(envId: string) {
  const [page, setPage] = useState(1);
  const action = fetchOperationsByEnvId({ id: envId, page, ...filterOps() });
  return usePaginatedOperations(action, page, setPage);
}

export function usePaginatedOpsByAppId(appId: string) {
  const [page, setPage] = useState(1);
  const action = fetchOperationsByAppId({ page, id: appId, ...filterOps() });
  return usePaginatedOperations(action, page, setPage);
}

export function usePaginatedOpsByDatabaseId(dbId: string) {
  const [page, setPage] = useState(1);
  const action = fetchOperationsByDatabaseId({
    page,
    id: dbId,
    ...filterOps(),
  });
  return usePaginatedOperations(action, page, setPage);
}

export function usePaginatedOpsByServiceId(serviceId: string) {
  const [page, setPage] = useState(1);
  const action = fetchOperationsByServiceId({
    page,
    id: serviceId,
    ...filterOps(),
  });
  return usePaginatedOperations(action, page, setPage);
}

export function usePaginatedOpsByEndpointId(endpointId: string) {
  const [page, setPage] = useState(1);
  const action = fetchOperationsByEndpointId({
    page,
    id: endpointId,
    ...filterOps(),
  });
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
