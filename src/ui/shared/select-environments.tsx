import { useQuery } from "@app/fx";
import { useSelector } from "react-redux";

import { fetchEnvironments, selectEnvironmentsAsOptions } from "@app/deploy";

import { EmptyResources, ErrorResources } from "./load-resources";
import { Loading } from "./loading";
import { Select, SelectOption, SelectProps } from "./select";

export const EnvironmentSelect = ({
  onSelect,
  ...props
}: {
  onSelect: (s: SelectOption) => void;
} & Omit<SelectProps, "options" | "onSelect">) => {
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

  return <Select options={options} onSelect={onSelect} {...props} />;
};
