import cn from "classnames";
import { SyntheticEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router";

import { timeBetween } from "@app/date";
import {
  cancelAppOpsPoll,
  createEndpointOperation,
  fetchAllApps,
  fetchApp,
  fetchConfiguration,
  fetchDatabasesByEnvId,
  fetchEndpointsByAppId,
  fetchEnvironmentById,
  hasDeployApp,
  hasDeployEnvironment,
  pollAppOperations,
  provisionEndpoint,
  selectAppById,
  selectAppConfigById,
  selectDatabasesByEnvId,
  selectEndpointsByAppId,
  selectEnvironmentById,
  selectFirstAppByEnvId,
  selectServiceById,
  serviceCommandText,
} from "@app/deploy";
import {
  createReadableStatus,
  hasDeployOperation,
  pollEnvAllOperations,
  selectLatestConfigureOp,
  selectLatestDeployOp,
  selectLatestProvisionOp,
  selectLatestScanOp,
} from "@app/deploy";
import { selectLegacyDashboardUrl, selectOrigin } from "@app/env";
import { useCache, useLoader, useQuery } from "@app/fx";
import { batchActions, resetLoaderById, selectLoaderById } from "@app/fx";
import {
  deployProject,
  getDbEnvTemplateValue,
  redeployApp,
} from "@app/projects";
import {
  appDetailUrl,
  createProjectAddKeyUrl,
  createProjectAddNameUrl,
  createProjectGitPushUrl,
  createProjectGitSettingsUrl,
  createProjectGitStatusUrl,
} from "@app/routes";
import { fetchSSHKeys } from "@app/ssh-keys";
import {
  AppState,
  DeployApp,
  DeployDatabase,
  DeployEndpoint,
  DeployOperation,
  HalEmbedded,
  OperationStatus,
} from "@app/types";
import { selectCurrentUser } from "@app/users";

import { useSearchParams } from "react-router-dom";
import { useEnvOpsPoller, useLatestCodeResults, useProjectOps } from "../hooks";
import {
  AddSSHKeyForm,
  Banner,
  BannerMessages,
  Box,
  Button,
  ButtonLink,
  ButtonLinkExternal,
  Code,
  CreateAppEndpointSelector,
  ErrorResources,
  ExternalLink,
  FeedbackForm,
  IconArrowRight,
  IconChevronDown,
  IconChevronUp,
  IconCopy,
  Loading,
  LogViewer,
  PreCode,
  ProgressProject,
  ResourceGroupBox,
  Select,
  SelectOption,
  StatusBox,
  StatusPill,
  listToInvertedTextColor,
  resolveOperationStatuses,
  tokens,
} from "../shared";

export const CreateProjectFromAccountSetupPage = () => {
  const { envId = "" } = useParams();
  const dispatch = useDispatch();
  const env = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: envId }),
  );
  const navigate = useNavigate();
  // just guessing which app to use to detect current status
  const app = useSelector((s: AppState) => selectFirstAppByEnvId(s, { envId }));
  const { appOps, scanOp } = useLatestCodeResults(app.id);
  const deployOp = useSelector((s: AppState) =>
    selectLatestDeployOp(s, { appId: app.id }),
  );

  useEffect(() => {
    dispatch(fetchAllApps());
  }, []);

  useEffect(() => {
    dispatch(fetchEnvironmentById({ id: envId }));
  }, [envId]);

  useEffect(() => {
    if (!hasDeployEnvironment(env) || !hasDeployApp(app)) {
      return;
    }
    if (appOps.lastSuccess === 0) {
      return;
    }

    if (hasDeployOperation(deployOp)) {
      navigate(createProjectGitStatusUrl(app.id));
    } else if (hasDeployOperation(scanOp) && scanOp.status === "succeeded") {
      navigate(createProjectGitSettingsUrl(app.id));
    } else {
      navigate(createProjectGitPushUrl(app.id));
    }
  }, [env.id, app.id, appOps, deployOp, scanOp]);

  return <Loading text={`Detecting app ${app.handle} status...`} />;
};

