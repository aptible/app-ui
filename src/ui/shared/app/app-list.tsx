import { useQuery } from "saga-query/react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";

import { prettyDateRelative } from "@app/date";
import {
  calcServiceMetrics,
  DeployAppRow,
  fetchAllApps,
  fetchAllEnvironments,
  selectAppsForTableSearch,
} from "@app/deploy";
import type { AppState } from "@app/types";
import { selectServicesByIds } from "@app/deploy";
import { calcMetrics } from "@app/deploy";
import { appDetailUrl } from "@app/routes";

import { IconMagnifyingGlass } from "../icons";
import { TableHead, Td } from "../table";
import { LoadResources } from "../load-resources";
import { tokens } from "../tokens";
import { Input } from "../input";
import { ResourceListView } from "../resource-list-view";

interface AppCellProps {
  app: DeployAppRow;
}

const AppPrimaryCell = ({ app }: AppCellProps) => {
  return (
    <Td className="flex-1">
      <Link to={appDetailUrl(app.id)}>
        <div className={tokens.type["medium label"]}>{app.handle}</div>
        <div className={tokens.type["normal lighter"]}>{app.envHandle}</div>
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
      <AppServicesCell app={app} />
      <AppCostCell app={app} />
      <AppLastOpCell app={app} />
    </tr>
  );
};

export function AppList() {
  const query = useQuery(fetchAllApps());
  useQuery(fetchAllEnvironments());

  const [search, setSearch] = useState("");
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(ev.currentTarget.value);

  const apps = useSelector((s: AppState) =>
    selectAppsForTableSearch(s, { search }),
  );

  const description =
    "Apps are how you deploy your code on Aptible. Eventually, your Apps are deployed as one or more Containers.";

  return (
    <LoadResources query={query} isEmpty={apps.length === 0 && search === ""}>
      <ResourceListView
        title="Apps"
        description={description}
        filterBar={
          <div className="flex flex-1 pt-4 gap-3 relative m-1">
            <IconMagnifyingGlass className="absolute inline-block top-6 left-1.5" />
            <Input
              placeholder="Search Apps ..."
              type="text"
              value={search}
              onChange={onChange}
              className="search-bar pl-8"
            />
          </div>
        }
        tableHeader={
          <TableHead
            headers={[
              "Handle",
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
