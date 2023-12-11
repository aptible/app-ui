import {
  fetchApp,
  fetchConfiguration,
  selectAppById,
  selectDepGraphApps,
  selectDepGraphDatabases,
} from "@app/deploy";
import { useQuery } from "@app/fx";
import { AppState } from "@app/types";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import {
  AppListByApps,
  DatabaseListByDatabases,
  Group,
  tokens,
} from "../shared";

export const AppDetailDepsPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchApp({ id }));
  const app = useSelector((s: AppState) => selectAppById(s, { id }));
  useQuery(fetchConfiguration({ id: app.currentConfigurationId }));
  const dbs = useSelector((s: AppState) =>
    selectDepGraphDatabases(s, { id: app.currentConfigurationId }),
  );
  const apps = useSelector((s: AppState) =>
    selectDepGraphApps(s, { id: app.currentConfigurationId }),
  );

  return (
    <Group>
      <Group>
        <h3 className={tokens.type.h3}>Apps</h3>
        <AppListByApps apps={apps} />
      </Group>

      <Group>
        <h3 className={tokens.type.h3}>Databases</h3>
        <DatabaseListByDatabases databases={dbs} />
      </Group>
    </Group>
  );
};
