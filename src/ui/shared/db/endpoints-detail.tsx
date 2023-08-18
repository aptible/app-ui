import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

import {
  fetchEndpointsByDatabaseId,
  getEndpointText,
  requiresAcmeSetup,
  selectEndpointsByAppId,
} from "@app/deploy";
import { useQuery } from "@app/fx";
import {
  databaseEndpointCreateUrl,
  endpointDetailSetupUrl,
  endpointDetailUrl,
} from "@app/routes";
import { AppState, DeployDatabase, DeployEndpoint } from "@app/types";

import { Button, ButtonCreate } from "../button";
import { EndpointStatusPill, EndpointUrl } from "../endpoint";
import { IconPlusCircle } from "../icons";
import { LoadResources } from "../load-resources";
import { EmptyResultView } from "../resource-list-view";
import { TableHead } from "../table";
import { Td } from "../table";

const EndpointRow = ({ endpoint }: { endpoint: DeployEndpoint }) => {
  const navigate = useNavigate();
  const txt = getEndpointText(endpoint);
  const acmeSetup = () => {
    navigate(endpointDetailSetupUrl(endpoint.id));
  };

  return (
    <tr className="group hover:bg-gray-50">
      <Td>
        <Link
          className="text-black group-hover:text-indigo hover:text-indigo"
          to={endpointDetailUrl(endpoint.id)}
        >
          {endpoint.id}
        </Link>
      </Td>
      <Td>
        <EndpointUrl enp={endpoint} />
      </Td>
      <Td>
        <EndpointStatusPill status={endpoint.status} />
      </Td>
      <Td>{txt.placement}</Td>
      <Td>{endpoint.platform.toLocaleUpperCase()}</Td>
      <Td>{txt.ipAllowlist}</Td>
      <Td>
        {requiresAcmeSetup(endpoint) ? (
          <Button onClick={acmeSetup}>Setup</Button>
        ) : (
          "Completed"
        )}
      </Td>
    </tr>
  );
};

const EndpointList = ({
  endpoints,
  action,
}: {
  endpoints: DeployEndpoint[];
  action?: JSX.Element;
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-4">{action}</div>
      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <TableHead
            headers={[
              "ID",
              "Hostname",
              "Status",
              "Placement",
              "Platform",
              "IP Filtering",
              "ACME Status",
            ]}
          />
          <tbody className="divide-y divide-gray-200 bg-white">
            {endpoints.map((endpoint) => (
              <EndpointRow endpoint={endpoint} key={endpoint.id} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function EndpointsView({ database }: { database: DeployDatabase }) {
  const navigate = useNavigate();
  const endpoints = useSelector((s: AppState) =>
    selectEndpointsByAppId(s, { id: database.id }),
  );

  const action = (
    <ButtonCreate
      envId={database.environmentId}
      onClick={() => {
        navigate(databaseEndpointCreateUrl(database.id));
      }}
    >
      <IconPlusCircle variant="sm" className="mr-2" /> New Endpoint
    </ButtonCreate>
  );

  if (!endpoints.length) {
    return (
      <EmptyResultView
        title="No endpoints yet"
        description="Expose this application to the public internet by adding an endpoint"
        action={action}
        className="p-6 w-100"
      />
    );
  }

  return (
    <div className="mt-3">
      <EndpointList endpoints={endpoints} action={action} />
    </div>
  );
}

export function DatabaseEndpointsOverview({
  database,
}: { database: DeployDatabase }) {
  const query = useQuery(fetchEndpointsByDatabaseId({ dbId: database.id }));
  return (
    <LoadResources query={query} isEmpty={false}>
      <EndpointsView database={database} />
    </LoadResources>
  );
}
