import { ListingPageLayout } from '../layouts';

import { DatabaseList } from './db';

export const DatabasesPage = () => {
  return (
    <ListingPageLayout>
      <DatabaseList />
    </ListingPageLayout>
  );
};
