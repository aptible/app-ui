import { useSelector } from "react-redux";

import { selectOrganizationSelected } from "@app/organizations";

import { AppSidebarLayout } from "../layouts";
import { ActivityByOrg } from "../shared";

export const ActivityPage = () => {
  const org = useSelector(selectOrganizationSelected);
  return (
    <AppSidebarLayout>
      <ActivityByOrg orgId={org.id} />
    </AppSidebarLayout>
  );
};