export const CreateProjectFromAppSetupPage = () => {
  const { appId = "" } = useParams();
  const dispatch = useDispatch();
  const app = useSelector((s: AppState) => selectAppById(s, { id: appId }));
  const env = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: app.environmentId }),
  );
  const navigate = useNavigate();
  const { appOps, scanOp } = useLatestCodeResults(appId);
  const deployOp = useSelector((s: AppState) =>
    selectLatestDeployOp(s, { appId }),
  );

  useEffect(() => {
    dispatch(fetchApp({ id: appId }));
  }, [appId]);

  useEffect(() => {
    dispatch(fetchEnvironmentById({ id: app.environmentId }));
  }, [app]);

  useEffect(() => {
    if (!hasDeployEnvironment(env) || !hasDeployApp(app)) {
      return;
    }
    if (appOps.lastSuccess === 0) {
      return;
    }

    if (hasDeployOperation(deployOp)) {
      navigate(createProjectGitStatusUrl(app.id), { replace: true });
    } else if (hasDeployOperation(scanOp) && scanOp.status === "succeeded") {
      navigate(createProjectGitSettingsUrl(app.id), { replace: true });
    } else {
      navigate(createProjectGitPushUrl(app.id), { replace: true });
    }
  }, [env.id, app.id, appOps, deployOp, scanOp]);

  return <Loading text={`Detecting app ${app.handle} status...`} />;
};

export const CreateProjectGitPage = () => {
  const [params] = useSearchParams();
  const stackId = params.get("stack_id") || "";
  const envId = params.get("environment_id") || "";
  const queryParam = `stack_id=${stackId}&environment_id=${envId}`;
  const user = useSelector(selectCurrentUser);
  const query = useCache<HalEmbedded<{ ssh_keys: any[] }>>(
    fetchSSHKeys({ userId: user.id }),
  );

  if (query.isInitialLoading) return <Loading />;
  if (query.isError) return <ErrorResources message={query.message} />;
  if (!query.data) return <div>Could not fetch SSH keys</div>;

  if (query.data._embedded.ssh_keys.length === 0) {
    return <Navigate to={createProjectAddKeyUrl(queryParam)} replace />;
  }

  return <Navigate to={createProjectAddNameUrl(queryParam)} replace />;
};

