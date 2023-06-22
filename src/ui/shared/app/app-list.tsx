import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useQuery } from "saga-query/react";

import { prettyDateRelative } from "@app/date";
import {
  DeployAppRow,
  calcServiceMetrics,
  fetchAllApps,
  fetchAllEnvironments,
  fetchEnvironmentById,
  selectAppsForTableSearch,
  selectAppsForTableSearchByEnvironmentId,
} from "@app/deploy";
import { selectServicesByIds } from "@app/deploy";
import { calcMetrics } from "@app/deploy";
import { appServicesUrl, operationDetailUrl } from "@app/routes";
import type { AppState } from "@app/types";

import { EmptyResourcesTable } from "../empty-resources-table";
import { InputSearch } from "../input";
import { LoadResources } from "../load-resources";
import { OpStatus } from "../op-status";
import { ResourceHeader, ResourceListView } from "../resource-list-view";
import { EnvStackCell } from "../resource-table";
import { Header, TableHead, Td } from "../table";
import { tokens } from "../tokens";
import { capitalize } from "@app/string-utils";

interface AppCellProps {
  app: DeployAppRow;
}

const AppPrimaryCell = ({ app }: AppCellProps) => {
  return (
    <Td className="flex-1">
      <Link to={appServicesUrl(app.id)} className="flex">
        <img
          src="/resource-types/logo-app.png"
          className="w-8 h-8 mr-2 align-middle"
          aria-label="App"
        />
        <p className={`${tokens.type["table link"]} leading-8`}>{app.handle}</p>
      </Link>
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
    return acc + mm.estimatedCostInDollars;
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
  return (
    <Td className="2xl:flex-cell-md sm:flex-cell-sm">
      {app.lastOperation ? (
        <>
          <div className={tokens.type.darker}>
            <Link
              to={operationDetailUrl(app.lastOperation.id)}
              className={tokens.type["table link"]}
            >
              {capitalize(app.lastOperation.type)} by{" "}
              {app.lastOperation.userName}
            </Link>
          </div>
          <div className={tokens.type.darker} />
          <div className={tokens.type["normal lighter"]}>
            <OpStatus status={app.lastOperation.status} />{" "}
            {prettyDateRelative(app.lastOperation.createdAt)}
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
    <tr>
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
  "Estimated Monthly Cost",
  "Last Operation",
];

const AppList = ({
  apps,
  headerTitleBar,
}: {
  apps: DeployAppRow[];
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

const AppsResourceHeaderTitleBar = ({
  apps,
  resourceHeaderType = "title-bar",
  search = "",
  onChange,
}: {
  apps: DeployAppRow[];
  resourceHeaderType?: "title-bar" | "simple-text" | "hidden";
  search?: string;
  onChange?: (ev: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  switch (resourceHeaderType) {
    case "hidden":
      return null;
    case "title-bar":
      return (
        <ResourceHeader
          title="Apps"
          filterBar={
            <div className="pt-1">
              <InputSearch
                placeholder="Search apps..."
                search={search}
                onChange={onChange}
              />
              <p className="flex text-gray-500 mt-4 text-base">
                {apps.length} App{apps.length !== 1 && "s"}
              </p>
            </div>
          }
        />
      );
    case "simple-text":
      return (
        <p className="flex text-gray-500 text-base">
          {apps.length} App{apps.length !== 1 && "s"}
        </p>
      );
    default:
      return null;
  }
};

export const AppListByOrg = ({
  resourceHeaderType = "title-bar",
}: {
  environmentId?: string;
  resourceHeaderType?: "title-bar" | "simple-text" | "hidden";
  skipDescription?: boolean;
}) => {
  const query = useQuery(fetchAllApps());
  useQuery(fetchAllEnvironments());

  const [search, setSearch] = useState("");
  const apps = useSelector((s: AppState) =>
    selectAppsForTableSearch(s, { search }),
  );

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(ev.currentTarget.value);

  return (
    <LoadResources
      empty={
        <EmptyResourcesTable
          headers={appHeaders}
          titleBar={
            <AppsResourceHeaderTitleBar
              apps={apps}
              resourceHeaderType={resourceHeaderType}
              search={search}
              onChange={onChange}
            />
          }
        />
      }
      query={query}
      isEmpty={apps.length === 0 && search === ""}
    >
      <AppList
        apps={apps}
        headerTitleBar={
          <AppsResourceHeaderTitleBar
            apps={apps}
            resourceHeaderType={resourceHeaderType}
            search={search}
            onChange={onChange}
          />
        }
      />
    </LoadResources>
  );
};

export const AppListByEnvironment = ({
  environmentId,
  resourceHeaderType = "title-bar",
  search = "",
  onChange,
}: {
  environmentId: string;
  resourceHeaderType?: "title-bar" | "simple-text" | "hidden";
  skipDescription?: boolean;
  search?: string;
  onChange?: (ev: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const query = useQuery(fetchAllApps());
  useQuery(fetchEnvironmentById({ id: environmentId }));

  const apps = useSelector((s: AppState) =>
    selectAppsForTableSearchByEnvironmentId(s, {
      envId: environmentId,
      search,
    }),
  );

  return (
    <LoadResources
      empty={
        <EmptyResourcesTable
          headers={appHeaders}
          titleBar={
            <AppsResourceHeaderTitleBar
              apps={apps}
              resourceHeaderType={resourceHeaderType}
              search={search}
              onChange={onChange}
            />
          }
        />
      }
      query={query}
      isEmpty={apps.length === 0 && search === ""}
    >
      <AppList
        apps={apps}
        headerTitleBar={
          <AppsResourceHeaderTitleBar
            apps={apps}
            resourceHeaderType={resourceHeaderType}
            search={search}
            onChange={onChange}
          />
        }
      />
    </LoadResources>
  );
};
