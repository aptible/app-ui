import {
  calcMetrics,
  fetchAllDatabaseImages,
  fetchDatabase,
  fetchDatabaseDependents,
  fetchEnvironmentServices,
  selectDatabaseById,
  selectDatabaseDependents,
  selectDatabaseImageById,
  selectDiskById,
  selectServiceById,
} from "@app/deploy";
import { CONTAINER_PROFILES } from "@app/deploy/container/utils";
import { useQuery } from "@app/fx";
import { databaseEndpointsUrl } from "@app/routes";
import { capitalize } from "@app/string-utils";
import { AppState, DeployDatabase } from "@app/types";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import {
  LoadResources,
  ResourceListView,
  TableHead,
  Td,
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
    <tr className="group hover:bg-gray-50" key={`${db.id}`}>
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
    </tr>
  );
};

export const DatabaseClusterPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchDatabase({ id }));
  const database = useSelector((s: AppState) => selectDatabaseById(s, { id }));
  const clusterDatabases = useSelector((s: AppState) =>
    selectDatabaseDependents(s, { id }),
  );
  const dependentsQuery = useQuery(fetchDatabaseDependents({ id }));
  useQuery(fetchAllDatabaseImages());
  useQuery(fetchEnvironmentServices({ id: database.environmentId }));

  return (
    <LoadResources query={dependentsQuery} isEmpty={false}>
      <div className="text-sm text-gray-500 mt-4 select-none">
        <div className="text-base inline">
          {clusterDatabases.length ? clusterDatabases.length : 0} Cluster
          Members. Replicas can only be added via the Aptible CLI,{" "}
          <a
            href="https://www.aptible.com/docs/replication-clustering"
            className="text-blue-500"
          >
            view docs to learn more
          </a>
          .
        </div>
      </div>
      {clusterDatabases.length ? (
        <div className="my-4">
          <ResourceListView
            tableHeader={
              <TableHead
                headers={[
                  "Database",
                  "Type",
                  "Disk Size",
                  "Container Size",
                  "Profile",
                ]}
              />
            }
            tableBody={
              <>
                {clusterDatabases.map((db) => (
                  <ClusterDatabaseRow key={db.id} db={db} />
                ))}
              </>
            }
          />
        </div>
      ) : null}
    </LoadResources>
  );
};