export const CreateProjectAddKeyPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const stackId = params.get("stack_id") || "";
  const envId = params.get("environment_id") || "";
  const queryParam = `stack_id=${stackId}&environment_id=${envId}`;
  const url = createProjectAddNameUrl(queryParam);
  const onSuccess = () => navigate(url);

  return (
    <div>
      <div className="text-center">
        <h1 className={tokens.type.h1}>Add your SSH Key</h1>
        <p className="my-4 text-gray-600">
          Add your SSH key to push code into Aptible.
        </p>
      </div>

      <ProgressProject cur={-1} next={url} />

      <Box>
        <AddSSHKeyForm onSuccess={onSuccess} />
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

interface StarterOption extends SelectOption {
  query: { [key: string]: string[] };
  repo: string;
}

const starterTemplateOptions: StarterOption[] = [
  { label: "Custom Code", value: "none", query: {}, repo: "" },
  {
    label: "Ruby on Rails v7 Template",
    value: "git@github.com:aptible/template-rails.git",
    repo: "template-rails",
    query: {
      dbs: ["database_url:postgresql:14", "redis_url:redis:3.0"],
      envs: ["production_secret_key"],
    },
  },
  {
    label: "Django v4 Template",
    value: "git@github.com:aptible/template-django.git",
    repo: "template-django",
    query: { dbs: ["database_url:postgresql:14"], envs: ["secret_key"] },
  },
  {
    label: "Express v4 Template",
    value: "git@github.com:aptible/template-express.git",
    repo: "template-express",
    query: { dbs: ["database_url:postgresql:14"] },
  },
  {
    label: "Laravel v10 Template",
    value: "git@github.com:aptible/template-laravel.git",
    repo: "template-laravel",
    query: {
      dbs: ["database_url:postgresql:14"],
      envs: ["db_connection:aptible", "app_key"],
    },
  },
  {
    label: "Deploy Demo App Template",
    value: "git@github.com:aptible/deploy-demo-app.git",
    repo: "deploy-demo-app",
    query: {
      dbs: ["database_url:postgresql:14", "redis_url:redis:3.0"],
    },
  },
];

export const CreateProjectGitPushPage = () => {
  const navigate = useNavigate();
  const { appId = "" } = useParams();

  const [starter, setStarter] = useState<StarterOption>();
  useQuery(fetchApp({ id: appId }));
  const app = useSelector((s: AppState) => selectAppById(s, { id: appId }));
  usePollAppOperations(appId);
  const scanOp = useSelector((s: AppState) => selectLatestScanOp(s, { appId }));
  const deployOp = useSelector((s: AppState) =>
    selectLatestDeployOp(s, { appId }),
  );

  let query = "";
  if (starter) {
    const queryRaw: Record<string, string> = {};
    Object.keys(starter.query).forEach((key) => {
      queryRaw[key] = starter.query[key].join(",");
    });
    query = new URLSearchParams(queryRaw).toString();
  }

  useEffect(() => {
    if (scanOp && scanOp.status === "succeeded") {
      navigate(createProjectGitSettingsUrl(appId, query));
    }
  }, [scanOp]);

  return (
    <div>
      <div className="text-center">
        <h1 className={tokens.type.h1}>Push your code to Aptible</h1>
        <p className="my-4 text-gray-600">
          We will look for a Dockerfile or generate one for you to deploy your
          app.
        </p>
      </div>

      <ProgressProject
        cur={2}
        prev={createProjectAddKeyUrl()}
        next={createProjectGitSettingsUrl(appId, query)}
      />

      <Box>
        <div>
          <h4 className={tokens.type.h4}>
            Deploy Custom Code or Starter Template
          </h4>
          <div className="text-black-500 mb-1 mr-2">
            Launch your existing app with Custom Code, or learn how Aptible
            works with a Starter Template.
          </div>
          <div className="my-2">
            <Select
              options={starterTemplateOptions}
              value={starter?.value}
              onSelect={(val) => {
                setStarter(val as any);
              }}
              className="w-full"
            />
          </div>
          {starter && starter.value !== "none" ? (
            <div>
              What's inside this template?{" "}
              <ExternalLink
                href={`https://github.com/aptible/${starter.repo}`}
                variant="info"
              >
                View Source Code on GitHub
              </ExternalLink>
            </div>
          ) : null}
        </div>

        {starter && starter.value !== "none" ? (
          <>
            <div className="mt-4">
              <h4 className={tokens.type.h4}>Clone Template</h4>
              <PreCode
                segments={listToInvertedTextColor(["git clone", starter.value])}
                allowCopy
              />
            </div>

            <div className="mt-4">
              <h4 className={tokens.type.h4}>Select Template</h4>
              <PreCode
                segments={listToInvertedTextColor(["cd", starter.repo])}
                allowCopy
              />
            </div>
          </>
        ) : null}

        <div className="mt-4">
          <h4 className={tokens.type.h4}>Add Aptible's Git Server</h4>
          <PreCode
            segments={listToInvertedTextColor([
              "git remote add aptible",
              app.gitRepo,
            ])}
            allowCopy
          />
        </div>

        <div className="mt-4">
          <h4 className={tokens.type.h4}>Push your code to our scan branch</h4>
          <PreCode
            segments={listToInvertedTextColor([
              "git push aptible",
              "main:aptible-scan",
            ])}
            allowCopy
          />
        </div>

        <hr className="my-4" />

        {hasDeployOperation(deployOp) ? (
          <div className="text-black-900 mb-4">
            We detected an app deployment, did you push to the{" "}
            <span className="bg-gray-200 font-mono text-black pt-0.5 pb-1 px-1.5 rounded-md text-[0.9rem]">
              aptible-scan
            </span>{" "}
            branch?
          </div>
        ) : null}

        {hasDeployOperation(scanOp) ? (
          <OpResult op={scanOp} />
        ) : (
          <Banner variant="info">
            Waiting on your git push to continue...
          </Banner>
        )}
      </Box>
    </div>
  );
};

const usePollAppOperations = (appId: string) => {
  const dispatch = useDispatch();
  const appOps = useQuery(pollAppOperations({ id: appId }));
  useEffect(() => {
    const cancel = () => dispatch(cancelAppOpsPoll());
    cancel();
    dispatch(pollAppOperations({ id: appId }));
    return () => {
      cancel();
    };
  }, [appId]);

  return appOps;
};

const createReadableResourceName = (
  op: DeployOperation,
  handle: string,
): string => {
  if (op.resourceType === "app" && op.type === "deploy") {
    return "App deployment";
  }

  if (op.resourceType === "database" && op.type === "provision") {
    return `Database provision ${handle}`;
  }

  if (op.resourceType === "app" && op.type === "configure") {
    return "Initial configuration";
  }

  if (op.resourceType === "vhost" && op.type === "provision") {
    return "HTTPS endpoint provision";
  }

  return `${op.resourceType}:${op.type}`;
};

const Op = ({
  op,
  resource,
  retry,
  alwaysRetry = false,
  status,
}: {
  op: DeployOperation;
  resource: { handle: string };
  retry?: () => void;
  alwaysRetry?: boolean;
  status: OperationStatus;
}) => {
  const [runningTime, setRunningTime] = useState<string>("");
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    if (["succeeded", "failed"].includes(op.status)) return;

    const interval = setInterval(() => {
      setRunningTime(
        timeBetween({
          startDate: op.createdAt,
          endDate: new Date().toString(),
        }),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [op.status]);

  if (!hasDeployOperation(op)) {
    return null;
  }

  const handleCopy = (e: SyntheticEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
  };

  const extra = "border-b border-black-100";
  const statusView = () => {
    const cns = "font-semibold flex justify-center items-center";
    const completedTime = timeBetween({
      startDate: op.createdAt,
      endDate: op.updatedAt,
    });

    if (op.status === "succeeded") {
      return (
        <div className={cn(cns, "text-forest")}>
          {retry && alwaysRetry && status === "succeeded" ? (
            <Button
              size="sm"
              variant="white"
              onClick={(e) => {
                e.stopPropagation();
                retry();
              }}
              className="mr-2"
            >
              Re-run
            </Button>
          ) : null}
          <span className={`mx-2 ${tokens.type["small lighter"]}`}>
            {completedTime}{" "}
          </span>
          {createReadableStatus(op.status)}
        </div>
      );
    }

    if (op.status === "failed") {
      return (
        <div className={cn(cns, "text-red")}>
          {retry ? (
            <Button
              size="sm"
              variant="white"
              onClick={(e) => {
                e.stopPropagation();
                retry();
              }}
              className="mr-2"
            >
              Re-run
            </Button>
          ) : null}
          <span className={`mx-2 ${tokens.type["small lighter"]}`}>
            {completedTime}{" "}
          </span>
          {createReadableStatus(op.status)}
        </div>
      );
    }

    return (
      <>
        <div className={cn(cns, "text-black-500")}>
          {runningTime && (
            <span className={`mx-2 ${tokens.type["small lighter"]}`}>
              {" "}
              {runningTime}
            </span>
          )}
          {createReadableStatus(op.status)}
        </div>
      </>
    );
  };

  return (
    <div className={extra}>
      <div className="py-4 flex justify-between items-center">
        <div className="flex flex-1">
          <div
            className="font-semibold flex items-center cursor-pointer"
            onClick={() => setOpen(!isOpen)}
            onKeyUp={() => setOpen(!isOpen)}
          >
            {isOpen ? (
              <IconChevronUp variant="sm" />
            ) : (
              <IconChevronDown variant="sm" />
            )}
            <div>{createReadableResourceName(op, resource.handle)}</div>
          </div>
          <div className="flex items-center ml-2">
            <div className="mr-2 text-xs text-black-300">ID: {op.id}</div>
            <div title={`aptible operation:logs ${op.id}`}>
              <IconCopy
                variant="sm"
                color="#888C90"
                className="cursor-pointer"
                onClick={(e) =>
                  handleCopy(e, `aptible operation:logs ${op.id}`)
                }
              />
            </div>
          </div>
        </div>
        {statusView()}
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
  status,
}: {
  db: Pick<DeployDatabase, "id" | "handle">;
  status: OperationStatus;
}) => {
  const provisionOp = useSelector((s: AppState) =>
    selectLatestProvisionOp(s, { resourceId: db.id, resourceType: "database" }),
  );

  return <Op op={provisionOp} resource={db} status={status} />;
};

const EndpointStatus = ({
  endpoint,
  status,
}: {
  endpoint: Pick<DeployEndpoint, "id">;
  status: OperationStatus;
}) => {
  const dispatch = useDispatch();
  const provisionOp = useSelector((s: AppState) =>
    selectLatestProvisionOp(s, {
      resourceId: endpoint.id,
      resourceType: "vhost",
    }),
  );
  const retry = () => {
    dispatch(
      createEndpointOperation({
        type: "provision",
        endpointId: endpoint.id,
      }),
    );
  };

  return (
    <Op
      op={provisionOp}
      resource={{ handle: "" }}
      retry={retry}
      status={status}
    />
  );
};

const AppConfigStatus = ({
  app,
  retry,
  status,
}: {
  app: Pick<DeployApp, "id" | "handle" | "environmentId">;
  retry: () => void;
  status: OperationStatus;
}) => {
  const configOp = useSelector((s: AppState) =>
    selectLatestConfigureOp(s, { appId: app.id }),
  );

  return (
    <Op
      op={configOp}
      resource={app}
      retry={retry}
      alwaysRetry
      status={status}
    />
  );
};

const AppDeployStatus = ({
  app,
  status,
  retry,
}: {
  app: Pick<DeployApp, "id" | "handle" | "environmentId">;
  status: OperationStatus;
  retry: () => void;
}) => {
  const deployOp = useSelector((s: AppState) =>
    selectLatestDeployOp(s, { appId: app.id }),
  );

  return (
    <Op
      op={deployOp}
      resource={app}
      retry={retry}
      alwaysRetry
      status={status}
    />
  );
};

const ProjectStatus = ({
  app,
  dbs,
  endpoints,
  gitRef,
  status,
}: {
  app: DeployApp;
  dbs: DeployDatabase[];
  endpoints: DeployEndpoint[];
  gitRef: string;
  status: OperationStatus;
}) => {
  const dispatch = useDispatch();
  const retry = () => {
    dispatch(
      redeployApp({
        appId: app.id,
        envId: app.environmentId,
        gitRef,
        force: true,
      }),
    );
  };

  return (
    <div>
      <AppConfigStatus app={app} status={status} retry={retry} />

      {dbs.map((db) => {
        return <DatabaseStatus key={db.id} db={db} status={status} />;
      })}

      <AppDeployStatus app={app} status={status} retry={retry} />

      {endpoints.map((vhost) => {
        return (
          <EndpointStatus key={vhost.id} endpoint={vhost} status={status} />
        );
      })}
    </div>
  );
};

const CreateEndpointForm = ({ app }: { app: DeployApp }) => {
  const dispatch = useDispatch();
  const [curServiceId, setServiceId] = useState("");
  const hasSelected = !!curServiceId;
  const vhosts = useSelector((s: AppState) =>
    selectEndpointsByAppId(s, { id: app.id }),
  );
  const action = provisionEndpoint({
    type: "default",
    serviceId: curServiceId,
    internal: false,
    ipAllowlist: [],
    envId: app.environmentId,
  });
  const loader = useLoader(action);
  const onClick = () => {
    dispatch(action);
  };

  useEffect(() => {
    dispatch(fetchApp({ id: app.id }));
  }, [app.id]);

  return (
    <div>
      <CreateAppEndpointSelector
        app={app}
        selectedId={curServiceId}
        onSelect={(id: string) => setServiceId(id)}
        disabled={(service) =>
          !!vhosts.find((vhost) => vhost.serviceId === service.id)
        }
      />
      <Button
        onClick={onClick}
        isLoading={loader.isLoading}
        disabled={!hasSelected}
        className="mt-4"
      >
        Create Endpoint
      </Button>

      <BannerMessages {...loader} className="mt-2" />
    </div>
  );
};

const VhostRow = ({ vhost }: { vhost: DeployEndpoint }) => {
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: vhost.serviceId }),
  );
  const cmd = serviceCommandText(service);
  return (
    <div>
      <div className="gap-1 py-2">
        <p className="font-semibold">{vhost.virtualDomain}</p>
        <p className="text-gray-500">Service: {service.handle}</p>
        <p className="text-gray-500">
          Command: <Code>{cmd}</Code>
        </p>
      </div>
      <hr className="my-2" />
    </div>
  );
};

