import { useSelector } from 'react-redux';
import { useQuery } from 'saga-query/react';

import { fetchEnvironments, selectEnvironmentsAsList } from '@app/deploy';

import { Select } from './select';

export const EnvironmentSelect = () => {
  const { isInitialLoading, isError, message } = useQuery(fetchEnvironments());
  const envs = useSelector(selectEnvironmentsAsList);

  if (isInitialLoading) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {message}</span>;
  }

  const options = envs.map((e) => {
    return { label: e.handle, value: e.id.toString() };
  });

  const all = { label: 'All Environments', value: 'all' };
  options.unshift(all);

  return (
    <Select
      defaultValue={all}
      value={all}
      options={options}
      label="Filter by Environment..."
      onSelect={console.log}
    />
  );
};
