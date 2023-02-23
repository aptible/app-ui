import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useNavigate, useParams } from "react-router";
import { Link } from "react-router-dom";
import { useApi, useCache, useLoaderSuccess, useQuery } from "saga-query/react";
import { selectDataById, selectLoaderById } from "saga-query";
import cn from "classnames";

import { prettyDateRelative, prettyDateTime } from "@app/date";
import {
  appDetailUrl,
  createProjectAddKeyUrl,
  createProjectAddNameUrl,
  createProjectGitPushUrl,
  createProjectGitSettingsUrl,
  createProjectGitStatusUrl,
} from "@app/routes";
import { fetchSSHKeys } from "@app/ssh-keys";
import { selectCurrentUser } from "@app/users";
import {
  AppState,
  DeployApp,
  DeployDatabase,
  DeployDatabaseImage,
  DeployOperation,
  HalEmbedded,
  OperationStatus,
} from "@app/types";

import {
  tokens,
  Box,
  Input,
  Loading,
  ErrorResources,
  Button,
  FormGroup,
  BannerMessages,
  Banner,
  ApplicationSidebar,
  IconCogs8Tooth,
  IconCheck,
  IconXMark,
  IconInfo,
  IconGitBranch,
  IconChevronDown,
  IconChevronUp,
  ButtonLink,
  IconChevronRight,
} from "../shared";
import { AddSSHKeyForm } from "../shared/add-ssh-key";
import { createProject, deployProject, TextVal } from "@app/projects";
import {
  cancelAppOpsPoll,
  fetchAllStacks,
  fetchApp,
  fetchAppOperations,
  fetchDatabasesByEnvId,
  fetchEnvironment,
  pollAppOperations,
  selectAppById,
  selectDatabasesByEnvId,
  selectEnvironmentById,
  selectStackPublicDefault,
} from "@app/deploy";
import {
  cancelEnvOperationsPoll,
  fetchOperationLogs,
  hasDeployOperation,
  pollEnvOperations,
  selectLatestConfigureOp,
  selectLatestDeployOp,
  selectLatestProvisionOp,
  selectLatestProvisionOps,
  selectLatestScanOp,
  selectLatestSucceessScanOp,
} from "@app/deploy/operation";
import { selectOrganizationSelected } from "@app/organizations";
import {
  fetchAllDatabaseImages,
  selectDatabaseImagesAsList,
} from "@app/deploy/database-images";
import {
  DeployCodeScanResponse,
  fetchCodeScanResult,
} from "@app/deploy/code-scan-result";
import {
  DeployServiceDefinitionResponse,
  fetchServiceDefinitionsByAppId,
} from "@app/deploy/app-service-definitions";

