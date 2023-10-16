import {
  envToOption,
  fetchEnvironments,
  selectEnvironmentsByStackId,
} from "@app/deploy";
import { useQuery } from "@app/fx";
import { AppState } from "@app/types";
import { useSelector } from "react-redux";
import { EmptyResources, ErrorResources } from "./load-resources";
import { Loading } from "./loading";
import { Select, SelectOption, SelectProps } from "./select";

export const EnvironmentSelect = ({
  onSelect,
  stackId = "",
  ...props
}: {
  onSelect: (s: SelectOption) => void;
  stackId?: string;
} & Omit<SelectProps, "options" | "onSelect">) => {
  const { isInitialLoading, isError, message } = useQuery(fetchEnvironments());
  const envs = useSelector((s: AppState) =>
    selectEnvironmentsByStackId(s, { stackId }),
  );
  const options = [
    { label: "Select an Environment", value: "" },
    ...envs.map(envToOption),
  ];

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
