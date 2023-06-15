import { ReactElement, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useQuery } from "saga-query/react";

import { prettyDateRelative } from "@app/date";
import {
  DeployAppRow,
  calcServiceMetrics,
  fetchAllApps,
  fetchAllEnvironments,
  selectAppsForTableSearch,
} from "@app/deploy";
import { selectServicesByIds } from "@app/deploy";
import { calcMetrics } from "@app/deploy";
import { appServicesUrl } from "@app/routes";
import type { AppState } from "@app/types";

import { InputSearch } from "../input";
import { LoadResources } from "../load-resources";
import { ResourceHeader, ResourceListView } from "../resource-list-view";
import { EnvStackCell } from "../resource-table";
import { TableHead, Td } from "../table";
import { tokens } from "../tokens";

interface AppCellProps {
  app: DeployAppRow;
}

const AppPrimaryCell = ({ app }: AppCellProps) => {
  return (
    <Td className="flex-1">
      <Link to={appServicesUrl(app.id)}>{app.handle}</Link>
      <div className={tokens.type["normal lighter"]}>{app.envHandle}</div>
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
      <div className={tokens.type.darker}>${cost}</div>
    </Td>
  );
};

const AppLastOpCell = ({ app }: AppCellProps) => {
  return (
    <Td className="2xl:flex-cell-md sm:flex-cell-sm">
      {app.lastOperation ? (
        <>
          <div className={tokens.type.darker}>
            <span className="font-semibold">
              {app.lastOperation.type.toLocaleUpperCase()}
            </span>{" "}
            by {app.lastOperation.userName}
          </div>
          <div className={tokens.type.darker} />
          <div className={tokens.type["normal lighter"]}>
            <span className="font-semibold">
              {app.lastOperation.status.toLocaleUpperCase()}
            </span>{" "}
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

// TODO - can turn below to an interface as it has a common entrypoint for lists, not sure if we want to do this
export function AppList({
  resourceHeaderType = "title-bar",
  searchOverride = "",
}: {
  resourceHeaderType?: "title-bar" | "simple-text" | "hidden";
  skipDescription?: boolean;
  searchOverride?: string;
}) {
  const query = useQuery(fetchAllApps());
  useQuery(fetchAllEnvironments());

  const [search, setSearch] = useState("");
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(ev.currentTarget.value);

  const apps = useSelector((s: AppState) =>
    selectAppsForTableSearch(s, {
      search: searchOverride ? searchOverride : search,
    }),
  );

  const resourceHeaderTitleBar = (): ReactElement | undefined => {
    switch (resourceHeaderType) {
      case "hidden":
        return undefined;
      case "title-bar":
        return (
          <ResourceHeader
            title="Apps"
            filterBar={
              searchOverride ? undefined : (
                <InputSearch
                  placeholder="Search apps..."
                  search={search}
                  onChange={onChange}
                />
              )
            }
          />
        );
      case "simple-text":
        return (
          <p className="flex ml-4 text-gray-500 text-base">
            {apps.length} App{apps.length > 1 && "s"}
          </p>
        );
      default:
        return undefined;
    }
  };

  return (
    <LoadResources query={query} isEmpty={apps.length === 0 && search === ""}>
      <ResourceListView
        header={resourceHeaderTitleBar()}
        tableHeader={
          <TableHead
            headers={[
              "Handle",
              "Environment",
              "Services",
              "Estimated Monthly Cost",
              "Last operation",
            ]}
          />
        }
        tableBody={
          <>
            {apps.map((app) => (
              <AppListRow app={app} key={app.id} />
            ))}
          </>
        }
      />
    </LoadResources>
  );
}