export const CreateProjectLayout = () => {
  return (
    <>
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <ApplicationSidebar />
      </div>

      <div
        className="md:pl-64 flex flex-col flex-1 h-full bg-no-repeat bg-center bg-cover"
        style={{
          backgroundImage: "url(/background-pattern-v2.png)",
        }}
      >
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="py-4">
                <div className="flex justify-center container">
                  <div style={{ width: 700 }}>
                    <Outlet />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export const CreateProjectGitPage = () => {
  const user = useSelector(selectCurrentUser);
  const query = useCache<HalEmbedded<{ ssh_keys: any[] }>>(
    fetchSSHKeys({ userId: user.id }),
  );

  if (query.isInitialLoading) return <Loading />;
  if (query.isError) return <ErrorResources message={query.message} />;
  if (!query.data) return <div>Could not fetch SSH keys</div>;

  if (query.data._embedded.ssh_keys.length === 0) {
    return <Navigate to={createProjectAddKeyUrl()} replace />;
  }

  return <Navigate to={createProjectAddNameUrl()} replace />;
};

const FormNav = ({
  prev = "",
  next = "",
}: {
  prev?: string;
  next?: string;
}) => {
  return (
    <div>
      {prev ? (
        <Link aria-disabled={!prev} to={prev} className="pr-2">
          Prev
        </Link>
      ) : null}
      {next ? (
        <Link aria-disabled={!next} to={next}>
          Next
        </Link>
      ) : null}
    </div>
  );
};

export const CreateProjectAddKeyPage = () => {
  const navigate = useNavigate();
  const onSuccess = () => navigate(createProjectAddNameUrl());

  return (
    <div>
      <div className="text-center">
        <h1 className={tokens.type.h1}>Deploy your code</h1>
        <p className="my-4 text-gray-600">
          Add your SSH key to deploy code to Aptible.
        </p>
      </div>

      <FormNav next={createProjectAddNameUrl()} />

      <Box>
        <AddSSHKeyForm onSuccess={onSuccess} />
      </Box>
    </div>
  );
};

const PreCode = ({ children }: { children: React.ReactNode }) => {
  return <pre className={tokens.type.pre}>{children}</pre>;
};

export const CreateProjectNamePage = () => {
  const org = useSelector(selectOrganizationSelected);
  const stack = useSelector(selectStackPublicDefault);
  const [name, setName] = useState("");
  const thunk = useApi(
    createProject({ name, stackId: stack.id, orgId: org.id }),
  );
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    thunk.trigger();
  };
  const navigate = useNavigate();
  useQuery(fetchAllStacks());

  useLoaderSuccess(thunk, () => {
    navigate(createProjectGitPushUrl(thunk.meta.appId));
  });

  return (
    <div>
      <div className="text-center">
        <h1 className={tokens.type.h1}>Deploy your code</h1>
        <p className="my-4 text-gray-600">Provide a name for your project.</p>
      </div>

      <FormNav prev={createProjectAddKeyUrl()} />

      <Box>
        <div className="my-2">Stack: {stack.name}</div>
        <form onSubmit={onSubmit}>
          <FormGroup label="Project Name" htmlFor="name" feedbackVariant="info">
            <Input
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              autoFocus
            />
          </FormGroup>

          {thunk.isError ? (
            <BannerMessages {...thunk} className="my-2" />
          ) : null}

          <Button
            className="mt-4 w-full"
            type="submit"
            isLoading={thunk.isLoading}
          >
            Create project
          </Button>
        </form>
      </Box>
    </div>
  );
};

const OpResult = ({ op }: { op: DeployOperation }) => {
  const postfix = `operation: ${op.id}`;
  if (op.status === "failed") {
    return (
      <Banner variant="error">
        {op.type} operation failed, {postfix}
      </Banner>
    );
  }
  if (op.status === "succeeded") {
    return (
      <Banner variant="success">
        {op.type} success, {postfix}
      </Banner>
    );
  }
  if (op.status === "running") {
    return (
      <Banner variant="info">
        {op.type} detected (running), {postfix}
      </Banner>
    );
  }
  return (
    <Banner variant="info">
      {op.type} detected (queued), {postfix}
    </Banner>
  );
};

export const CreateProjectGitPushPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { appId = "" } = useParams();

  useQuery(fetchApp({ id: appId }));
  const app = useSelector((s: AppState) => selectAppById(s, { id: appId }));
  useQuery(pollAppOperations({ id: appId }));
  const scanOp = useSelector((s: AppState) => selectLatestScanOp(s, { appId }));
  const deployOp = useSelector((s: AppState) =>
    selectLatestDeployOp(s, { appId }),
  );

  const envId = app.environmentId;
  useQuery(fetchEnvironment({ id: envId }));
  const env = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: envId }),
  );

  useEffect(() => {
    const cancel = () => dispatch(cancelAppOpsPoll());
    cancel();
    dispatch(pollAppOperations({ id: appId }));
    return () => {
      cancel();
    };
  }, [appId]);

  useEffect(() => {
    if (scanOp && scanOp.status === "succeeded") {
      navigate(createProjectGitSettingsUrl(appId));
    }
  }, [scanOp]);

  return (
    <div>
      <div className="text-center">
        <h1 className={tokens.type.h1}>Deploy your code</h1>
        <p className="my-4 text-gray-600">Git push your code to continue.</p>
      </div>

      <FormNav
        prev={createProjectAddKeyUrl()}
        next={createProjectGitSettingsUrl(appId)}
      />
      <Box>
        <div>
          <h3 className={tokens.type.h3}>Add Aptible's Git Server</h3>
          <PreCode>
            git remote add aptible git@beta.aptible.com:{env.handle}/
            {app.handle}.git
          </PreCode>
        </div>
        <div className="mt-4">
          <h3 className={tokens.type.h3}>Push your code</h3>
          <PreCode>git push aptible main</PreCode>
        </div>

        <hr className="my-4" />

        {deployOp ? (
          <div>
            We detected an app deployment, did you push to the{" "}
            <code>aptible-scan</code> branch?
          </div>
        ) : null}

        {scanOp ? (
          <OpResult op={scanOp} />
        ) : (
          <Loading text="Waiting for git push ..." />
        )}
      </Box>
    </div>
  );
};

