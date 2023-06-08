import { Link } from "react-router-dom";
import { useQuery } from "saga-query/react";

import {
  fetchAllEnvironments,
  selectAppsByEnvId,
  selectDatabasesByEnvId,
  selectEnvironmentsForTableSearch,
  selectStackById,
} from "@app/deploy";
import { environmentResourcelUrl } from "@app/routes";
import type { AppState, DeployEnvironment } from "@app/types";

import { Button } from "../button";
import { IconEllipsis } from "../icons";
import { LoadResources } from "../load-resources";
import { ResourceListView } from "../resource-list-view";
import { TableHead, Td } from "../table";
import { tokens } from "../tokens";
import { prettyEnglishDate, timeAgo } from "@app/date";
import { selectLatestSuccessDeployOpByEnvId } from "@app/deploy/operation";
import { capitalize } from "@app/string-utils";
import { useSelector } from "react-redux";

interface EnvironmentCellProps {
  environment: DeployEnvironment;
}

const EnvironmentPrimaryCell = ({ environment }: EnvironmentCellProps) => {
  const environmentTypeColor =
    environment.type === "development"
      ? tokens.type["normal blue lighter"]
      : tokens.type["normal lighter"];
  return (
    <Td className="min-w-fit pl-4 pr-8">
      <Link to={environmentResourcelUrl(environment.id)}>
        <img
          className="float-left mr-3"
          alt="default environment logo"
          src="/logo-environment.png"
          style={{ width: 32, height: 32, marginTop: 4 }}
        />
        <div className={tokens.type["medium label"]}>{environment.handle}</div>
        <div className={environmentTypeColor}>
          {environment.type === "development"
            ? "Debug mode"
            : "Production mode"}
        </div>
      </Link>
    </Td>
  );
};

const EnvironmentStackCell = ({ environment }: EnvironmentCellProps) => {
  const stack = useSelector((s: AppState) =>
    selectStackById(s, { id: environment.stackId }),
  );
  return (
    <Td className="min-w-fit pl-8">
      <div className={tokens.type["medium label"]}>{stack.name}</div>
      <div className={tokens.type["normal lighter"]}>
        {!stack.organizationId ? "Shared" : "Dedicated"}
      </div>
    </Td>
  );
};

const EnvironmentDatabasesCell = ({ environment }: EnvironmentCellProps) => {
  const dbs = useSelector((s: AppState) =>
    selectDatabasesByEnvId(s, { envId: environment.id }),
  );
  return (
    <Td className="center items-center justify-center">
      <div className="text-center">{dbs.length}</div>
    </Td>
  );
};

const EnvironmentAppsCell = ({ environment }: EnvironmentCellProps) => {
  const apps = useSelector((s: AppState) =>
    selectAppsByEnvId(s, { envId: environment.id }),
  );
  return (
    <Td className="center items-center justify-center">
      <div className="text-center">{apps.length}</div>
    </Td>
  );
};

const EnvironmentActionCell = () => {
  return (
    <Td className="flex gap-2 justify-end">
      <Button
        className="mt-2 mr-4"
        variant="white"
        size="xs"
        style={{
          cursor: "not-allowed",
          pointerEvents: "none",
          opacity: 0.5,
        }}
      >
        <IconEllipsis style={{ width: 16, height: 16 }} />
      </Button>
    </Td>
  );
};

const EnvironmentLastDeployedCell = ({ environment }: EnvironmentCellProps) => {
  const operation = useSelector((s: AppState) =>
    selectLatestSuccessDeployOpByEnvId(s, { envId: environment.id }),
  );
  const userName =
    operation.userName.length >= 15
      ? `${operation.userName.slice(0, 15)}...`
      : operation.userName;
  return (
    <Td className="2xl:flex-cell-md sm:flex-cell-sm">
      <div
        className={tokens.type.darker}
        style={{ textTransform: "capitalize" }}
      >
        {prettyEnglishDate(operation.createdAt)}
      </div>
      <div>
        {timeAgo(operation.createdAt)} by {capitalize(userName)}
      </div>
    </Td>
  );
};

const EnvironmentListRow = ({ environment }: EnvironmentCellProps) => {
  return (
    <tr>
      <EnvironmentPrimaryCell environment={environment} />
      <EnvironmentStackCell environment={environment} />
      <EnvironmentLastDeployedCell environment={environment} />
      <EnvironmentAppsCell environment={environment} />
      <EnvironmentDatabasesCell environment={environment} />
    </tr>
  );
};

export function EnvironmentList({ search }: { search: string }) {
  const query = useQuery(fetchAllEnvironments());
  useQuery(fetchAllEnvironments());

  const environments = useSelector((s: AppState) =>
    selectEnvironmentsForTableSearch(s, { search }),
  );

  return (
    <LoadResources
      query={query}
      isEmpty={environments.length === 0 && search === ""}
    >
      <div />
      <ResourceListView
        tableHeader={
          <TableHead
            headers={[
              "Environment",
              "Stack",
              "Last Deployed",
              "Apps",
              "Databases",
            ]}
            rightAlignedFinalCol
            leftAlignedFirstCol
            centerAlignedColIndices={[3, 4]}
          />
        }
        tableBody={
          <>
            {environments.map((environment) => (
              <EnvironmentListRow
                environment={environment}
                key={environment.id}
              />
            ))}
          </>
        }
      />
    </LoadResources>
  );
}
