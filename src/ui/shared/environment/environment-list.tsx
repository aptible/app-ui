import { useQuery } from "saga-query/react";
import { Link } from "react-router-dom";
import { useState } from "react";
import cn from "classnames";

import {
  fetchAllEnvironments,
  selectEnvironmentsForTableSearch,
  selectStackById,
} from "@app/deploy";
import type { AppState, DeployEnvironment, OperationStatus } from "@app/types";
import { appDetailUrl, environmentResourcelUrl } from "@app/routes";

import {
  IconCheck,
  IconEllipsis,
  IconInfo,
  IconSearch,
  IconSettings,
  IconX,
} from "../icons";
import { TableHead, Td } from "../table";
import { LoadResources } from "../load-resources";
import { tokens } from "../tokens";
import { Input } from "../input";
import { ResourceListView } from "../resource-list-view";
import { useSelector } from "react-redux";
import {
  selectLatestOpByEnvId,
  selectLatestSuccessDeployOpByEnvId,
} from "@app/deploy/operation";
import { prettyDateRelative } from "@app/date";
import { Button } from "../button";

const StatusPill = ({
  status,
  from,
}: {
  status: OperationStatus;
  from: string;
}) => {
  const date = prettyDateRelative(from);

  const className = cn(
    "rounded-full border-2",
    "text-sm font-semibold ",
    "px-2 flex justify-between items-center w-fit",
  );

  if (status === "running" || status === "queued") {
    return (
      <div className={cn(className, "text-brown border-brown bg-orange-100")}>
        Building <IconSettings color="#825804" className="mr-1" variant="sm" />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className={cn(className, "text-red border-red-300 bg-red-100")}>
        Failed <IconX color="#AD1A1A" variant="sm" />
      </div>
    );
  }

  if (status === "succeeded") {
    return (
      <div className={cn(className, "text-forest border-lime-300 bg-lime-100")}>
        Succeeded <IconCheck color="#00633F" className="mr-1" variant="sm" />
      </div>
    );
  }

  return (
    <div className={cn(className, "text-gray-600 border-gray-300 bg-gray-100")}>
      Not Deployed
    </div>
  );
};

interface EnvironmentCellProps {
  environment: DeployEnvironment;
}

const EnvironmentPrimaryCell = ({ environment }: EnvironmentCellProps) => {
  return (
    <Td className="flex-1">
      <Link to={environmentResourcelUrl(environment.id)}>
        <div className={tokens.type["medium label"]}>{environment.handle}</div>
        <div className={tokens.type["normal lighter"]}>
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

const EnvironmentStatusCell = ({ environment }: EnvironmentCellProps) => {
  const operation = useSelector((s: AppState) =>
    selectLatestOpByEnvId(s, { envId: environment.id }),
  );
  return (
    <Td>
      <StatusPill status={operation.status} from={operation.createdAt} />
    </Td>
  );
};

const EnvironmentActionCell = () => {
  return (
    <Td>
      <Button variant="white" size="xs">
        <IconEllipsis />
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
      <div className={tokens.type.darker}>
        <span className="font-semibold">
          {operation.type.toLocaleUpperCase()}
        </span>{" "}
        by {operation.userName}
      </div>
      <span style={{ textTransform: "capitalize" }}>
        {prettyDateRelative(operation.createdAt)}
      </span>
    </Td>
  );
};

const EnvironmentListRow = ({ environment }: EnvironmentCellProps) => {
  return (
    <tr>
      <td className="2xl:flex-cell-xs sm:flex-cell-sm">
        <img
          alt="default environment logo"
          src="/logo-environment.png"
          style={{ width: 40, height: 40, margin: "0 -24px 0 8px" }}
        />
      </td>
      <EnvironmentPrimaryCell environment={environment} />
      <EnvironmentStackCell environment={environment} />
      <EnvironmentStatusCell environment={environment} />
      <EnvironmentLastDeployedCell environment={environment} />
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

  const description =
    "Environments are how you deploy your code on Aptible. Eventually, your Apps are deployed as one or more Containers.";
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
        description={description}
        filterBar={
          <div className="flex flex-1 pt-4 gap-3 relative m-1">
            <IconSearch className="absolute inline-block top-6 left-1.5" />
            <Input
              placeholder="Search Environments ..."
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
              "",
              "Environment",
              "Stack",
              "Status",
              "Last deployed",
              "Actions",
            ]}
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
