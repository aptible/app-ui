import { useQuery } from "@app/fx";
import { useSelector } from "react-redux";

import { fetchAllStacks, selectStacksByOrgAsOptions } from "@app/deploy";

import { selectOrganizationSelected } from "@app/organizations";
import { AppState } from "@app/types";
import { EmptyResources, ErrorResources } from "./load-resources";
import { Loading } from "./loading";
import { Select, SelectProps } from "./select";

export const StackSelect = (props: Omit<SelectProps, "options">) => {
  const { isInitialLoading, isError, message } = useQuery(fetchAllStacks());
  const org = useSelector(selectOrganizationSelected);
  const options = useSelector((s: AppState) =>
    selectStacksByOrgAsOptions(s, { orgId: org.id }),
  );

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
