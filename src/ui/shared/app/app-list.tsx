import { useLoader, useQuery } from "@app/fx";
import { useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { IconInfo, IconPlusCircle } from "../icons";
import { Tooltip } from "../tooltip";

import { prettyDateRelative } from "@app/date";
import {
  calcServiceMetrics,
  fetchAllApps,
  fetchAllEnvironments,
  fetchEnvironmentById,
  selectAppsForTableSearch,
  selectAppsForTableSearchByEnvironmentId,
  selectLatestOpByAppId,
} from "@app/deploy";
import { selectServicesByIds } from "@app/deploy";
import { calcMetrics } from "@app/deploy";
import {
  appDetailUrl,
  environmentCreateAppUrl,
  operationDetailUrl,
} from "@app/routes";
import { capitalize } from "@app/string-utils";
import type { AppState, DeployApp } from "@app/types";
import { ActionList, ActionListView } from "../action-list-view";
import { ButtonCreate } from "../button";
import { EmptyResourcesTable } from "../empty-resources-table";
import { InputSearch } from "../input";
import { LoadResources } from "../load-resources";
import { OpStatus } from "../op-status";
import { ResourceHeader, ResourceListView } from "../resource-list-view";
import { EnvStackCell } from "../resource-table";
import { Header, TableHead, Td } from "../table";
import { tokens } from "../tokens";

interface AppCellProps {
  app: DeployApp;
}

export const AppItemView = ({ app }: { app: DeployApp }) => {
  return (
    <Link to={appDetailUrl(app.id)} className="flex">
      <img
        src="/resource-types/logo-app.png"
        className="w-8 h-8 mr-2 align-middle"
        aria-label="App"
      />
      <p className={`${tokens.type["table link"]} leading-8`}>{app.handle}</p>
    </Link>
  );
};

const AppPrimaryCell = ({ app }: AppCellProps) => {
  return (
    <Td className="flex-1">
      <AppItemView app={app} />
    </Td>
  );
};

const AppServicesCell = ({ app }: AppCellProps) => {
  const services = useSelector((s: AppState) =>
    selectServicesByIds(s, { ids: app.serviceIds }),
  );
  const metrics = calcMetrics(services);
  return (
    <Td>
      <div
        className={tokens.type.darker}
      >{`${app.serviceIds.length} Services`}</div>
      <div className={tokens.type["normal lighter"]}>
        {metrics.totalMemoryLimit / 1024} GB &middot; {metrics.totalCPU} CPU
      </div>
    </Td>
  );
};

const AppCostCell = ({ app }: AppCellProps) => {
  const services = useSelector((s: AppState) =>
    selectServicesByIds(s, { ids: app.serviceIds }),
  );
  const cost = services.reduce((acc, service) => {
    const mm = calcServiceMetrics(service);
    return acc + (mm.estimatedCostInDollars * 1024) / 1000;
  }, 0);

  return (
    <Td>
      <div className={tokens.type.darker}>
        {cost.toLocaleString("en", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
        })}
      </div>
    </Td>
  );
};

const AppLastOpCell = ({ app }: AppCellProps) => {
  const lastOperation = useSelector((s: AppState) =>
    selectLatestOpByAppId(s, { appId: app.id }),
  );

  return (
    <Td className="2xl:flex-cell-md sm:flex-cell-sm">
      {lastOperation ? (
        <>
          <div className={tokens.type.darker}>
            <Link
              to={operationDetailUrl(lastOperation.id)}
              className={tokens.type["table link"]}
            >
              {capitalize(lastOperation.type)} by {lastOperation.userName}
            </Link>
          </div>
          <div className={tokens.type.darker} />
          <div className={tokens.type["normal lighter"]}>
            <OpStatus status={lastOperation.status} />{" "}
            {prettyDateRelative(lastOperation.createdAt)}
          </div>
        </>
      ) : (
        <div className={tokens.type["normal lighter"]}>No activity</div>
      )}
    </Td>
  );
};

const AppListRow = ({ app }: AppCellProps) => {
  return (
    <tr className="group hover:bg-gray-50">
      <AppPrimaryCell app={app} />
      <EnvStackCell environmentId={app.environmentId} />
      <AppServicesCell app={app} />
      <AppCostCell app={app} />
      <AppLastOpCell app={app} />
    </tr>
  );
};

