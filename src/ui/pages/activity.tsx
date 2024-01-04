import { selectOrganizationSelected } from "@app/organizations";
import { useSelector } from "@app/react";

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