const trim = (t: string) => t.trim();
const parseText = <
  M extends { [key: string]: string } = { [key: string]: string },
>(
  text: string,
): TextVal<M>[] =>
  text
    .split("\n")
    .map(trim)
    .map((t) => {
      const vals = t.split("=").map(trim);
      return {
        key: vals[0],
        value: vals[1],
      };
    });

interface ValidatorError {
  item: TextVal;
  message: string;
}

const validateDbs = (
  items: TextVal[],
  dbImages: DeployDatabaseImage[],
): ValidatorError[] => {
  const errors: ValidatorError[] = [];

  const validate = (item: TextVal) => {
    const imgs = dbImages.filter((img) => img.type === item.key);
    if (imgs.length === 0) {
      errors.push({
        item,
        message: `[${item.key}] is not a valid database`,
      });
      return;
    }

    let found = false;
    imgs.forEach((img) => {
      if (img.version === item.value) {
        found = true;
      }
    });

    if (!found) {
      errors.push({
        item,
        message: `[${item.value}] is not a valid version for [${item.key}]`,
      });
    }
  };

  items.forEach(validate);
  return errors;
};

const validateEnvs = (items: TextVal[]): ValidatorError[] => {
  const errors: ValidatorError[] = [];

  const validate = (item: TextVal) => {
    // https://stackoverflow.com/a/2821201
    if (!/[a-zA-Z_]+[a-zA-Z0-9_]*/.test(item.key)) {
      errors.push({
        item,
        message: `${item.key} does not match regex: /[a-zA-Z_]+[a-zA-Z0-9_]*/`,
      });
    }
  };

  items.forEach(validate);
  return errors;
};

const useLatestCodeResults = (appId: string) => {
  const appOps = useQuery(fetchAppOperations({ id: appId }));
  const scanOp = useSelector((s: AppState) =>
    selectLatestSucceessScanOp(s, { appId }),
  );

  const codeScan = useCache<DeployCodeScanResponse>(
    fetchCodeScanResult({ id: scanOp.codeScanResultId }),
  );

  return { scanOp, codeScan, appOps };
};

interface HalServiceDefinition {
  service_definitions: DeployServiceDefinitionResponse[];
}

