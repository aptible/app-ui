import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Link, useSearchParams } from "react-router-dom";

import {
  DeployEndpointRow,
  getEndpointText,
  requiresAcmeSetup,
  selectAppById,
  selectEndpointsByAppIdForTableSearch,
  selectEndpointsByCertIdForTableSearch,
  selectEndpointsByDbIdForTableSearch,
  selectEndpointsByEnvIdForTableSearch,
  selectEndpointsForTableSearch,
} from "@app/deploy";
import {
  appDetailUrl,
  appEndpointCreateUrl,
  databaseDetailUrl,
  endpointDetailSetupUrl,
  endpointDetailUrl,
} from "@app/routes";
import { AppState, DeployEndpoint } from "@app/types";

import { Button, ButtonCreate } from "../button";
import { TableHead } from "../table";
import { Td } from "../table";

import { IconInfo, IconPlusCircle } from "../icons";
import { InputSearch } from "../input";
import {
  EmptyResultView,
  ResourceHeader,
  ResourceListView,
} from "../resource-list-view";
import { Tooltip } from "../tooltip";
import { EndpointStatusPill, EndpointUrl } from "./util";

const EndpointRow = ({ endpoint }: { endpoint: DeployEndpointRow }) => {
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
        {endpoint.resourceType === "app" ? (
          <Link to={appDetailUrl(endpoint.resourceId)}>
            {endpoint.resourceHandle}
          </Link>
        ) : (
          <Link to={databaseDetailUrl(endpoint.resourceId)}>
            {endpoint.resourceHandle}
          </Link>
        )}
      </Td>
      <Td>
        <EndpointStatusPill status={endpoint.status} />
      </Td>
      <Td>{txt.placement}</Td>
      <Td>{endpoint.platform.toLocaleUpperCase()}</Td>
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

const EndpointHeader = ({
  search,
  onChange,
  actions,
  enps,
  showTitle = false,
}: {
  search: string;
  onChange: (s: string) => void;
  actions: JSX.Element[];
  enps: DeployEndpoint[];
  showTitle?: boolean;
}) => {
  return (
    <ResourceHeader
      title={showTitle ? "Endpoints" : ""}
      actions={actions}
      filterBar={
        <div>
          <InputSearch
            placeholder="Search endpoints..."
            search={search}
            onChange={(ev) => onChange(ev.currentTarget.value)}
          />
          <div className="flex">
            <p className="flex text-gray-500 mt-4 text-base">
              {enps.length} Endpoint{enps.length !== 1 && "s"}
            </p>
            <div className="mt-4">
              <Tooltip
                fluid
                text="Endpoints let you expose your Apps on Aptible to clients over the public internet or your Stack's internal network."
              >
                <IconInfo className="h-5 mt-0.5 opacity-50 hover:opacity-100" />
              </Tooltip>
            </div>
          </div>
        </div>
      }
    />
  );
};

const headers = [
  "ID",
  "Hostname",
  "Resource",
  "Status",
  "Placement",
  "Platform",
  "ACME Status",
];

export const EndpointList = ({
  endpoints,
  actions = [],
  search = "",
  onChange = () => {},
  showTitle = false,
}: {
  endpoints: DeployEndpointRow[];
  actions?: JSX.Element[];
  search?: string;
  onChange?: (s: string) => void;
  showTitle?: boolean;
}) => {
  const titleBar = (
    <EndpointHeader
      enps={endpoints}
      search={search}
      onChange={onChange}
      actions={actions}
      showTitle={showTitle}
    />
  );

  return (
    <ResourceListView
      header={titleBar}
      tableHeader={<TableHead headers={headers} />}
      tableBody={
        <>
          {endpoints.map((enp) => (
            <EndpointRow endpoint={enp} key={enp.id} />
          ))}
        </>
      }
    />
  );
};

export function EndpointsByOrg() {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (nextSearch: string) => {
    setParams({ search: nextSearch });
  };
  const endpoints = useSelector((s: AppState) =>
    selectEndpointsForTableSearch(s, { search }),
  );

  if (endpoints.length === 0 && search === "") {
    return (
      <EmptyResultView
        title="No endpoints yet"
        description="Expose this application to the public internet by adding an endpoint"
        className="p-6 w-100"
      />
    );
  }

  return (
    <EndpointList
      endpoints={endpoints}
      search={search}
      onChange={onChange}
      showTitle
    />
  );
}

export function EndpointsByEnv({ envId }: { envId: string }) {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (nextSearch: string) => {
    setParams({ search: nextSearch });
  };
  const endpoints = useSelector((s: AppState) =>
    selectEndpointsByEnvIdForTableSearch(s, { search, envId }),
  );

  if (endpoints.length === 0 && search === "") {
    return (
      <EmptyResultView
        title="No endpoints yet"
        description="Expose this application to the public internet by adding an endpoint"
        className="p-6 w-100"
      />
    );
  }

  return (
    <EndpointList endpoints={endpoints} search={search} onChange={onChange} />
  );
}

export function EndpointsByApp({ appId }: { appId: string }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (nextSearch: string) => {
    setParams({ search: nextSearch });
  };
  const app = useSelector((s: AppState) => selectAppById(s, { id: appId }));
  const endpoints = useSelector((s: AppState) =>
    selectEndpointsByAppIdForTableSearch(s, { search, appId }),
  );
  const action = (
    <ButtonCreate
      envId={app.environmentId}
      onClick={() => {
        navigate(appEndpointCreateUrl(app.id));
      }}
    >
      <IconPlusCircle variant="sm" className="mr-2" /> New Endpoint
    </ButtonCreate>
  );

  if (endpoints.length === 0 && search === "") {
    return (
      <EmptyResultView
        title="No endpoints yet"
        description="Expose this application to the public internet by adding an endpoint"
        className="p-6 w-100"
        action={action}
      />
    );
  }

  return (
    <EndpointList
      endpoints={endpoints}
      search={search}
      onChange={onChange}
      actions={[action]}
    />
  );
}

export function EndpointsByDatabase({ dbId }: { dbId: string }) {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (nextSearch: string) => {
    setParams({ search: nextSearch });
  };
  const endpoints = useSelector((s: AppState) =>
    selectEndpointsByDbIdForTableSearch(s, { search, dbId }),
  );

  if (endpoints.length === 0 && search === "") {
    return (
      <EmptyResultView
        title="No endpoints yet"
        description="Expose this application to the public internet by adding an endpoint"
        className="p-6 w-100"
      />
    );
  }

  return (
    <EndpointList endpoints={endpoints} search={search} onChange={onChange} />
  );
}

export function EndpointsByCert({ certId }: { certId: string }) {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (nextSearch: string) => {
    setParams({ search: nextSearch });
  };
  const endpoints = useSelector((s: AppState) =>
    selectEndpointsByCertIdForTableSearch(s, { search, certId }),
  );

  if (endpoints.length === 0 && search === "") {
    return (
      <EmptyResultView
        title="No endpoints yet"
        description="Expose this application to the public internet by adding an endpoint"
        className="p-6 w-100"
      />
    );
  }

  return (
    <EndpointList endpoints={endpoints} search={search} onChange={onChange} />
  );
}
