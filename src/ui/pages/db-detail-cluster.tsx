import {
  CONTAINER_PROFILES,
  calcMetrics,
  fetchDatabase,
  fetchDatabaseDependents,
  fetchDatabaseImages,
  fetchEnvironmentServices,
  selectDatabaseById,
  selectDatabaseDependents,
  selectDatabaseImageById,
  selectDiskById,
  selectServiceById,
} from "@app/deploy";
import { useQuery } from "@app/fx";
import { databaseEndpointsUrl } from "@app/routes";
import { capitalize } from "@app/string-utils";
import { AppState, DeployDatabase } from "@app/types";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { usePaginate } from "../hooks";
import {
  DescBar,
  EmptyTr,
  FilterBar,
  Group,
  PaginateBar,
  TBody,
  THead,
  Table,
  Td,
  Th,
  Tr,
  tokens,
} from "../shared";

const ClusterDatabaseRow = ({
  db,
}: {
  db: DeployDatabase;
}) => {
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: db.serviceId }),
  );
  const image = useSelector((s: AppState) =>
    selectDatabaseImageById(s, { id: db.databaseImageId }),
  );
  const metrics = calcMetrics([service]);
  const disk = useSelector((s: AppState) =>
    selectDiskById(s, { id: db.diskId }),
  );
  return (
    <Tr>
      <Td className="flex-1 pl-4">
        <Link to={databaseEndpointsUrl(db.id)}>
          <div className={tokens.type.darker}>{db.handle}</div>
          <div className={tokens.type["normal lighter"]}>ID: {db.id}</div>
        </Link>
      </Td>

      <Td className="flex-1">
        <div className="text-gray-900">{capitalize(db.type)}</div>
        <div className={tokens.type["normal lighter"]}>
          Version {image.version}
        </div>
      </Td>

      <Td className="flex-1">
        <div className={tokens.type.darker}>{disk.size} GB</div>
      </Td>

      <Td className="flex-1">
        <div className="text-gray-900">
          {metrics.totalMemoryLimit / 1024} GB
        </div>
      </Td>

      <Td className="flex-1">
        <div className="text-gray-900">
          {CONTAINER_PROFILES[service.instanceClass].name}
        </div>
      </Td>
    </Tr>
  );
};

export const DatabaseClusterPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchDatabase({ id }));
  const database = useSelector((s: AppState) => selectDatabaseById(s, { id }));
  useQuery(fetchDatabaseDependents({ id }));
  const clusterDatabases = useSelector((s: AppState) =>
    selectDatabaseDependents(s, { id }),
  );
  useQuery(fetchDatabaseImages());
  useQuery(fetchEnvironmentServices({ id: database.environmentId }));

  const paginated = usePaginate(clusterDatabases);

  return (
    <Group>
      <Group size="sm">
        <div className="text-gray-500 select-none">
          <FilterBar>
            <Group variant="horizontal" size="lg" className="items-center">
              <DescBar>
                {paginated.totalItems} Cluster Databases. Replicas can only be
                added via the Aptible CLI,{" "}
                <a
                  href="https://www.aptible.com/docs/replication-clustering"
                  className="text-blue-500"
                >
                  view docs to learn more
                </a>
                .{" "}
              </DescBar>
              <PaginateBar {...paginated} />
            </Group>
          </FilterBar>
        </div>
      </Group>

      <Table>
        <THead>
          <Th>Database</Th>
          <Th>Type</Th>
          <Th>Disk Size</Th>
          <Th>Container Size</Th>
          <Th>Profile</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={5} /> : null}
          {paginated.data.map((db) => (
            <ClusterDatabaseRow key={db.id} db={db} />
          ))}
        </TBody>
      </Table>
    </Group>
  );
};