export const CreateProjectGitSettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { appId = "" } = useParams();

  useQuery(fetchApp({ id: appId }));
  const app = useSelector((s: AppState) => selectAppById(s, { id: appId }));
  const { scanOp, codeScan, appOps } = useLatestCodeResults(appId);

  const dbQuery = useQuery(fetchAllDatabaseImages());
  const dbImages = useSelector(selectDatabaseImagesAsList);

  const serviceDefinitionsQuery = useCache<HalEmbedded<HalServiceDefinition>>(
    fetchServiceDefinitionsByAppId({ appId }),
  );

  const [dbs, setDbs] = useState("postgresql=14");
  const [dbErrors, setDbErrors] = useState<ValidatorError[]>([]);
  const [envs, setEnvs] = useState(["STRIPE_SECRET_KEY=1234"].join("\n"));
  const [envErrors, setEnvErrors] = useState<ValidatorError[]>([]);
  const [cmds, setCmds] = useState(
    ["http:web=bundle exec rails server", "worker=bundle exec sidekiq"].join(
      "\n",
    ),
  );
  const [existingCmds, setExistingCmds] = useState<TextVal[]>([]);
  const cmdList = parseText(cmds);

  const loader = useSelector((s: AppState) =>
    selectLoaderById(s, { id: `${deployProject}` }),
  );

  useEffect(() => {
    const serviceDefinitions =
      serviceDefinitionsQuery.data?._embedded.service_definitions;
    if (!!serviceDefinitions && serviceDefinitions?.length !== 0) {
      // hydrate inputs for consumption on load
      const cmdsToSet =
        serviceDefinitions
          .map(
            (serviceDefinition) =>
              `${serviceDefinition.process_type}=${serviceDefinition.command}`,
          )
          .join("\n") ?? "";
      setCmds(cmdsToSet);

      // set cmd list from initial setting, which will get regrokked before submission
      setExistingCmds(
        serviceDefinitions.map((serviceDefinition) => ({
          key: serviceDefinition.process_type,
          value: serviceDefinition.command,
          meta: { id: serviceDefinition.id.toString() },
        })),
      );
    }
  }, [serviceDefinitionsQuery.data?._embedded.service_definitions]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let cancel = false;

    const dbList = parseText<{ id: string }>(dbs);
    const dberr = validateDbs(dbList, dbImages);
    if (dberr.length > 0) {
      cancel = true;
      setDbErrors(dberr);
    } else {
      setDbErrors([]);

      for (let i = 0; i < dbList.length; i += 1) {
        const db = dbList[i];
        dbImages.forEach((img) => {
          if (img.version === db.value) {
            dbList[i].meta = { id: img.id };
          }
        });
      }
    }

    const envList = parseText(envs);
    const enverr = validateEnvs(envList);
    if (enverr.length > 0) {
      cancel = true;
      setEnvErrors(enverr);
    } else {
      setEnvErrors([]);
    }

    if (cancel) {
      return;
    }

    dispatch(
      deployProject({
        appId,
        envId: app.environmentId,
        dbs: dbList,
        envs: envList,
        cmds: cmdList,
        existingCmds,
      }),
    );
  };

  useLoaderSuccess(loader, () => {
    navigate(createProjectGitStatusUrl(appId));
  });

  return (
    <div>
      <div className="text-center">
        <h1 className={tokens.type.h1}>Deploy your code</h1>
        <p className="my-4 text-gray-600">
          Review settings and click deploy to finish.
        </p>
      </div>

      <FormNav
        prev={createProjectGitPushUrl(appId)}
        next={createProjectGitStatusUrl(appId)}
      />

      <Box>
        {codeScan.isInitialLoading ? (
          <Loading text="Loading code scan results ..." />
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <h3 className={tokens.type.h3}>Code scan results</h3>
              <Button
                variant="white"
                isLoading={appOps.isLoading}
                onClick={() => appOps.trigger()}
              >
                Refresh
              </Button>
            </div>

            <dl className="mt-2">
              <dd>Last scan</dd>
              <dt>{prettyDateTime(scanOp.updatedAt)}</dt>

              <dd>
                <code>Dockerfile</code> detected?
              </dd>
              <dt>{codeScan.data?.dockerfile_present ? "Yes" : "No"}</dt>

              <dd>
                <code>Procfile</code> detected?
              </dd>
              <dt>{codeScan.data?.procfile_present ? "Yes" : "No"}</dt>

              <dd>
                <code>aptible.yml</code> detected?
              </dd>
              <dt>{codeScan.data?.aptible_yml_present ? "Yes" : "No"}</dt>
            </dl>
          </div>
        )}
      </Box>

      <Box>
        <form onSubmit={onSubmit}>
          <FormGroup
            label="Databases"
            htmlFor="databases"
            feedbackVariant={dbErrors ? "danger" : "info"}
            feedbackMessage={dbErrors.map((e) => e.message).join(". ")}
          >
            <p>
              Add new databases with generated keys or connect to existing
              databases.
            </p>

            <p>
              You can provide as many databases as you need (each line is a
              separate database).
            </p>

            <p>Options include:</p>

            {dbQuery.isInitialLoading ? (
              <Loading text="Loading databases" />
            ) : (
              <ul className="inline-grid grid-cols-3">
                {dbImages.map((d) => {
                  return (
                    <li key={d.id}>
                      {d.type}={d.version}
                    </li>
                  );
                })}
              </ul>
            )}
            <textarea
              name="databases"
              className={tokens.type.textarea}
              value={dbs}
              onChange={(e) => setDbs(e.currentTarget.value)}
            />
          </FormGroup>

          <hr className="my-4" />

          <FormGroup
            label="Environment Variables"
            htmlFor="envs"
            feedbackVariant={envErrors ? "danger" : "info"}
            feedbackMessage={envErrors.map((e) => e.message).join(". ")}
          >
            <p>
              Environment Variables (each line is a separate variable in format:{" "}
              <code>ENV_VAR=VALUE</code>).
            </p>
            <textarea
              name="envs"
              className={tokens.type.textarea}
              value={envs}
              onChange={(e) => setEnvs(e.currentTarget.value)}
            />
          </FormGroup>

          <hr className="my-4" />

          <FormGroup
            label="Service and Commands"
            htmlFor="commands"
            feedbackVariant="info"
          >
            <p>
              Each line is separated by a service command in format:{" "}
              <code>NAME=COMMAND</code>.
            </p>
            <p>
              Prefix <code>NAME</code> with <code>http:</code> if the service
              requires an endpoint. (e.g. <code>http:web=rails server</code>)
            </p>
            <textarea
              name="commands"
              className={tokens.type.textarea}
              value={cmds}
              onChange={(e) => setCmds(e.currentTarget.value)}
            />
          </FormGroup>

          <Button
            type="submit"
            className="w-full mt-4"
            isLoading={loader.isLoading}
          >
            Save & Deploy
          </Button>
        </form>
      </Box>
    </div>
  );
};

