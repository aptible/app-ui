import { useSelector } from "react-redux";
import { useQuery } from "saga-query/react";

import { fetchEnvironments, selectEnvironmentsAsOptions } from "@app/deploy";

import { Loading } from "./loading";
import { EmptyResources, ErrorResources } from "./load-resources";
import { SelectMenu } from "./select-menu";

export const EnvironmentSelect = () => {
  const { isInitialLoading, isError, message } = useQuery(fetchEnvironments());
  const options = useSelector(selectEnvironmentsAsOptions);

  if (isInitialLoading) {
    return <Loading />;
  }

  if (isError) {
    return <ErrorResources message={message} />;
  }

  if (options.length === 0) {
    return <EmptyResources />;
  }

  return <SelectMenu options={options} />;
};
