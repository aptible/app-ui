import {
  fetchApp,
  fetchConfiguration,
  selectAppById,
  selectDepGraphDatabases,
} from "@app/deploy";
import { useQuery, useSelector } from "@app/react";
import { useParams } from "react-router";
import { DatabaseListByDatabases, Group, tokens } from "../shared";

export const AppDetailDepsPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchApp({ id }));
  const app = useSelector((s) => selectAppById(s, { id }));
  useQuery(fetchConfiguration({ id: app.currentConfigurationId }));
  const dbs = useSelector((s) =>
    selectDepGraphDatabases(s, { id: app.currentConfigurationId }),
  );

  return (
    <Group>
      <h3 className={tokens.type.h3}>Databases</h3>
      <DatabaseListByDatabases databases={dbs} />
    </Group>
  );
};
