import { ListingPageLayout } from '../../layouts';

import { DatabaseList } from './database-list';

export const DatabasesPage = () => {
  return (
    <ListingPageLayout>
      <DatabaseList />
    </ListingPageLayout>
  );
};
