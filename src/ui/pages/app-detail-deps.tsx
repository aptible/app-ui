import {
  fetchApp,
  fetchConfiguration,
  selectAppById,
  selectDependenciesByType,
} from "@app/deploy";
import { useQuery, useSelector } from "@app/react";
import { useParams } from "react-router";
import {
  Banner,
  DatabaseListByDatabases,
  Group,
  PermissionGate,
  tokens,
} from "../shared";

export const AppDetailDepsPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchApp({ id }));
  const app = useSelector((s) => selectAppById(s, { id }));
  useQuery(fetchConfiguration({ id: app.currentConfigurationId }));
  const depGroups = useSelector((s) =>
    selectDependenciesByType(s, { id: app.id }),
  );

  return (
    <PermissionGate scope="read" envId={app.environmentId}>
      <Group>
        <Banner variant="info">
          BETA - Dependencies are connections derived from the App's
          configuration data (environment variables).
        </Banner>
        <h3 className={tokens.type.h3}>Databases</h3>
        <DatabaseListByDatabases databases={depGroups.database} />
      </Group>
    </PermissionGate>
  );
};
