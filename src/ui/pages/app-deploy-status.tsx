import { timeBetween } from "@app/date";
import {
  createEndpointOperation,
  fetchAllEnvOps,
  fetchApp,
  fetchConfiguration,
  fetchDatabasesByEnvId,
  fetchEndpointsByAppId,
  fetchEnvironmentById,
  getEndpointUrl,
  pollEnvOperations,
  provisionEndpoint,
  selectAppById,
  selectAppConfigById,
  selectDatabasesByEnvId,
  selectEndpointsByAppId,
  selectEnvironmentById,
  selectServiceById,
  selectServicesByAppId,
  serviceCommandText,
} from "@app/deploy";
import {
  createReadableStatus,
  hasDeployOperation,
  selectLatestConfigureOp,
  selectLatestDeployOp,
  selectLatestProvisionOp,
} from "@app/deploy";
import {
  deployProject,
  getDbEnvTemplateValue,
  redeployApp,
} from "@app/projects";
import { useDispatch, useLoader, useQuery, useSelector } from "@app/react";
import {
  appDeployConfigureUrl,
  appDetailUrl,
  appEndpointsUrl,
} from "@app/routes";
import { schema } from "@app/schema";
import type {
  DeployApp,
  DeployDatabase,
  DeployEndpoint,
  DeployOperation,
  OperationStatus,
} from "@app/types";
import cn from "classnames";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { useEnvOpsPoller, useLatestCodeResults, useProjectOps } from "../hooks";
import { AppSidebarLayout } from "../layouts";
import {
  Banner,
  BannerMessages,
  Button,
  ButtonLink,
  Code,
  CopyTextButton,
  CreateAppEndpointSelector,
  ExternalLink,
  Group,
  IconArrowRight,
  IconChevronDown,
  IconChevronRight,
  IconInfo,
  Loading,
  LogViewer,
  PreCode,
  ProgressProject,
  ResourceGroupBox,
  StatusBox,
  StatusPill,
  Tooltip,
  listToInvertedTextColor,
  resolveOperationStatuses,
  tokens,
} from "../shared";

