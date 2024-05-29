import { fetchStacks, selectStacksByOrgAsOptions } from "@app/deploy";
import { selectOrganizationSelected } from "@app/organizations";
import { useQuery, useSelector } from "@app/react";
import { EmptyResources, ErrorResources } from "./load-resources";
import { Loading } from "./loading";
import { Select, type SelectProps } from "./select";

export const StackSelect = (props: Omit<SelectProps, "options">) => {
  const { isInitialLoading, isError, message } = useQuery(fetchStacks());
  const org = useSelector(selectOrganizationSelected);
  const options = useSelector((s) =>
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
