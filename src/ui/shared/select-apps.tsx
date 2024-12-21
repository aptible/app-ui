import {
  appToOption,
  fetchApps,
  selectAppsByEnvId,
} from "@app/deploy";
import { useQuery, useSelector } from "@app/react";
import { EmptyResources, ErrorResources } from "./load-resources";
import { Loading } from "./loading";
import { Select, type SelectOption, type SelectProps } from "./select";

export const AppSelect = ({
  onSelect,
  envId = "",
  ...props
}: {
  onSelect: (s: SelectOption) => void;
  envId?: string;
} & Omit<SelectProps, "options" | "onSelect">) => {
  const { isInitialLoading, isError, message } = useQuery(fetchApps());
  const apps = useSelector((s) => selectAppsByEnvId(s, { envId }));
  const options = [
    { label: "Select an App", value: "" },
    ...apps.map(appToOption).sort((a, b) => a.label.localeCompare(b.label)),
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
