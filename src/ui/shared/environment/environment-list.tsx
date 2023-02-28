import { useQuery } from "saga-query/react";
import { Link } from "react-router-dom";
import { useState } from "react";
import cn from "classnames";

import {
  fetchAllEnvironments,
  selectAppsByEnvId,
  selectDatabasesByEnvId,
  selectEnvironmentsForTableSearch,
  selectStackById,
} from "@app/deploy";
import type { AppState, DeployEnvironment } from "@app/types";
import { environmentResourcelUrl } from "@app/routes";

import { IconEllipsis, IconSearch } from "../icons";
import { TableHead, Td } from "../table";
import { LoadResources } from "../load-resources";
import { tokens } from "../tokens";
import { Input } from "../input";
import { ResourceListView } from "../resource-list-view";
import { useSelector } from "react-redux";
import { selectLatestSuccessDeployOpByEnvId } from "@app/deploy/operation";
import { prettyEnglishDate, timeAgo } from "@app/date";
import { Button } from "../button";
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
    <Td>
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
    <Td>
      <span className="text-center">{dbs.length}</span>
    </Td>
  );
};

const EnvironmentAppsCell = ({ environment }: EnvironmentCellProps) => {
  const apps = useSelector((s: AppState) =>
    selectAppsByEnvId(s, { envId: environment.id }),
  );
  return (
    <Td>
      <span className="text-center">{apps.length}</span>
    </Td>
  );
};

const EnvironmentActionCell = () => {
  return (
    <Td className="flex gap-2 justify-end">
      <Button
        variant="white"
        size="xs"
        style={{
          cursor: "not-allowed",
          pointerEvents: "none",
          opacity: 0.5,
          marginTop: 6,
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
  return (
    <Td className="2xl:flex-cell-md sm:flex-cell-sm">
      <div
        className={tokens.type.darker}
        style={{ textTransform: "capitalize" }}
      >
        {prettyEnglishDate(operation.createdAt)}
      </div>
      <div>
        {timeAgo(operation.createdAt)} by {operation.userName || "Unknown"}
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
      <EnvironmentActionCell />
    </tr>
  );
};

export function EnvironmentList() {
  const query = useQuery(fetchAllEnvironments());
  useQuery(fetchAllEnvironments());

  const [search, setSearch] = useState("");
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(ev.currentTarget.value);

  const environments = useSelector((s: AppState) =>
    selectEnvironmentsForTableSearch(s, { search }),
  );

  return (
    <LoadResources
      query={query}
      isEmpty={environments.length === 0 && search === ""}
    >
      <ResourceListView
        title="Environments"
        filterBar={
          <div className="flex flex-1 pt-4 gap-3 relative m-1">
            <IconSearch
              className="absolute inline-block top-6 left-1.5"
              color="#595E63"
              style={{ width: 15, height: 15, marginTop: 2.5, marginLeft: 2.5 }}
            />
            <Input
              placeholder="Search ..."
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
              "Environment",
              "Stack",
              "Last Deployed",
              "Apps",
              "Databases",
              "Actions",
            ]}
            rightAlignedFinalCol
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
