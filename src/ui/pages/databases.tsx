import { AppSidebarLayout } from "../layouts";

import { DatabaseListByOrg } from "../shared";

export const DatabasesPage = () => {
  return (
    <AppSidebarLayout>
      <DatabaseListByOrg />
    </AppSidebarLayout>
  );
};