interface MiniResource {
  handle: string;
}

const createReadableResourceName = (
  op: DeployOperation,
  resource: MiniResource,
): string => {
  if (op.resourceType === "app" && op.type === "deploy") {
    return "App deployment";
  }

  if (op.resourceType === "database" && op.type === "provision") {
    return `Database provision ${resource.handle}`;
  }

  if (op.resourceType === "app" && op.type === "configure") {
    return "Initial configuration";
  }

  return `${op.resourceType}:${op.type}`;
};

const createReadableStatus = (status: OperationStatus): string => {
  switch (status) {
    case "queued":
      return "Queued";
    case "running":
      return "Pending";
    case "succeeded":
      return "DONE";
    case "failed":
      return "FAILED";
    default:
      return status;
  }
};

const Op = ({
  op,
  resource,
  last = false,
}: {
  op: DeployOperation;
  resource: { handle: string };
  last?: boolean;
}) => {
  const [isOpen, setOpen] = useState(false);
  if (!hasDeployOperation(op)) {
    return null;
  }

  const extra = last ? "" : "border-b border-black-100";
  const status = () => {
    const cns = "font-semibold flex justify-center items-center";

    if (op.status === "succeeded") {
      return (
        <div className={cn(cns, "text-forest")}>
          {createReadableStatus(op.status)}
        </div>
      );
    }

    if (op.status === "failed") {
      return (
        <div className={cn(cns, "text-red")}>
          {createReadableStatus(op.status)}
        </div>
      );
    }

    return (
      <div className={cn(cns, "text-black-500")}>
        {createReadableStatus(op.status)}
      </div>
    );
  };

  return (
    <div className={extra}>
      <div
        className="py-4 flex justify-between items-center cursor-pointer"
        onClick={() => setOpen(!isOpen)}
        onKeyUp={() => setOpen(!isOpen)}
      >
        <div className="font-semibold flex items-center">
          {isOpen ? (
            <IconChevronUp variant="sm" />
          ) : (
            <IconChevronDown variant="sm" />
          )}
          <div>{createReadableResourceName(op, resource)}</div>
        </div>
        {status()}
      </div>
      {isOpen ? (
        <div className="pb-4">
          <LogViewer op={op} />
        </div>
      ) : null}
    </div>
  );
};

const DatabaseStatus = ({
  db,
  last = false,
}: {
  db: DeployDatabase;
  last: boolean;
}) => {
  const provisionOp = useSelector((s: AppState) =>
    selectLatestProvisionOp(s, { resourceId: db.id }),
  );

  return <Op op={provisionOp} resource={db} last={last} />;
};

