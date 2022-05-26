import { DeployEndpoint, DeployApp, AppState } from '@app/types';

import {
  ResourceListView,
  EmptyResultView,
  TableHead,
  Td,
  Button,
  tokens,
  LoadResources,
} from '../../shared';

import { useQuery } from 'saga-query/react';
import { fetchEndpointsByAppId, selectEndpointsByAppId } from '@app/deploy';
import { useSelector } from 'react-redux';

const EndpointListingRow = ({ endpoint }: { endpoint: DeployEndpoint }) => {
  return (
    <tr>
      <Td className="flex-1">
        <a href={`//${endpoint.userDomain}`} className={tokens.type.darker}>
          {endpoint.userDomain}
        </a>
      </Td>

      <Td className="flex-1">
        <div className={tokens.type['normal lighter']}>
          {endpoint.internal ? 'Internal' : 'External'}
        </div>
      </Td>

      <Td className="flex-1">
        <div className={tokens.type['normal lighter']}>
          {endpoint.ipWhitelist.length
            ? endpoint.ipWhitelist.join(', ')
            : 'Disabled'}
        </div>
      </Td>

      <Td className="flex-1">
        <div className={tokens.type['normal lighter']}>$5</div>
      </Td>

      <Td className="flex gap-2 justify-end w-40">
        <Button type="submit" variant="white" size="xs">
          Edit
        </Button>
        <Button type="submit" variant="white" size="xs">
          Delete
        </Button>
      </Td>
    </tr>
  );
};

export function EndpointsOverview({ app }: { app: DeployApp }) {
  const query = useQuery(fetchEndpointsByAppId({ id: app.id }));
  const endpoints = useSelector((s: AppState) =>
    selectEndpointsByAppId(s, { id: app.id }),
  );

  const body = (
    <LoadResources
      query={query}
      isEmpty={endpoints.length === 0}
      loader={
        <tr>
          <td colSpan={5}>Loading...</td>
        </tr>
      }
      error={(e) => (
        <tr>
          <td colSpan={5}>Error: {e}</td>
        </tr>
      )}
      empty={
        <tr>
          <td colSpan={5}>
            <EmptyResultView
              title="No endpoints yet"
              description="Expose this application to the public internet by adding an endpoint"
              action={<Button variant="primary">Add Endpoint</Button>}
              className="p-6"
            />
          </td>
        </tr>
      }
    >
      {endpoints.map((endpoint) => (
        <EndpointListingRow endpoint={endpoint} key={endpoint.id} />
      ))}
    </LoadResources>
  );

  return (
    <ResourceListView
      title="Endpoints"
      description="Endpoints let you expose your Apps on Aptible to clients over the public internet or your Stack's internal network."
      actions={[<Button>Create Endpoint</Button>]}
      tableHeader={
        <TableHead
          headers={[
            'Endpoint',
            'Placement',
            'IP Filtering',
            'Monthly Cost',
            { name: '', className: 'w-40' },
          ]}
        />
      }
      tableBody={body}
    />
  );
}