export const AppDeployStatusPage = () => {
  const { appId = "" } = useParams();
  const dispatch = useDispatch();
  const appQuery = useQuery(fetchApp({ id: appId }));
  const app = useSelector((s) => selectAppById(s, { id: appId }));
  const envId = app.environmentId;
  const configId = app.currentConfigurationId;
  const services = useSelector((s) => selectServicesByAppId(s, { appId }));

  const dbs = useDbsInAppConfig({
    envId,
    configId,
  });

  useQuery(fetchEnvironmentById({ id: envId }));
  const env = useSelector((s) => selectEnvironmentById(s, { id: envId }));

  const deployOp = useSelector((s) =>
    selectLatestDeployOp(s, { appId: app.id }),
  );
  const endpointQuery = useQuery(fetchEndpointsByAppId({ appId }));
  const vhosts = useSelector((s) => selectEndpointsByAppId(s, { appId }));
  useEnvOpsPoller({ envId, appId });
  const { ops } = useProjectOps({
    envId,
    appId,
  });

  const [status, dateStr] = resolveOperationStatuses(ops);
  useQuery(fetchAllEnvOps({ envId }));
  // we only need to poll for the latest operations
  const { isInitialLoading } = useQuery(pollEnvOperations({ envId }));
  const { gitRef } = useLatestCodeResults(appId);

  const redeployLoader = useSelector((s) =>
    schema.loaders.selectById(s, { id: `${redeployApp}` }),
  );
  const deployProjectLoader = useSelector((s) =>
    schema.loaders.selectById(s, { id: `${deployProject}` }),
  );

  const redeploy = (force: boolean) => {
    if (redeployLoader.isLoading) {
      return;
    }
    dispatch(
      redeployApp({
        appId,
        envId: env.id,
        gitRef,
        force,
      }),
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
        <div className="text-center mt-10">
          <h1 className={tokens.type.h1}>Deployed your Code</h1>
          <p className="my-4 text-gray-600">
            All done! Deployment completed successfully.
          </p>
        </div>
      );
    }

    if (status === "failed") {
      return (
        <div className="text-center mt-10">
          <h1 className={tokens.type.h1}>Deployment Failed</h1>
          <p className="my-4 text-gray-600">
            Don't worry! Edit your configuration or push your code to redeploy.
          </p>
        </div>
      );
    }

    return (
      <div className="text-center mt-10">
        <h1 className={tokens.type.h1}>Deploying your Code</h1>
        <p className="my-4 text-gray-600">Deployment is in progress...</p>
      </div>
    );
  };

  return (
    <AppSidebarLayout className="mb-8">
      {header()}

      <ProgressProject cur={4} prev={appDeployConfigureUrl(appId)} />

      <div className="w-full max-w-[700px] mx-auto">
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

        {hasDeployOperation(deployOp) ? null : (
          <StatusBox>
            <WaitForGitPush>
              <Group size="sm">
                <Banner variant="warning">
                  If you require databases, please wait to push your code until
                  databases are provisioned.
                </Banner>

                <div>
                  <div className="flex flex-row items-center">
                    <h4 className={tokens.type.h4}>Deploy from GitHub</h4>
                    <Tooltip
                      fluid
                      text="If your local branch is named master, push to master"
                    >
                      <IconInfo
                        className="opacity-50 hover:opacity-100 ml-1"
                        variant="sm"
                      />
                    </Tooltip>
                  </div>
                  <PreCode
                    segments={listToInvertedTextColor([
                      "git push origin",
                      "main",
                    ])}
                    allowCopy
                  />
                </div>

                <p className="font-bold">- OR -</p>

                <div>
                  <div className="flex flex-row items-center">
                    <h4 className={tokens.type.h4}>Deploy with Git Push</h4>
                    <Tooltip
                      fluid
                      text="If your local branch is named master, push to master"
                    >
                      <IconInfo
                        className="opacity-50 hover:opacity-100 ml-1"
                        variant="sm"
                      />
                    </Tooltip>
                  </div>
                  <Group size="sm">
                    <PreCode
                      segments={listToInvertedTextColor([
                        "git remote add aptible",
                        app.gitRepo,
                      ])}
                      allowCopy
                    />
                    <PreCode
                      segments={listToInvertedTextColor([
                        "git push aptible",
                        "main",
                      ])}
                      allowCopy
                    />
                  </Group>
                </div>
              </Group>
            </WaitForGitPush>
          </StatusBox>
        )}

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

        {services.length > 0 && vhosts.length > 0 ? (
          <StatusBox>
            <h4 className={tokens.type.h4}>Current Endpoints</h4>
            {vhosts.map((vhost) => (
              <VhostRow key={vhost.id} vhost={vhost} />
            ))}
            <div className="flex gap-3">
              <Link to={appEndpointsUrl(app.id)}>Manage Endpoints</Link>
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
            {services.length ? (
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
          <ButtonLink to={appDetailUrl(app.id)}>
            View App <IconArrowRight variant="sm" className="ml-2" />
          </ButtonLink>

          <ButtonLink
            to={appDeployConfigureUrl(appId)}
            variant="white"
            className="mt-2"
          >
            Edit Configuration
          </ButtonLink>
        </StatusBox>
      </div>
      <div className="bg-[url('/background-pattern-v2.png')] bg-no-repeat bg-cover bg-center absolute w-full h-full top-0 left-0 z-[-999]" />
    </AppSidebarLayout>
  );
};

function WaitForGitPush({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div>
        <h4 className={tokens.type.h4}>Push your code to Aptible or GitHub</h4>
        <div>{children}</div>
      </div>

      <hr className="my-4" />

      <Banner variant="info">
        Waiting on your git push to deploy your App...
      </Banner>
    </>
  );
}

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
            {isOpen ? <IconChevronDown /> : <IconChevronRight />}
            <div>{createReadableResourceName(op, resource.handle)}</div>
          </div>
          <div className="flex items-center ml-2">
            <div className="mr-2 text-xs text-black-300">ID: {op.id}</div>
            <div title={`aptible operation:logs ${op.id}`}>
              <CopyTextButton text={`aptible operation:logs ${op.id}`} />
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
  const provisionOp = useSelector((s) =>
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
  const provisionOp = useSelector((s) =>
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
  const configOp = useSelector((s) =>
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
  const deployOp = useSelector((s) =>
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
  const vhosts = useSelector((s) =>
    selectEndpointsByAppId(s, { appId: app.id }),
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
  const service = useSelector((s) =>
    selectServiceById(s, { id: vhost.serviceId }),
  );
  const cmd = serviceCommandText(service);
  return (
    <div>
      <div className="gap-1 py-2">
        <p className="font-semibold">{getEndpointUrl(vhost)}</p>
        <p className="text-gray-500">Service: {service.processType}</p>
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
  const appConfig = useSelector((s) =>
    selectAppConfigById(s, { id: configId }),
  );
  useQuery(fetchDatabasesByEnvId({ envId }));
  const dbs = useSelector((s) => selectDatabasesByEnvId(s, { envId }));

  const envValues = Object.values(appConfig.env);
  return dbs.filter((db) => {
    const hasPlaceholder = envValues.includes(getDbEnvTemplateValue(db.handle));
    const hasConnectionUrl = envValues.includes(db.connectionUrl);
    return hasPlaceholder || hasConnectionUrl;
  });
};
