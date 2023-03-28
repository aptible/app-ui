import { useSelector } from "react-redux";
import { useQuery } from "saga-query/react";

import { fetchAllEnvironments, selectEnvironmentsAsOptions } from "@app/deploy";

import { EmptyResources, ErrorResources } from "./load-resources";
import { Loading } from "./loading";
import { SelectMenu } from "./select-menu";

export const EnvironmentSelect = () => {
  const { isInitialLoading, isError, message } = useQuery(
    fetchAllEnvironments(),
  );
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
