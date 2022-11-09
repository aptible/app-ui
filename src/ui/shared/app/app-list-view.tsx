import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import type { AppState, DeployApp } from "@app/types";
import { selectEnvironmentById, selectServicesByIds } from "@app/deploy";
import { calcMetrics } from "@app/deploy";
import { appDetailUrl } from "@app/routes";

import {
  TableHead,
  Td,
  Button,
  tokens,
  ResourceListView,
  EnvironmentSelect,
  StackSelect,
  Input,
} from "../../shared";

const FilterBarView = () => {
  return (
    <div className="flex flex-1 pt-4 gap-3">
      <Input placeholder="Search Apps..." type="text" />
      <EnvironmentSelect />
      <StackSelect />
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

const AppStatusChecksCell = () => {
  return (
    <Td className="2xl:flex-cell-md sm:flex-cell-sm">
      <div className={tokens.type.darker}>100%</div>
      <div className={tokens.type["normal lighter"]}>
        124 config checks &middot; 5m ago
      </div>
    </Td>
  );
};

/* const AppStackCell = ({ app }: AppCellProps) => {
  const envQuery = useApi(
    fetchEnvironment({ id: app.environmentId }),
    (s: AppState) => selectEnvironmentById(s, { id: app.environmentId }),
  );
  const stackId = envQuery.data?.stackId || '';
  const stackQuery = useApi(fetchStack({ id: stackId }), (s: AppState) =>
    selectStackById(s, { id: stackId }),
  );

  const content =
    envQuery.isLoading || stackQuery.isLoading || !stackQuery.data ? (
      <span>Loading...</span>
    ) : (
      <div>
        <div className={tokens.type.darker}>{envQuery.data?.handle}</div>
        <div className={tokens.type['normal lighter']}>
          {stackQuery.data.id ? 'Dedicated Stack ' : 'Shared Stack '}
          {stackQuery.data.region}
        </div>
      </div>
    );

  return <Td className="2xl:flex-cell-md sm:flex-cell-sm">{content}</Td>;
}; */

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
      <AppStatusChecksCell />
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
        actions={[
          <Button type="button" variant="primary" onClick={() => {}}>
            Create App
          </Button>,
        ]}
        tableHeader={
          <TableHead
            headers={["Handle", "Status", "Services", "Last deployment"]}
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
    </>
  );
};
