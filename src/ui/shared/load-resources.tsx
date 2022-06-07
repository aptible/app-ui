import type { UseApiResult } from 'saga-query/react';

import { Loading } from './loading';

interface LoadResourcesProps<T> {
  query: UseApiResult<T>;
  children: React.ReactNode;
  isEmpty: boolean;
  empty?: JSX.Element;
  loader?: JSX.Element;
  error?: (e: string) => JSX.Element;
}

export const EmptyResources = () => {
  return <span>No resources found.</span>;
};

export const ErrorResources = ({ message = '' }: { message: string }) => (
  <span>Error: {message}</span>
);

export function LoadResources<T>({
  query,
  isEmpty,
  children,
  empty = <EmptyResources />,
  loader = <Loading />,
  error = (message) => <ErrorResources message={message} />,
}: LoadResourcesProps<T>): JSX.Element {
  const { isInitialLoading, isError, message: errorMessage } = query;
  if (isInitialLoading) return loader;
  if (isError && errorMessage) return error(errorMessage);
  if (isEmpty) return empty;
  return <>{children}</>;
}
