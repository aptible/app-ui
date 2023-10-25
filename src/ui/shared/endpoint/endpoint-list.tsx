import {
  DeployEndpointRow,
  fetchCertificateById,
  fetchEndpoints,
  getEndpointText,
  getEndpointUrl,
  requiresAcmeSetup,
  selectAppById,
  selectDatabaseById,
  selectEndpointsByAppIdForTableSearch,
  selectEndpointsByCertIdForTableSearch,
  selectEndpointsByDbIdForTableSearch,
  selectEndpointsByEnvIdForTableSearch,
  selectEndpointsByServiceId,
  selectEndpointsForTableSearch,
} from "@app/deploy";
import {
  appDetailUrl,
  appEndpointCreateUrl,
  databaseDetailUrl,
  databaseEndpointCreateUrl,
  endpointDetailSetupUrl,
  endpointDetailUrl,
} from "@app/routes";
import { AppState, DeployEndpoint } from "@app/types";
import { usePaginate } from "@app/ui/hooks";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "saga-query/react";
import { Button, ButtonCreate } from "../button";
import { CopyTextButton } from "../copy";
import { Group } from "../group";
import { IconPlusCircle } from "../icons";
import { InputSearch } from "../input";
import {
  ActionBar,
  DescBar,
  FilterBar,
  PaginateBar,
  TitleBar,
} from "../resource-list-view";
import { EmptyTr, TBody, THead, Table, Th, Tr } from "../table";
import { Td } from "../table";
import { tokens } from "../tokens";
import { EndpointStatusPill } from "./util";

export const EndpointItemView = ({
  endpoint,
}: { endpoint: DeployEndpoint }) => {
  return (
    <Link
      className="flex items-center gap-1 text-black group-hover:text-indigo hover:text-indigo"
      to={endpointDetailUrl(endpoint.id)}
    >
      <img
        src="/resource-types/logo-vhost.png"
        className="w-[32px] h-[32px] mr-2 align-middle"
        aria-label="Endpoint"
      />
      <p className={`${tokens.type["table link"]} leading-8`}>
        {getEndpointUrl(endpoint)}
      </p>
    </Link>
  );
};

const EndpointRow = ({ endpoint }: { endpoint: DeployEndpointRow }) => {
  const navigate = useNavigate();
  const txt = getEndpointText(endpoint);
  const acmeSetup = () => {
    navigate(endpointDetailSetupUrl(endpoint.id));
  };

  return (
    <Tr>
      <Td>
        <div className="flex flex-row items-center gap-2">
          <EndpointItemView endpoint={endpoint} />
          <CopyTextButton text={getEndpointUrl(endpoint)} />
        </div>
      </Td>
      <Td>{endpoint.id}</Td>
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
          <Button variant="primary" size="sm" onClick={acmeSetup}>
            Setup
          </Button>
        ) : (
          "Completed"
        )}
      </Td>
    </Tr>
  );
};

const EndpointList = ({
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
  const paginated = usePaginate(endpoints);

  return (
    <Group>
      <Group size="sm">
        <TitleBar
          visible={showTitle}
          description="Endpoints let you expose your Apps on Aptible to clients over the public internet or your Stack's internal network."
        >
          Endpoints
        </TitleBar>

        <FilterBar>
          <div className="flex justify-between mb-1">
            <InputSearch
              placeholder="Search ..."
              search={search}
              onChange={(e) => onChange(e.currentTarget.value)}
            />

            <ActionBar>
              {actions.map((comp, idx) => {
                return <span key={`${idx}-action`}>{comp}</span>;
              })}
            </ActionBar>
          </div>

          <Group variant="horizontal" size="lg" className="items-center">
            <DescBar>{paginated.totalItems} Endpoints</DescBar>
            <PaginateBar {...paginated} />
          </Group>
        </FilterBar>
      </Group>

      <Table>
        <THead>
          <Th>URL</Th>
          <Th>ID</Th>
          <Th>Resource</Th>
          <Th>Status</Th>
          <Th>Placement</Th>
          <Th>Platform</Th>
          <Th>ACME Status</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={7} /> : null}
          {paginated.data.map((enp) => (
            <EndpointRow endpoint={enp} key={enp.id} />
          ))}
        </TBody>
      </Table>
    </Group>
  );
};

export function EndpointsByOrg() {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  useQuery(fetchEndpoints());
  const onChange = (nextSearch: string) => {
    setParams({ search: nextSearch }, { replace: true });
  };
  const endpoints = useSelector((s: AppState) =>
    selectEndpointsForTableSearch(s, { search }),
  );

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
    setParams({ search: nextSearch }, { replace: true });
  };
  const endpoints = useSelector((s: AppState) =>
    selectEndpointsByEnvIdForTableSearch(s, { search, envId }),
  );

  return (
    <EndpointList endpoints={endpoints} search={search} onChange={onChange} />
  );
}

export function EndpointsByApp({ appId }: { appId: string }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (nextSearch: string) => {
    setParams({ search: nextSearch }, { replace: true });
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
    setParams({ search: nextSearch }, { replace: true });
  };
  const endpoints = useSelector((s: AppState) =>
    selectEndpointsByDbIdForTableSearch(s, { search, dbId }),
  );
  const db = useSelector((s: AppState) => selectDatabaseById(s, { id: dbId }));
  const navigate = useNavigate();
  const action = (
    <ButtonCreate
      envId={db.environmentId}
      onClick={() => navigate(databaseEndpointCreateUrl(dbId))}
    >
      <IconPlusCircle variant="sm" className="mr-2" /> New Endpoint
    </ButtonCreate>
  );

  return (
    <EndpointList
      endpoints={endpoints}
      search={search}
      onChange={onChange}
      actions={[action]}
    />
  );
}

export function EndpointsByCert({ certId }: { certId: string }) {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (nextSearch: string) => {
    setParams({ search: nextSearch }, { replace: true });
  };
  useQuery(fetchCertificateById({ certId }));
  const endpoints = useSelector((s: AppState) =>
    selectEndpointsByCertIdForTableSearch(s, { search, certId }),
  );

  return (
    <EndpointList endpoints={endpoints} search={search} onChange={onChange} />
  );
}

export function EndpointsByDbService({
  serviceId,
  dbId,
}: { serviceId: string; dbId: string }) {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (nextSearch: string) => {
    setParams({ search: nextSearch }, { replace: true });
  };
  const db = useSelector((s: AppState) => selectDatabaseById(s, { id: dbId }));
  const endpoints = useSelector((s: AppState) =>
    selectEndpointsByServiceId(s, { serviceId, search }),
  );
  const navigate = useNavigate();
  const action = (
    <ButtonCreate
      envId={db.environmentId}
      onClick={() => navigate(databaseEndpointCreateUrl(dbId))}
    >
      <IconPlusCircle variant="sm" className="mr-2" /> New Endpoint
    </ButtonCreate>
  );

  return (
    <EndpointList
      endpoints={endpoints}
      search={search}
      onChange={onChange}
      actions={[action]}
    />
  );
}
