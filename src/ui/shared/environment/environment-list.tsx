import { IconInfo } from "../icons";
import { Tooltip } from "../tooltip";
import {
  fetchAllEnvironments,
  selectAppsByEnvId,
  selectDatabasesByEnvId,
  selectEnvironmentsByStackId,
  selectEnvironmentsForTableSearch,
  selectStackById,
} from "@app/deploy";
import { useQuery } from "@app/fx";
import { environmentAppsUrl, stackDetailEnvsUrl } from "@app/routes";
import type { AppState, DeployEnvironment } from "@app/types";
import { Link, useSearchParams } from "react-router-dom";

import { InputSearch } from "../input";
import { LoadResources } from "../load-resources";
import { ResourceHeader, ResourceListView } from "../resource-list-view";
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
  return (
    <Td>
      <Link to={environmentAppsUrl(environment.id)} className="flex">
        <img
          src="/resource-types/logo-environment.png"
          className="w-8 h-8 mt-1 mr-2"
          aria-label="Environment"
        />
        <p className="leading-4 mt-2">
          <span className={tokens.type["table link"]}>
            {environment.handle}
          </span>
        </p>
      </Link>
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

const EnvironmentLastDeployedCell = ({ environment }: EnvironmentCellProps) => {
  const operation = useSelector((s: AppState) =>
    selectLatestSuccessDeployOpByEnvId(s, { envId: environment.id }),
  );
  const userName = operation.userName.slice(0, 15);
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

const EnvironmentStackCell = ({ environment }: EnvironmentCellProps) => {
  const stack = useSelector((s: AppState) =>
    selectStackById(s, { id: environment.stackId }),
  );

  return (
    <Td className="2xl:flex-cell-md sm:flex-cell-sm">
      <div>
        <div className="text-black">
          <Link
            to={stackDetailEnvsUrl(stack.id)}
            className={tokens.type["table link"]}
          >
            {stack.name}
          </Link>
        </div>
        <div className={tokens.type["normal lighter"]}>
          {stack.organizationId ? "Dedicated Stack " : "Shared Stack "}(
          {stack.region})
        </div>
      </div>
    </Td>
  );
};

const EnvironmentListRow = ({ environment }: EnvironmentCellProps) => {
  return (
    <tr className="group hover:bg-gray-50">
      <EnvironmentPrimaryCell environment={environment} />
      <EnvironmentStackCell environment={environment} />
      <EnvironmentLastDeployedCell environment={environment} />
      <EnvironmentAppsCell environment={environment} />
      <EnvironmentDatabasesCell environment={environment} />
    </tr>
  );
};

type HeaderTypes =
  | {
      resourceHeaderType: "title-bar";
      onChange: (ev: React.ChangeEvent<HTMLInputElement>) => void;
    }
  | { resourceHeaderType: "simple-text"; onChange?: null };

const EnvsResourceHeaderTitleBar = ({
  envs,
  resourceHeaderType = "title-bar",
  search = "",
  onChange,
}: {
  envs: DeployEnvironment[];
  search?: string;
} & HeaderTypes) => {
  switch (resourceHeaderType) {
    case "title-bar":
      if (!onChange) {
        return null;
      }
      return (
        <ResourceHeader
          title="Environments"
          filterBar={
            <div className="pt-1">
              <InputSearch
                placeholder="Search environments..."
                search={search}
                onChange={onChange}
              />
              <div className="flex">
                <p className="flex text-gray-500 mt-4 text-base">
                  {envs.length} Environment{envs.length !== 1 && "s"}
                </p>
                <div className="mt-4">
                  <Tooltip
                    fluid
                    text="Environments are how you separate resources like staging and production."
                  >
                    <IconInfo className="h-5 mt-0.5 opacity-50 hover:opacity-100" />
                  </Tooltip>
                </div>
              </div>
            </div>
          }
        />
      );
    case "simple-text":
      return (
        <p className="flex text-gray-500 text-base mb-4">
          {envs.length} Environment{envs.length !== 1 && "s"}
        </p>
      );
    default:
      return null;
  }
};
const environmentHeaders = [
  "Environment",
  "Stack",
  "Last Deployed",
  "Apps",
  "Databases",
];

export function EnvironmentListByStack({ stackId }: { stackId: string }) {
  const query = useQuery(fetchAllEnvironments());
  const [params, _] = useSearchParams();
  const search = params.get("search") || "";

  const environments = useSelector((s: AppState) =>
    selectEnvironmentsByStackId(s, { stackId }),
  );

  return (
    <LoadResources
      query={query}
      isEmpty={environments.length === 0 && search === ""}
    >
      <ResourceListView
        header={
          <EnvsResourceHeaderTitleBar
            envs={environments}
            resourceHeaderType="simple-text"
          />
        }
        tableHeader={
          <TableHead
            headers={environmentHeaders}
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
export function EnvironmentList() {
  const query = useQuery(fetchAllEnvironments());
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value });
  };

  const environments = useSelector((s: AppState) =>
    selectEnvironmentsForTableSearch(s, { search }),
  );

  return (
    <LoadResources
      query={query}
      isEmpty={environments.length === 0 && search === ""}
    >
      <ResourceListView
        header={
          <EnvsResourceHeaderTitleBar
            envs={environments}
            resourceHeaderType="title-bar"
            search={search}
            onChange={onChange}
          />
        }
        tableHeader={
          <TableHead
            headers={environmentHeaders}
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
