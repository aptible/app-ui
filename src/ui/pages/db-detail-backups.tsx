import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useCache } from 'saga-query/react';

import type { HalEmbedded } from '@app/types';

import { EmptyResources, LoadResources } from '../shared';
import { fetchDatabaseBackups } from '@app/deploy';

interface BackupResponse {
  id: number;
  aws_region: string;
  manual: boolean;
  size: number;
  _embedded: {
    copied_from?: {
      id: number;
    };
  };
  created_at: string;
}

interface HalBackups {
  backups: BackupResponse[];
}

export const DatabaseBackupsPage = () => {
  const { id = '' } = useParams();
  const query = useCache<HalEmbedded<HalBackups>>(fetchDatabaseBackups({ id }));

  useEffect(() => {
    query.trigger();
  }, []);

  if (!query.data) {
    return <EmptyResources />;
  }

  const { backups } = query.data._embedded;

  return (
    <LoadResources query={query} isEmpty={backups.length === 0}>
      {backups.map((bk) => {
        return (
          <div key={bk.id} className="p-4">
            <div>Type: {bk.manual ? 'Manual' : 'Automatic'}</div>
            {bk._embedded.copied_from ? (
              <div>Identifier: Copy of {bk._embedded.copied_from.id}</div>
            ) : (
              ''
            )}
            <div>Location: {bk.aws_region}</div>
            <div>Size: {bk.size}</div>
          </div>
        );
      })}
    </LoadResources>
  );
};
