import { useSelector } from "react-redux";

import { selectOrganizationSelected } from "@app/organizations";

import { ListingPageLayout } from "../layouts";
import { ActivityByOrg } from "../shared";

export const ActivityPage = () => {
  const org = useSelector(selectOrganizationSelected);
  return (
    <ListingPageLayout>
      <ActivityByOrg orgId={org.id} />
    </ListingPageLayout>
  );
};
