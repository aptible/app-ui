import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import type { AppState, DeployApp } from "@app/types";
import { selectEnvironmentById, selectServicesByIds } from "@app/deploy";
import { calcMetrics } from "@app/deploy";
import { appDetailUrl } from "@app/routes";

import { TableHead, Td, tokens, ResourceListView, Input } from "../../shared";

const FilterBarView = () => {
  return (
    <div className="flex flex-1 pt-4 gap-3">
      <Input placeholder="Search Apps..." type="text" />
    </div>
  );
};

type AppCellProps = { app: DeployApp };

const AppPrimaryCell = ({ app }: AppCellProps) => {
  const environment = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: app.environmentId }),
  );

  return (
    <Td className="flex-1">
      <Link to={appDetailUrl(app.id)}>
        <div className={tokens.type["medium label"]}>{app.handle}</div>
        <div className={tokens.type["normal lighter"]}>
          {environment.handle}
        </div>
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
const AppLastDeploymentCell = ({ app }: AppCellProps) => {
  return (
    <Td className="2xl:flex-cell-md sm:flex-cell-sm">
      {app.lastDeployOperation ? (
        <>
          <div className={tokens.type.darker}>
            {app.lastDeployOperation.userName}
          </div>
          <div className={tokens.type["normal lighter"]}>
            {app.lastDeployOperation.status} {app.lastDeployOperation.updatedAt}
          </div>
        </>
      ) : (
        <div className={tokens.type["normal lighter"]}>Never deployed</div>
      )}
    </Td>
  );
};

const AppListRow = ({ app }: { app: DeployApp }) => {
  return (
    <tr>
      <AppPrimaryCell app={app} />
      <AppServicesCell app={app} />
      <AppLastDeploymentCell app={app} />
    </tr>
  );
};

export const AppListView = ({ apps }: { apps: DeployApp[] }) => {
  return (
    <>
      <ResourceListView
        title="Apps"
        description="Apps are how you deploy your code on Aptible. Eventually, your Apps are deployed as one or more Containers."
        filterBar={<FilterBarView />}
        tableHeader={
          <TableHead headers={["Handle", "Services", "Last deployment"]} />
        }
        tableBody={
          <>
            {apps.map((app) => (
              <AppListRow app={app} key={app.id} />
            ))}
          </>
        }
      />
    </>
  );
};
