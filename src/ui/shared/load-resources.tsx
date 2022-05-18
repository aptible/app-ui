import type { UseApiResult } from 'saga-query/react';

type LoadResourcesProps<T> = {
  query: UseApiResult<T>;
  children: React.ReactNode;
  isEmpty: boolean;
  empty?: JSX.Element;
  loader?: JSX.Element;
  error?: (e: string) => JSX.Element;
};

export function LoadResources<T>({
  query,
  isEmpty,
  children,
  empty = <span>No resources found.</span>,
  loader = <span>Loading ...</span>,
  error = (err) => <span>Error: {err}</span>,
}: LoadResourcesProps<T>): JSX.Element {
  const { isInitialLoading, isError, message: errorMessage } = query;
  if (isInitialLoading) return loader;
  if (isError && errorMessage) return error(errorMessage);
  if (isEmpty) return empty;
  return <div>{children}</div>;
}
