import {
  LoadResources,
  ResourceListView,
  TableHead,
  Td,
  tokens,
} from "../shared";
import {
  CONTAINER_PROFILES,
  calcMetrics,
  fetchAllDatabaseImages,
  fetchDatabase,
  fetchDatabaseDependents,
  fetchEnvironmentServices,
  selectDatabaseById,
  selectDatabaseDependents,
  selectDatabaseImagesAsList,
  selectServicesAsList,
} from "@app/deploy";
import { databaseEndpointsUrl } from "@app/routes";
import { capitalize } from "@app/string-utils";
import {
  AppState,
  DeployDatabase,
  DeployDatabaseImage,
  DeployService,
} from "@app/types";
import { ReactElement } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { useQuery } from "saga-query/react";

const clusterDatabaseRow = ({
  clusterDatabase,
  service,
  databaseImage,
}: {
  clusterDatabase: DeployDatabase;
  service?: DeployService;
  databaseImage?: DeployDatabaseImage;
}): ReactElement | null => {
  if (!service) {
    // without the service populated we do not have enough data to hydrate this yet!
    return null;
  }
  const metrics = calcMetrics([service]);
  return (
    <tr key={`${clusterDatabase.id}`}>
      <Td className="flex-1 pl-4">
        <Link to={databaseEndpointsUrl(clusterDatabase.id)}>
          <div className={tokens.type.darker}>{clusterDatabase.handle}</div>
          <div className={tokens.type["normal lighter"]}>
            ID: {clusterDatabase.id}
          </div>
        </Link>
      </Td>

      <Td className="flex-1">
        <div className="text-gray-900">{capitalize(clusterDatabase.type)}</div>
        <div className={tokens.type["normal lighter"]}>
          {!!databaseImage && `Version ${databaseImage.version}`}
        </div>
      </Td>

      <Td className="flex-1">
        <div className={tokens.type.darker}>
          {clusterDatabase.disk ? `${clusterDatabase.disk?.size} GB` : "N/A"}
        </div>
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
  const services = useSelector(selectServicesAsList);
  const databaseImages = useSelector((s: AppState) =>
    selectDatabaseImagesAsList(s),
  );

  return (
    <LoadResources query={dependentsQuery} isEmpty={false}>
      <div className="text-sm text-gray-500 mt-4 select-none">
        <div className="ml-5 cursor-pointer inline">
          {clusterDatabases.length ? clusterDatabases.length : 0} Cluster
          Members. Replicas can only be added via the Aptible CLI,{" "}
          <a href="https://aptible.com/docs" className="text-blue-500">
            view docs to learn more
          </a>
          .
        </div>
      </div>
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
              {clusterDatabases
                .map((clusterDatabase) =>
                  clusterDatabaseRow({
                    clusterDatabase,
                    service: services.find(
                      (s) => s.id === clusterDatabase.serviceId,
                    ),
                    databaseImage: databaseImages.find(
                      (d) => d.id === clusterDatabase.databaseImageId,
                    ),
                  }),
                )
                .filter((reactElement) => !!reactElement)}
            </>
          }
        />
      </div>
    </LoadResources>
  );
};
