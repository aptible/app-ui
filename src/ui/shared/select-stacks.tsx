import { useSelector } from "react-redux";
import { useQuery } from "saga-query/react";

import { fetchAllStacks, selectStacksAsOptions } from "@app/deploy";

import { EmptyResources, ErrorResources } from "./load-resources";
import { Loading } from "./loading";
import { Select, SelectProps } from "./select";

export const StackSelect = (props: Omit<SelectProps, "options">) => {
  const { isInitialLoading, isError, message } = useQuery(fetchAllStacks());
  const options = useSelector(selectStacksAsOptions);

  if (isInitialLoading) {
    return <Loading />;
  }

  if (isError) {
    return <ErrorResources message={message} />;
  }

  if (options.length === 0) {
    return <EmptyResources />;
  }

  return <Select {...props} options={options} />;
};
