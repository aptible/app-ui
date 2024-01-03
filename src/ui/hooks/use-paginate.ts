import { useSearchParams } from "react-router-dom";

const ITEMS_PER_PAGE = 25;

function paginate<T>(
  data: T[],
  itemsPerPage: number,
  page: number,
): { totalPages: number; paginatedData: T[] } {
  if (data.length <= itemsPerPage) {
    return { totalPages: 1, paginatedData: data };
  }
  const end = page * itemsPerPage;
  const start = end - itemsPerPage;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  return { totalPages, paginatedData: data.slice(start, end) };
}

const usePaginateFilters = (rowsPerPage = ITEMS_PER_PAGE) => {
  const [params, setParams] = useSearchParams();
  const pageParam = params.get("page");
  const rowsParam = params.get("rows");
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const itemsPerPage = rowsParam ? parseInt(rowsParam, 10) : rowsPerPage;

  // Keep any params that are already there
  const setPage = (newPage: number) => {
    if (newPage === 0) {
      return;
    }
    setParams({ page: newPage.toString() }, { replace: true });
  };

  const resetPageParam = () => {
    setParams({ page: "1" }, { replace: true });
  };

  const setItemsPerPage = (items: number) => {
    setParams({ rows: items.toString() }, { replace: true });
  };

  return {
    setPage,
    page,
    resetPageParam,
    setItemsPerPage,
    itemsPerPage,
  };
};

export interface PaginateProps<T> {
  isLoading?: boolean;
  page: number;
  totalPages: number;
  totalItems: number;
  data: T[];
  itemsPerPage: number;
  setPage: (p: number) => void;
  setItemsPerPage: (rows: number) => void;
  prev: () => void;
  next: () => void;
}

export function usePaginate<T>(
  data: T[],
  rowsPerPage?: number,
): PaginateProps<T> {
  const { page, setPage, itemsPerPage, setItemsPerPage } =
    usePaginateFilters(rowsPerPage);
  const { totalPages, paginatedData } = paginate(data, itemsPerPage, page);
  const totalItems = data.length;
  return {
    page,
    setPage,
    totalPages,
    totalItems,
    data: paginatedData,
    itemsPerPage,
    setItemsPerPage,
    isLoading: false,
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
