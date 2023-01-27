import { useSelector } from "react-redux";
import { UseApiResult, useQuery } from "saga-query/react";

import { DeployEndpoint, AppState } from "@app/types";
import { selectEndpointsByServiceIds } from "@app/deploy";
import { fetchEndpointsByServiceId } from "@app/deploy";

import { PlusCircle } from "@app/ui/shared/icons";

import { TableHead, Td } from "./table";
import { tokens } from "./tokens";
import { Button, ButtonCreate } from "./button";
import { LoadResources } from "./load-resources";
import { EmptyResultView, ResourceListView } from "./resource-list-view";

const EndpointListingRow = ({ endpoint }: { endpoint: DeployEndpoint }) => {
  return (
    <tr>
      <Td className="flex-1">
        <a href={`//${endpoint.userDomain}`} className={tokens.type.darker}>
          {endpoint.userDomain}
        </a>
      </Td>

      <Td className="flex-1">
        <div className={tokens.type["normal lighter"]}>
          {endpoint.internal ? "Internal" : "External"}
        </div>
      </Td>

      <Td className="flex-1">
        <div className={tokens.type["normal lighter"]}>
          {endpoint.ipWhitelist.length
            ? endpoint.ipWhitelist.join(", ")
            : "Disabled"}
        </div>
      </Td>

      <Td className="flex-1">
        <div className={tokens.type["normal lighter"]}>$5</div>
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

export function EndpointsOverview({
  serviceIds,
  query,
}: {
  serviceIds: string[];
  query: UseApiResult<any>;
}) {
  const endpoints = useSelector((s: AppState) =>
    selectEndpointsByServiceIds(s, { ids: serviceIds }),
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
              action={
                <ButtonCreate className="inline-flex">
                  Add Endpoint
                </ButtonCreate>
              }
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
            "Endpoint",
            "Placement",
            "IP Filtering",
            "Monthly Cost",
            { name: "", className: "w-40" },
          ]}
        />
      }
      tableBody={body}
    />
  );
}

export function EndpointsView({ serviceId }: { serviceId: string }) {
  const query = useQuery(fetchEndpointsByServiceId({ id: serviceId }));
  return <EndpointsOverview query={query} serviceIds={[serviceId]} />;
}