const useDbsInAppConfig = ({
  envId,
  configId,
}: { envId: string; configId: string }) => {
  useQuery(fetchConfiguration({ id: configId }));
  const appConfig = useSelector((s: AppState) =>
    selectAppConfigById(s, { id: configId }),
  );
  useQuery(fetchDatabasesByEnvId({ envId }));
  const dbs = useSelector((s: AppState) =>
    selectDatabasesByEnvId(s, { envId }),
  );

  const envValues = Object.values(appConfig.env);
  return dbs.filter((db) => {
    const hasPlaceholder = envValues.includes(getDbEnvTemplateValue(db.handle));
    const hasConnectionUrl = envValues.includes(db.connectionUrl);
    return hasPlaceholder || hasConnectionUrl;
  });
};

export const CreateProjectGitStatusPage = () => {
  const { appId = "" } = useParams();
  const dispatch = useDispatch();
  const origin = useSelector(selectOrigin);
  const legacyUrl = useSelector(selectLegacyDashboardUrl);
  const appQuery = useQuery(fetchApp({ id: appId }));
  const app = useSelector((s: AppState) => selectAppById(s, { id: appId }));
  const envId = app.environmentId;
  const configId = app.currentConfigurationId;

  const dbs = useDbsInAppConfig({
    envId,
    configId,
  });

  useQuery(fetchEnvironmentById({ id: envId }));
  const env = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: envId }),
  );

  const deployOp = useSelector((s: AppState) =>
    selectLatestDeployOp(s, { appId: app.id }),
  );
  const endpointQuery = useQuery(fetchEndpointsByAppId({ appId }));
  const vhosts = useSelector((s: AppState) =>
    selectEndpointsByAppId(s, { id: appId }),
  );
  useEnvOpsPoller({ envId, appId });
  const { ops } = useProjectOps({
    envId,
    appId,
  });

  const [status, dateStr] = resolveOperationStatuses(ops);
  const { isInitialLoading } = useQuery(pollEnvAllOperations({ envId }));

  const { scanOp } = useLatestCodeResults(appId);

  const redeployLoader = useSelector((s: AppState) =>
    selectLoaderById(s, { id: `${redeployApp}` }),
  );
  const deployProjectLoader = useSelector((s: AppState) =>
    selectLoaderById(s, { id: `${deployProject}` }),
  );

  const gitRef = scanOp.gitRef || "main";
  const redeploy = (force: boolean) => {
    if (redeployLoader.isLoading) {
      return;
    }
    dispatch(
      batchActions([
        resetLoaderById(`${deployProject}`),
        redeployApp({
          appId,
          envId: env.id,
          gitRef,
          force,
        }),
      ]),
    );
  };

  // when the status is success we need to refetch the app and endpoints
  // so we can grab the services and show them to the user for creating
  // an endpoint.
  useEffect(() => {
    if (status !== "succeeded") return;
    appQuery.trigger();
    endpointQuery.trigger();
  }, [status]);

  const header = () => {
    if (status === "succeeded") {
      return (
        <div className="text-center">
          <h1 className={tokens.type.h1}>Deployed your Code</h1>
          <p className="my-4 text-gray-600">
            All done! Deployment completed successfully.
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
        <p className="my-4 text-gray-600">Deployment is in progress...</p>
      </div>
    );
  };

  const viewProject = () => {
    return origin === "app" ? (
      <ButtonLinkExternal
        target="_blank"
        href={`${legacyUrl}/accounts/${envId}/apps`}
        className="mt-4"
      >
        View Environment <IconArrowRight variant="sm" className="ml-2" />
      </ButtonLinkExternal>
    ) : (
      <ButtonLink to={appDetailUrl(appId)} className="mt-4 mb-2">
        View Environment <IconArrowRight variant="sm" className="ml-2" />
      </ButtonLink>
    );
  };

  return (
    <div className="mb-8">
      {header()}

      <ProgressProject cur={4} prev={createProjectGitSettingsUrl(appId)} />

      <ResourceGroupBox
        handle={app.handle}
        appId={appId}
        status={<StatusPill status={status} from={dateStr} />}
      >
        {isInitialLoading ? (
          <Loading text="Loading resources..." />
        ) : (
          <ProjectStatus
            status={status}
            app={app}
            dbs={dbs}
            endpoints={vhosts}
            gitRef={gitRef}
          />
        )}
      </ResourceGroupBox>

      {deployProjectLoader.isError ? (
        <StatusBox>
          <h4 className={tokens.type.h4}>Error!</h4>
          <BannerMessages {...deployProjectLoader} />
        </StatusBox>
      ) : null}

      {redeployLoader.isError ? (
        <StatusBox>
          <h4 className={tokens.type.h4}>Error!</h4>
          <BannerMessages {...redeployLoader} />
        </StatusBox>
      ) : null}

      {app.serviceIds.length > 0 && vhosts.length > 0 ? (
        <StatusBox>
          <h4 className={tokens.type.h4}>Current Endpoints</h4>
          {vhosts.map((vhost) => (
            <VhostRow key={vhost.id} vhost={vhost} />
          ))}
          <div className="flex gap-3">
            <ExternalLink
              href={`${legacyUrl}/apps/${app.id}/vhosts`}
              variant="info"
            >
              Manage Endpoints
            </ExternalLink>
            <ExternalLink
              href="https://www.aptible.com/docs/endpoints"
              variant="info"
            >
              View Docs
            </ExternalLink>
          </div>
        </StatusBox>
      ) : (
        <StatusBox>
          <h4 className={tokens.type.h4}>
            Which service needs an{" "}
            <ExternalLink
              href="https://www.aptible.com/docs/endpoints"
              variant="info"
            >
              Endpoint
            </ExternalLink>
            ?
          </h4>
          {app.serviceIds.length ? (
            <div className="mt-2">
              <CreateEndpointForm app={app} />
            </div>
          ) : (
            <p className="text-black-500">
              Your services will appear here shortly...
            </p>
          )}
        </StatusBox>
      )}

      {deployOp.status === "failed" || redeployLoader.isLoading ? (
        <StatusBox>
          <h4 className={tokens.type.h4}>Deployment Failed</h4>
          <p className="text-black-500">
            • Check the error logs and make changes, then push your code to
            redeploy.
          </p>
          <p className="text-black-500 mb-4">
            • Or, you can click Redeploy to try again without making any
            changes.
          </p>

          <Button
            onClick={() => redeploy(true)}
            isLoading={redeployLoader.isLoading}
          >
            Redeploy
          </Button>
        </StatusBox>
      ) : null}

      <StatusBox>
        <h4 className={tokens.type.h4}>How to deploy changes</h4>
        <p className="mb-2 text-black-500">
          Commit changes to your local git repo and push to the Aptible git
          server.
        </p>
        <PreCode
          segments={listToInvertedTextColor(["git push aptible", "main"])}
          allowCopy
        />
        <hr />

        {viewProject()}

        <ButtonLink
          to={createProjectGitSettingsUrl(appId)}
          variant="white"
          className="mt-2"
        >
          Edit Configuration
        </ButtonLink>
      </StatusBox>
      <FeedbackForm
        feedbackEventName="feedback.survey.post_deploy_feedback"
        description="What would you like to change about this deployment experience?"
      />
    </div>
  );
};
