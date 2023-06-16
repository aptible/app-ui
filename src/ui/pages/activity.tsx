import { useSelector } from "react-redux";

import { selectOrganizationSelected } from "@app/organizations";

import { MenuWrappedPage } from "../layouts/menu-wrapped-page";
import { ActivityByOrg } from "../shared";

export const ActivityPage = () => {
  const org = useSelector(selectOrganizationSelected);
  return (
    <MenuWrappedPage>
      <ActivityByOrg orgId={org.id} />
    </MenuWrappedPage>
  );
};
