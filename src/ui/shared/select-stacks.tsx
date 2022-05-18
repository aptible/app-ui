import { useSelector } from 'react-redux';
import { useQuery } from 'saga-query/react';

import { fetchStacks, selectStacksAsList } from '@app/deploy';

import { SelectStackMenu } from './select-stack-menu';

export const StackSelect = () => {
  const { isInitialLoading, isError, message } = useQuery(fetchStacks());
  const stacks = useSelector(selectStacksAsList);

  if (isInitialLoading) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {message}</span>;
  }

  if (stacks.length === 0) {
    return <span>No stacks</span>;
  }

  return <SelectStackMenu stacks={stacks} />;
};
