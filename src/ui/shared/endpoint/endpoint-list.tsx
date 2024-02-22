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
  selectServiceById,
} from "@app/deploy";
import { useQuery, useSelector } from "@app/react";
import {
  appDetailUrl,
  appEndpointCreateUrl,
  databaseDetailUrl,
  databaseEndpointCreateUrl,
  endpointDetailSetupUrl,
  endpointDetailUrl,
} from "@app/routes";
import { DeployEndpoint } from "@app/types";
import { usePaginate } from "@app/ui/hooks";
import { useNavigate } from "react-router";
import { Link, useSearchParams } from "react-router-dom";
import { Button, ButtonCreate } from "../button";
import { CopyText, CopyTextButton } from "../copy";
import { Group } from "../group";
import { IconPlusCircle } from "../icons";
import { InputSearch } from "../input";
import {
  ActionBar,
  DescBar,
  FilterBar,
  LoadingBar,
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
  const service = useSelector((s) =>
    selectServiceById(s, { id: endpoint.serviceId }),
  );

  return (
    <Tr>
      <Td>
        <div className="flex flex-row items-center gap-2">
          <EndpointItemView endpoint={endpoint} />
          <CopyTextButton text={txt.url} />
        </div>
      </Td>
      <Td>
        <CopyText text={txt.hostname} />
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
      <Td>{service.processType}</Td>
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
  isLoading = false,
}: {
  endpoints: DeployEndpointRow[];
  actions?: JSX.Element[];
  search?: string;
  onChange?: (s: string) => void;
  showTitle?: boolean;
  isLoading?: boolean;
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
            <Group variant="horizontal" size="sm" className="items-center">
              <InputSearch
                placeholder="Search..."
                search={search}
                onChange={(e) => onChange(e.currentTarget.value)}
              />
              <LoadingBar isLoading={isLoading} />
            </Group>

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
          <Th>Hostname</Th>
          <Th>Resource</Th>
          <Th>Service</Th>
          <Th>Status</Th>
          <Th>Placement</Th>
          <Th>Platform</Th>
          <Th>ACME Status</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={8} /> : null}
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
  const { isLoading } = useQuery(fetchEndpoints());
  const onChange = (nextSearch: string) => {
    setParams({ search: nextSearch }, { replace: true });
  };
  const endpoints = useSelector((s) =>
    selectEndpointsForTableSearch(s, { search }),
  );

  return (
    <EndpointList
      endpoints={endpoints}
      search={search}
      onChange={onChange}
      isLoading={isLoading}
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
  const endpoints = useSelector((s) =>
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
  const app = useSelector((s) => selectAppById(s, { id: appId }));
  const endpoints = useSelector((s) =>
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
  const endpoints = useSelector((s) =>
    selectEndpointsByDbIdForTableSearch(s, { search, dbId }),
  );
  const db = useSelector((s) => selectDatabaseById(s, { id: dbId }));
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
  const endpoints = useSelector((s) =>
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
  const db = useSelector((s) => selectDatabaseById(s, { id: dbId }));
  const endpoints = useSelector((s) =>
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