const appHeaders: Header[] = [
  "Handle",
  "Environment",
  "Services",
  "Est. Monthly Cost",
  "Last Operation",
];

export const AppList = ({
  apps,
  headerTitleBar,
}: {
  apps: DeployApp[];
  headerTitleBar: React.ReactNode;
}) => {
  return (
    <ResourceListView
      header={headerTitleBar}
      tableHeader={<TableHead headers={appHeaders} />}
      tableBody={
        <>
          {apps.map((app) => (
            <AppListRow app={app} key={app.id} />
          ))}
        </>
      }
    />
  );
};

type HeaderTypes =
  | {
      resourceHeaderType: "title-bar";
      onChange: (ev: React.ChangeEvent<HTMLInputElement>) => void;
    }
  | { resourceHeaderType: "simple-text"; onChange?: null };

export const AppsResourceHeaderTitleBar = ({
  apps,
  search = "",
  resourceHeaderType,
  onChange,
  actions = [],
}: {
  apps: DeployApp[];
  search?: string;
  actions?: ActionList;
} & HeaderTypes) => {
  switch (resourceHeaderType) {
    case "title-bar":
      return (
        <ResourceHeader
          title="Apps"
          actions={actions}
          filterBar={
            <div className="pt-1">
              <InputSearch
                placeholder="Search apps..."
                search={search}
                onChange={onChange}
              />
              <div className="flex">
                <p className="flex text-gray-500 mt-4 text-base">
                  {apps.length} App{apps.length !== 1 && "s"}
                </p>
                <div className="mt-4">
                  <Tooltip
                    fluid
                    text="Apps are how you deploy your code, scale services, and manage endpoints."
                  >
                    <IconInfo className="h-5 mt-0.5 opacity-50 hover:opacity-100" />
                  </Tooltip>
                </div>
              </div>
            </div>
          }
        />
      );
    case "simple-text":
      return (
        <div className="flex justify-between items-center text-gray-500 text-base mb-4">
          <div>
            {apps.length} App{apps.length !== 1 && "s"}
          </div>
          <div>
            {actions.length > 0 ? <ActionListView actions={actions} /> : null}
          </div>
        </div>
      );
    default:
      return null;
  }
};

export const AppListByOrg = () => {
  const query = useQuery(fetchAllApps());
  useQuery(fetchAllEnvironments());

  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value });
  };
  const apps = useSelector((s: AppState) =>
    selectAppsForTableSearch(s, { search }),
  );
  const titleBar = (
    <AppsResourceHeaderTitleBar
      apps={apps}
      search={search}
      resourceHeaderType="title-bar"
      onChange={onChange}
    />
  );

  return (
    <LoadResources
      empty={<EmptyResourcesTable headers={appHeaders} titleBar={titleBar} />}
      query={query}
      isEmpty={apps.length === 0 && search === ""}
    >
      <AppList apps={apps} headerTitleBar={titleBar} />
    </LoadResources>
  );
};

export const AppListByEnvironment = ({
  environmentId,
}: {
  environmentId: string;
}) => {
  const navigate = useNavigate();
  const loader = useLoader(fetchAllApps());
  useQuery(fetchEnvironmentById({ id: environmentId }));

  const apps = useSelector((s: AppState) =>
    selectAppsForTableSearchByEnvironmentId(s, {
      envId: environmentId,
      search: "",
    }),
  );

  const onCreate = () => {
    navigate(environmentCreateAppUrl(environmentId));
  };

  const titleBar = (
    <AppsResourceHeaderTitleBar
      apps={apps}
      resourceHeaderType="simple-text"
      actions={[
        <ButtonCreate envId={environmentId} onClick={onCreate}>
          <IconPlusCircle variant="sm" /> <div className="ml-2">New App</div>
        </ButtonCreate>,
      ]}
    />
  );

  return (
    <LoadResources
      empty={<EmptyResourcesTable headers={appHeaders} titleBar={titleBar} />}
      query={loader}
      isEmpty={apps.length === 0}
    >
      <AppList apps={apps} headerTitleBar={titleBar} />
    </LoadResources>
  );
};