const AppStatus = ({ app }: { app: DeployApp }) => {
  const configOp = useSelector((s: AppState) =>
    selectLatestConfigureOp(s, { appId: app.id }),
  );
  const deployOp = useSelector((s: AppState) =>
    selectLatestDeployOp(s, { appId: app.id }),
  );

  return (
    <div>
      <Op op={configOp} resource={app} />
      <Op op={deployOp} resource={app} />
    </div>
  );
};

const ProjectStatus = ({
  app,
  dbs,
}: {
  app: DeployApp;
  dbs: DeployDatabase[];
}) => {
  return (
    <div>
      <AppStatus app={app} />

      {dbs.map((db, i) => {
        return (
          <DatabaseStatus key={db.id} db={db} last={i === dbs.length - 1} />
        );
      })}
    </div>
  );
};

const resolveOperationStatuses = (
  stats: { status: OperationStatus; updatedAt: string }[],
): [OperationStatus, string] => {
  // sort the statuses from least recent to most recent
  // this allows us to return-early with the proper time in which the states
  // were first determined
  const statuses = stats.sort(
    (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
  );

  let success = 0;
  for (let i = 0; i < statuses.length; i += 1) {
    const st = statuses[i];
    if (st.status === "queued") {
      return ["queued", st.updatedAt];
    }

    if (st.status === "running") {
      return ["running", st.updatedAt];
    }

    if (st.status === "failed") {
      return ["failed", st.updatedAt];
    }

    if (st.status === "succeeded") {
      success += 1;
    }
  }

  if (success === statuses.length) {
    return [
      "succeeded",
      statuses.at(-1)?.updatedAt || new Date().toISOString(),
    ];
  }

  return ["unknown", new Date().toISOString()];
};

const Pill = ({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon: JSX.Element;
}) => {
  const className = cn(
    "rounded-full border-2",
    "text-sm font-semibold text-black-500",
    "ml-2 px-2 flex justify-between items-center w-fit",
  );
  return (
    <div className={className}>
      {icon}
      <div className="ml-1">{children}</div>
    </div>
  );
};

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
        <IconCogs8Tooth color="#825804" className="mr-1" variant="sm" />
        <div>
          {status === "running" ? "Building" : "Queued"} {date}
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className={cn(className, "text-red border-red-300 bg-red-100")}>
        <IconXMark color="#AD1A1A" variant="sm" />
        <div>Failed {date}</div>
      </div>
    );
  }

  if (status === "succeeded") {
    return (
      <div className={cn(className, "text-forest border-lime-300 bg-lime-100")}>
        <IconCheck color="#00633F" variant="sm" />
        Deployed {date}
      </div>
    );
  }

  return (
    <div
      className={cn(className, "text-indigo border-indigo-300 bg-indigo-100")}
    >
      <IconInfo color="#4361FF" className="mr-1" variant="sm" />
      Unknown {date}
    </div>
  );
};

const LogLine = ({ text }: { text: string }) => {
  const parts = text.split("-- :");
  if (parts.length === 1) {
    return (
      <div>
        <span className="text-lime">{parts[0]}</span>
      </div>
    );
  }

  const leftPart = parts[0]
    .replace("+0000", "")
    .replace(/\d\d\d\d-\d\d-\d\d/, "")
    .trim();
  const rightPart = parts[1].trim();

  const Type = () => {
    if (leftPart.endsWith("ERROR")) {
      return <span className="text-red-300">{rightPart}</span>;
    }

    if (leftPart.endsWith("WARNING")) {
      return <span className="text-orange-300">{rightPart}</span>;
    }

    return <span className="text-lime">{rightPart}</span>;
  };

  return (
    <div className="text-sm">
      <span className="text-black-200">{leftPart}: </span>
      <Type />
    </div>
  );
};

const LogViewer = ({ op }: { op: DeployOperation }) => {
  const wrapper = "font-mono bg-black p-2 rounded-lg text-black-200";
  const action = fetchOperationLogs({ id: op.id });
  const loader = useApi(action);
  const data: string = useSelector((s: AppState) =>
    selectDataById(s, { id: action.payload.key }),
  );
  useEffect(() => {
    if (op.status === "succeeded") {
      loader.trigger();
    }
  }, [op.status]);

  if (op.status === "queued" || op.status === "running") {
    return (
      <div className={wrapper}>
        Operation {op.status}, logs will display after operation completes.
      </div>
    );
  }

  if (loader.isInitialLoading) {
    return <div className={wrapper}>Fetching logs ...</div>;
  }

  if (!data) {
    return <div className={wrapper}>No data found</div>;
  }

  return (
    <div className={wrapper}>
      {data.split("\n").map((line, i) => {
        return <LogLine key={`log-${i}`} text={line} />;
      })}
    </div>
  );
};

