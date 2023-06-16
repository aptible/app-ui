import { MenuWrappedPage } from "../layouts/menu-wrapper";

import { DatabaseList } from "../shared";

export const DatabasesPage = () => {
  return (
    <MenuWrappedPage>
      <DatabaseList />
    </MenuWrappedPage>
  );
};
