import { ListingPageLayout } from '../layouts';

import { DatabaseList } from '../shared';

export const DatabasesPage = () => {
  return (
    <ListingPageLayout>
      <DatabaseList />
    </ListingPageLayout>
  );
};