const StatusBox = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mt-8">
      <div className="bg-white p-5 shadow rounded-lg border border-black-100">
        {children}
      </div>
    </div>
  );
};

export const CreateProjectGitStatusPage = () => {
  const { appId = "" } = useParams();
  const dispatch = useDispatch();
  useQuery(fetchApp({ id: appId }));
  const app = useSelector((s: AppState) => selectAppById(s, { id: appId }));
  const envId = app.environmentId;
  useQuery(fetchEnvironment({ id: envId }));
  const env = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: envId }),
  );
  useQuery(fetchDatabasesByEnvId({ envId }));
  const dbs = useSelector((s: AppState) =>
    selectDatabasesByEnvId(s, { envId }),
  );
  const deployOp = useSelector((s: AppState) =>
    selectLatestDeployOp(s, { appId: app.id }),
  );
  const provisionOps = useSelector((s: AppState) =>
    selectLatestProvisionOps(s, { resourceIds: dbs.map((db) => db.id) }),
  );

  const ops = [deployOp, ...provisionOps];
  const [status, dateStr] = resolveOperationStatuses(ops);
  const { isInitialLoading } = useQuery(pollEnvOperations({ envId }));

  const cancel = () => dispatch(cancelEnvOperationsPoll());
  useEffect(() => {
    cancel();
    dispatch(pollEnvOperations({ envId }));

    return () => {
      cancel();
    };
  }, [appId, envId]);

  const header = () => {
    if (status === "succeeded") {
      return (
        <div className="text-center">
          <h1 className={tokens.type.h1}>Deployed your Code</h1>
          <p className="my-4 text-gray-600">
            All done! Deployment completed successfully
          </p>
        </div>
      );
    }

    if (status === "failed") {
      return (
        <div className="text-center">
          <h1 className={tokens.type.h1}>Deployment Failed</h1>
          <p className="my-4 text-gray-600">
            Don't worry! Edit your project settings and click Redeploy when
            ready.
          </p>
        </div>
      );
    }

    return (
      <div className="text-center">
        <h1 className={tokens.type.h1}>Deploying your Code</h1>
        <p className="my-4 text-gray-600">Estimated wait time is 5 minutes.</p>
      </div>
    );
  };

  return (
    <div>
      {header()}

      <FormNav prev={createProjectGitSettingsUrl(appId)} />
      <StatusBox>
        <div className="border-b border-black-100 pb-4 ">
          <div className="flex items-center">
            <div>
              <img
                alt="default project logo"
                src="/logo-app.png"
                style={{ width: 32, height: 32 }}
                className="mr-3"
              />
            </div>
            <div>
              <h4 className={tokens.type.h4}>{env.handle}</h4>
              <p className="text-black-500 text-sm">
                https://aptible.com/839583485/dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center mt-1">
            <StatusPill status={status} from={dateStr} />
            <Pill icon={<IconGitBranch color="#595E63" variant="sm" />}>
              {deployOp.gitRef.slice(0, 12)}
            </Pill>
          </div>
        </div>

        {isInitialLoading ? (
          <Loading text="Loading resources ..." />
        ) : (
          <ProjectStatus app={app} dbs={dbs} />
        )}
      </StatusBox>

      {status === "succeeded" ? (
        <StatusBox>
          <h3 className={tokens.type.h3}>How to deploy changes</h3>
          <p className="mt-4 mb-2">
            Make changes to your local git repo, commit those changes, and then
            push your changes to the Aptible git server:
          </p>
          <PreCode>git push aptible main</PreCode>
          <ButtonLink to={appDetailUrl(appId)} className="mt-4">
            View Project <IconChevronRight />
          </ButtonLink>
        </StatusBox>
      ) : null}
    </div>
  );
};
