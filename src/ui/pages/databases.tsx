import { MenuWrappedPage } from "../layouts/menu-wrapped-page";

import { DatabaseList } from "../shared";

export const DatabasesPage = () => {
  return (
    <MenuWrappedPage>
      <DatabaseList />
    </MenuWrappedPage>
  );
};
