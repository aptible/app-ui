import { DeployEndpoint, AppState } from "@app/types";

import { Td } from "./table";
import { tokens } from "./tokens";
import { Button, ButtonIcon } from "./button";
import { EmptyResultView } from "./resource-list-view";
import { IconPlusCircle } from "./icons";
import { InputSearch } from "./input";
import { ReactElement, useState } from "react";

const EndpointListing = ({ endpoint }: { endpoint: DeployEndpoint }) => {
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

const EndpointsOverview = ({
  endpoints,
}: {
  endpoints: DeployEndpoint[];
}): ReactElement => {
  const [search, setSearch] = useState("");
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(ev.currentTarget.value);

  return (
    <div className="mb-4">
      <div className="flex justify-between w-100">
        <div className="flex w-1/2">
          <ButtonIcon icon={<IconPlusCircle />}>New Endpoint</ButtonIcon>
        </div>
        <div className="flex w-1/2 justify-end">
          {endpoints.length ? (
            <InputSearch
              className="self-end float-right]"
              placeholder="Search endpoints ..."
              search={search}
              onChange={onChange}
            />
          ) : null}
        </div>
      </div>
      {endpoints.map((endpoint) => (
        <EndpointListing endpoint={endpoint} key={endpoint.id} />
      ))}
    </div>
  );
};

export function EndpointsView({ endpoints }: { endpoints?: DeployEndpoint[] }) {
  if (!endpoints) {
    return (
      <EmptyResultView
        title="No endpoints yet"
        description="Expose this application to the public internet by adding an endpoint"
        action={
          <ButtonIcon icon={<IconPlusCircle />} className="inline-flex">
            Add Endpoint
          </ButtonIcon>
        }
        className="p-6 w-100"
      />
    );
  }

  return (
    <div className="mt-4">
      <EndpointsOverview endpoints={endpoints} />
    </div>
  );
}
