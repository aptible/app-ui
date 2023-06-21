import { MenuWrappedPage } from "../layouts/menu-wrapped-page";

import { DatabaseListByOrg } from "../shared";

export const DatabasesPage = () => {
  return (
    <MenuWrappedPage>
      <DatabaseListByOrg />
    </MenuWrappedPage>
  );
};
