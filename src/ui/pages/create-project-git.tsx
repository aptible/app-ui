import {
  useApi,
  useCache,
  useLoader,
  useLoaderSuccess,
  useQuery,
} from "@app/fx";
import { batchActions, resetLoaderById, selectLoaderById } from "@app/fx";
import cn from "classnames";
import {
  SyntheticEvent,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useNavigate, useParams } from "react-router";
import { Link, useSearchParams } from "react-router-dom";

import { timeBetween } from "@app/date";
import {
  appDetailUrl,
  createProjectAddKeyUrl,
  createProjectAddNameUrl,
  createProjectGitPushUrl,
  createProjectGitSettingsUrl,
  createProjectGitStatusUrl,
  homeUrl,
  logoutUrl,
} from "@app/routes";
import { fetchSSHKeys } from "@app/ssh-keys";
import {
  AppState,
  DeployApp,
  DeployDatabase,
  DeployDatabaseImage,
  DeployEndpoint,
  DeployOperation,
  HalEmbedded,
  OperationStatus,
} from "@app/types";
import { selectCurrentUser } from "@app/users";

import { HeroBgLayout, MenuWrappedPage } from "../layouts";
import {
  AptibleLogo,
  Banner,
  BannerMessages,
  Box,
  Button,
  ButtonLink,
  ButtonLinkExternal,
  ErrorResources,
  ExternalLink,
  FormGroup,
  IconArrowRight,
  IconChevronDown,
  IconChevronUp,
  IconCopy,
  IconPlusCircle,
  Input,
  Loading,
  LogViewer,
  PreCode,
  Select,
  SelectOption,
  StackSelect,
  listToInvertedTextColor,
  resolveOperationStatuses,
  tokens,
} from "../shared";
import { AddSSHKeyForm } from "../shared/add-ssh-key";
import { StatusPill } from "../shared/pill";
import { ResourceGroupBox } from "../shared/resource-group-box";
import { StatusBox } from "../shared/status-box";
import {
  cancelAppOpsPoll,
  createEndpointOperation,
  fetchAllApps,
  fetchAllStacks,
  fetchApp,
  fetchAppOperations,
  fetchDatabasesByEnvId,
  fetchEndpointsByAppId,
  fetchEnvironmentById,
  hasDeployApp,
  hasDeployEndpoint,
  hasDeployEnvironment,
  pollAppOperations,
  provisionEndpoint,
  selectAppById,
  selectDatabasesByEnvId,
  selectEndpointsByAppId,
  selectEnvironmentById,
  selectFirstAppByEnvId,
  selectFirstEndpointByAppId,
  selectServiceById,
  selectServicesByIds,
  selectStackPublicDefaultAsOption,
  serviceCommandText,
} from "@app/deploy";
import {
  fetchServiceDefinitionsByAppId,
  selectServiceDefinitionsByAppId,
} from "@app/deploy/app-service-definitions";
import {
  DeployCodeScanResponse,
  fetchCodeScanResult,
} from "@app/deploy/code-scan-result";
import {
  DeployConfigurationResponse,
  fetchConfiguration,
} from "@app/deploy/configuration";
import {
  fetchAllDatabaseImages,
  selectDatabaseImagesAsList,
} from "@app/deploy/database-images";
import {
  cancelEnvOperationsPoll,
  createReadableStatus,
  hasDeployOperation,
  pollEnvAllOperations,
  selectLatestConfigureOp,
  selectLatestDeployOp,
  selectLatestProvisionOp,
  selectLatestProvisionOps,
  selectLatestScanOp,
  selectLatestSucceessScanOp,
} from "@app/deploy/operation";
import { selectEnv, selectLegacyDashboardUrl, selectOrigin } from "@app/env";
import { selectFeedback, setFeedback } from "@app/feedback";
import { selectOrganizationSelected } from "@app/organizations";
import {
  DbSelectorProps,
  TextVal,
  createProject,
  deployProject,
  redeployApp,
} from "@app/projects";
import { validHandle } from "@app/string-utils";

export const CreateProjectLayout = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const origin = useSelector(selectOrigin);
  const legacyUrl = useSelector(selectLegacyDashboardUrl);
  const org = useSelector(selectOrganizationSelected);

  const orgSettingsUrl = `${legacyUrl}/organizations/${org.id}/members`;
  const sshSettingsUrl = `${legacyUrl}/settings/protected/ssh`;

  if (origin === "nextgen") {
    return (
      <MenuWrappedPage>
        <HeroBgLayout showLogo={false} width="100%">
          <div className="min-h-screen -my-16 pt-16">
            {children ? children : <Outlet />}
          </div>
        </HeroBgLayout>
      </MenuWrappedPage>
    );
  }

  return (
    <>
      <div className="p-6 flex justify-between relative shadow bg-white border-b border-black-50 mb-8">
        <div className="flex">
          <Link to={homeUrl()}>
            <AptibleLogo />
          </Link>
          <div className="ml-5">
            {origin === "app" ? (
              <a href={legacyUrl} rel="noreferrer" className="text-black-500">
                Dashboard
              </a>
            ) : (
              <Link to={homeUrl()} className="text-black-500">
                Dashboard
              </Link>
            )}
            {origin === "app" && (
              <Link to={homeUrl()} className="text-black-500 ml-5">
                Deployments
              </Link>
            )}
          </div>
        </div>

        <div>
          <a
            href={sshSettingsUrl}
            target="_blank"
            className="text-black-500 ml-5"
            rel="noreferrer"
          >
            Manage SSH Keys
          </a>
          <a
            href={orgSettingsUrl}
            target="_blank"
            className="text-black-500 ml-5"
            rel="noreferrer"
          >
            {org.name} Settings
          </a>
          <Link to={logoutUrl()} className="text-black-500 ml-5">
            Logout
          </Link>
        </div>
      </div>

      <HeroBgLayout showLogo={false} width={700}>
        {children ? children : <Outlet />}
      </HeroBgLayout>
    </>
  );
};

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
      navigate(createProjectGitStatusUrl(app.id));
    } else if (hasDeployOperation(scanOp) && scanOp.status === "succeeded") {
      navigate(createProjectGitSettingsUrl(app.id));
    } else {
      navigate(createProjectGitPushUrl(app.id));
    }
  }, [env.id, app.id, appOps, deployOp, scanOp]);

  return <Loading text={`Detecting app ${app.handle} status...`} />;
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

const ProgressItem = ({ done = false }: { done?: boolean }) => {
  return (
    <div
      className={`w-[20px] h-[4px] border mr-3 ${
        done ? "bg-black border-black" : "bg-gray-100 border-gray-100"
      }`}
    >
      {" "}
    </div>
  );
};

const ProgressProject = ({
  cur,
  total = 4,
  prev = "",
  next = "",
}: {
  cur: number;
  total?: number;
  prev?: string;
  next?: string;
}) => {
  const env = useSelector(selectEnv);
  const steps = [];
  for (let i = 1; i <= total; i += 1) {
    steps.push(<ProgressItem key={`step-${i}`} done={cur >= i} />);
  }
  const progress = <div className="flex items-center">{steps}</div>;

  if (env.isProduction && cur !== -1) {
    return <div className="my-6 flex justify-center">{progress}</div>;
  }

  return (
    <div className="my-6 flex justify-center">
      {progress}
      <div className="ml-4">
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
    </div>
  );
};

export const CreateProjectAddKeyPage = () => {
  const navigate = useNavigate();
  const onSuccess = () => navigate(createProjectAddNameUrl());

  return (
    <div>
      <div className="text-center">
        <h1 className={tokens.type.h1}>Add your SSH Key</h1>
        <p className="my-4 text-gray-600">
          Add your SSH key to push code into Aptible.
        </p>
      </div>

      <ProgressProject cur={-1} next={createProjectAddNameUrl()} />

      <Box>
        <AddSSHKeyForm onSuccess={onSuccess} />
      </Box>
    </div>
  );
};

export const CreateProjectNamePage = () => {
  const org = useSelector(selectOrganizationSelected);
  const defaultStack = useSelector(selectStackPublicDefaultAsOption);
  const [stackValue, setStackValue] = useState(defaultStack);
  useEffect(() => {
    setStackValue(defaultStack);
  }, [defaultStack.value]);

  const [name, setName] = useState("");
  const [environmentNameError, setEnvironmentNameError] = useState("");
  const thunk = useApi(
    createProject({ name, stackId: stackValue.value, orgId: org.id }),
  );
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validHandle(name)) {
      setEnvironmentNameError(
        "Not a valid environment name (letters, numbers, and following symbols (., -, _).",
      );
      return;
    } else {
      setEnvironmentNameError("");
    }

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
        <h1 className={tokens.type.h1}>Name your Environment</h1>
        <p className="mt-4 mb-2 text-gray-600">
          An Aptible environment contains your app along with any required
          databases.
        </p>
      </div>

      <ProgressProject cur={1} />

      <Box>
        <form onSubmit={onSubmit}>
          <FormGroup
            label="Stack"
            description={
              <p>
                The project will be created inside this{" "}
                <a
                  href="https://www.aptible.com/docs/stacks"
                  target="_blank"
                  rel="noreferrer"
                >
                  stack
                </a>
              </p>
            }
            htmlFor="stack"
            feedbackVariant="info"
            className="mb-4"
          >
            <StackSelect
              value={stackValue}
              onSelect={(stack) => {
                setStackValue(stack);
              }}
            />
          </FormGroup>
          <FormGroup
            label="Environment Name"
            description="Lowercase alphanumerics, periods, dashes, and underscores only"
            htmlFor="name"
            feedbackVariant={environmentNameError ? "danger" : "info"}
            feedbackMessage={environmentNameError}
          >
            <Input
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              autoFocus
            />
          </FormGroup>

          <BannerMessages {...thunk} className="my-2" />

          <Button
            className="mt-4 w-full"
            type="submit"
            isLoading={thunk.isLoading}
            disabled={name === ""}
          >
            Create Environment
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

interface StarterOption extends SelectOption {
  query: { [key: string]: string[] };
  repo: string;
}

const starterTemplateOptions: StarterOption[] = [
  { label: "Custom Code", value: "none", query: {}, repo: "" },
  {
    label: "Ruby on Rails v7",
    value: "git@github.com:aptible/template-rails.git",
    repo: "template-rails",
    query: {
      dbs: ["database_url:postgresql:14", "redis_url:redis:3.0"],
      envs: ["production_secret_key"],
    },
  },
  {
    label: "Django v4",
    value: "git@github.com:aptible/template-django.git",
    repo: "template-django",
    query: { dbs: ["database_url:postgresql:14"], envs: ["secret_key"] },
  },
  {
    label: "Express v4",
    value: "git@github.com:aptible/template-express.git",
    repo: "template-express",
    query: { dbs: ["database_url:postgresql:14"] },
  },
  {
    label: "Laravel v10",
    value: "git@github.com:aptible/template-laravel.git",
    repo: "template-laravel",
    query: {
      dbs: ["database_url:postgresql:14"],
      envs: ["db_connection:aptible", "app_key"],
    },
  },
  {
    label: "Deploy Demo App",
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
          <div className="my-2">
            <Select
              options={starterTemplateOptions}
              value={starter}
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
          <div>
            We detected an app deployment, did you push to the{" "}
            <code>aptible-scan</code> branch?
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

const trim = (t: string) => t.trim();
const parseText = <
  M extends { [key: string]: unknown } = { [key: string]: unknown },
>(
  text: string,
  meta: () => M,
): TextVal<M>[] =>
  text
    .split("\n")
    .map(trim)
    .map((t) => {
      // sometimes the value can contain an "=" so we need to only
      // split the first "=", (e.g. SECRET_KEY=1234=)
      // https://stackoverflow.com/a/54708145
      const [key, ...values] = t.split("=").map(trim);
      const value = Array.isArray(values) ? values.join("=") : values;
      return {
        key,
        value,
        meta: meta(),
      };
    })
    .filter((t) => !!t.key);

interface ValidatorError {
  item: TextVal;
  message: string;
}

interface DbValidatorError {
  message: string;
  item: DbSelectorProps;
}

const validateDbs = (items: DbSelectorProps[]): DbValidatorError[] => {
  const errors: DbValidatorError[] = [];
  const envVars = new Set();

  const validate = (item: DbSelectorProps) => {
    if (!/^[0-9a-z._-]{1,64}$/.test(item.name)) {
      errors.push({
        item,
        message: `[${item.name}] is not a valid handle: /\A[0-9a-z._-]{1,64}\z/`,
      });
    }

    if (envVars.has(item.env)) {
      errors.push({
        item,
        message: `${item.env} has already been used, each database env var must be unique`,
      });
    } else {
      envVars.add(item.env);
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

    if (item.value === "") {
      errors.push({
        item,
        message: `${item.key} is blank, either provide a value or remove the environment variable`,
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

const DatabaseNameInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (s: string) => void;
}) => {
  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.currentTarget.value);
  };
  return (
    <FormGroup label="Database Handle" htmlFor="dbname" className="flex-1">
      <Input name="dbname" value={value} onChange={change} />
    </FormGroup>
  );
};

const DatabaseEnvVarInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (s: string) => void;
}) => {
  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.currentTarget.value);
  };
  return (
    <FormGroup label="Environment Variable" htmlFor="envvar" className="flex-1">
      <Input name="envvar" value={value} onChange={change} />
    </FormGroup>
  );
};

const idCreator = () => {
  let id = 0;
  return () => {
    id += 1;
    return id;
  };
};
const createId = idCreator();

const Selector = ({
  db,
  images,
  propChange,
  onDelete,
  appHandle,
}: {
  db: DbSelectorProps;
  images: DeployDatabaseImage[];
  propChange: (d: DbSelectorProps) => void;
  onDelete: () => void;
  appHandle: string;
}) => {
  const selectChange = (option: SelectOption) => {
    const imgId = option.value;
    const img = images.find((i) => i.id === imgId);
    propChange({
      ...db,
      imgId,
      name: `${appHandle}-${img?.type || ""}`,
      dbType: img?.type || "",
    });
  };

  const sel = (
    <div className="flex justify-between gap-3 mt-4">
      <DatabaseNameInput
        value={db.name}
        onChange={(value) => propChange({ ...db, name: value })}
      />
      <DatabaseEnvVarInput
        value={db.env}
        onChange={(value) => propChange({ ...db, env: value })}
      />
    </div>
  );

  const imgOptions = [
    { value: "", label: "Choose a Database" },
    ...images.map((img) => ({
      label: `${img.type} v${img.version}`,
      value: img.id,
    })),
  ];
  const selectedValue = imgOptions.find((img) => img.value === db.imgId);

  return (
    <div className="mb-4">
      <h4 className={`${tokens.type.h4} mb-2`}>Database</h4>
      <p className="text-black-500 mb-2">
        Choose a database type and handle. The environment variable here will be
        injected into your app with the connection URL.
      </p>
      <div className="flex mb-2">
        <Select
          onSelect={selectChange}
          value={selectedValue}
          options={imgOptions}
          className="flex-1 mr-2"
        />
        <Button variant="delete" onClick={onDelete}>
          Delete
        </Button>
      </div>
      {db.imgId ? sel : null}
      <hr className="my-4" />
    </div>
  );
};

type DbSelectorAction =
  | { type: "add"; payload: DbSelectorProps }
  | { type: "rm"; payload: string }
  | { type: "reset" };

function dbSelectorReducer(
  state: { [key: string]: DbSelectorProps },
  action: DbSelectorAction,
) {
  if (action.type === "add") {
    return { ...state, [action.payload.id]: action.payload };
  }

  if (action.type === "reset") {
    return {};
  }

  if (action.type === "rm") {
    const nextState = { ...state };
    delete nextState[action.payload];
    return nextState;
  }

  return state;
}

const DatabaseSelectorForm = ({
  dbMap,
  dispatch,
  namePrefix,
  images,
  appHandle,
}: {
  dbMap: { [key: string]: DbSelectorProps };
  dispatch: (action: any) => void;
  namePrefix: string;
  images: DeployDatabaseImage[];
  appHandle: string;
}) => {
  const onClick = () => {
    const payload: DbSelectorProps = {
      id: `${createId()}`,
      imgId: "",
      name: namePrefix,
      env: "DATABASE_URL",
      dbType: "",
    };
    dispatch({
      type: "add",
      payload,
    });
  };

  return (
    <div>
      {Object.values(dbMap)
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((db) => {
          return (
            <Selector
              key={db.id}
              images={images}
              db={db}
              propChange={(payload) => dispatch({ type: "add", payload })}
              onDelete={() => dispatch({ type: "rm", payload: db.id })}
              appHandle={appHandle}
            />
          );
        })}
      <Button type="button" onClick={onClick} variant="secondary">
        <IconPlusCircle className="mr-2" color="#fff" /> New Database
      </Button>
    </div>
  );
};

const DockerfileDataView = ({
  dockerfileData,
}: { dockerfileData: string | undefined }) => {
  const [isOpen, setOpen] = useState(false);

  if (!dockerfileData) {
    return null;
  }

  const segments = dockerfileData.split("\n").map((line) => ({
    text: `${line}\n`,
    className: line?.[0] === "#" ? "text-white" : "text-lime",
  }));

  return (
    <div>
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
            <p className="ml-2">View scanned Dockerfile:</p>
          </div>
        </div>
      </div>
      {isOpen ? (
        <div className="pb-4">
          <PreCode allowCopy segments={segments} />
        </div>
      ) : null}
    </div>
  );
};

const CodeScanInfo = ({
  codeScan,
}: {
  codeScan: DeployCodeScanResponse | null;
}) => {
  if (!codeScan) return null;
  if (codeScan.dockerfile_present) {
    return (
      <>
        <Banner variant="info">
          <span>Your code has a </span>
          <ExternalLink
            href="https://www.aptible.com/docs/dockerfile"
            variant="info"
          >
            Dockerfile
          </ExternalLink>
          <span> and will be used to build your Aptible app image.</span>
        </Banner>
        <DockerfileDataView dockerfileData={codeScan.dockerfile_data} />
      </>
    );
  }

  const commonHelpText = (
    <>
      <span>We recommend adding a </span>
      <ExternalLink
        href="https://www.aptible.com/docs/dockerfile"
        variant="info"
      >
        Dockerfile
      </ExternalLink>
      <span> to your repo, commit it, and push your code.</span>
    </>
  );

  if (codeScan.languages_detected.includes("python")) {
    return (
      <>
        <Banner variant="info">
          <div className="ml-2">
            <p>
              We have detected a Python application that does not contain a{" "}
              <ExternalLink
                href="https://www.aptible.com/docs/dockerfile"
                variant="info"
              >
                Dockerfile
              </ExternalLink>
              .
            </p>
          </div>
        </Banner>
        <p className="my-4">
          There will need to be a requirements.txt and/or pyproject.toml in the
          root directory of your app. We suggest ensuring the following:
        </p>
        <p className="my-4">
          If a Django project, we will run:{" "}
          <span className="bg-gray-200 font-mono">
            python manage.py migrate && gunicorn $PROJECT.wsgi
          </span>
          .
        </p>
        <p className="my-4">
          Otherwise, if pyproject.toml is found, we will run{" "}
          <span className="bg-gray-200 font-mono">python -m $MODULE_NAME</span>.
        </p>
        <p className="my-4">
          Finally, if above two conditions are not met, a main.py must be
          present in the root directory of your application for us to continue.
        </p>
        <p className="my-4">
          <strong>{commonHelpText}</strong>
        </p>
      </>
    );
  }

  return (
    <>
      <Banner variant="info">
        <p>
          Your code is missing a Dockerfile to deploy. We will try to generate
          one for you. {commonHelpText}
        </p>
      </Banner>
    </>
  );
};

export const CreateProjectGitSettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { appId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const queryEnvsStr = searchParams.get("envs") || "";
  const queryDbsStr = searchParams.get("dbs") || "";

  useQuery(fetchApp({ id: appId }));
  const app = useSelector((s: AppState) => selectAppById(s, { id: appId }));
  const { scanOp, codeScan } = useLatestCodeResults(appId);
  useQuery(fetchDatabasesByEnvId({ envId: app.environmentId }));

  const imgLoader = useQuery(fetchAllDatabaseImages());
  const dbImages = useSelector(selectDatabaseImagesAsList);

  useQuery(fetchServiceDefinitionsByAppId({ appId }));
  const serviceDefinitions = useSelector((s: AppState) =>
    selectServiceDefinitionsByAppId(s, { appId }),
  );

  const existingDbs = useSelector((s: AppState) =>
    selectDatabasesByEnvId(s, { envId: app.environmentId }),
  );

  const curConfig = useCache<DeployConfigurationResponse>(
    fetchConfiguration({ id: app.currentConfigurationId }),
  );
  const existingEnvStr = Object.keys(curConfig.data?.env || {}).reduce(
    (acc, key) => {
      const value = curConfig.data?.env[key];
      const prev = acc ? `${acc}\n` : "";
      return `${prev}${key}=${value}`;
    },
    "",
  );

  useEffect(() => {
    setEnvs(existingEnvStr);
  }, [existingEnvStr]);

  // prefill env vars based on query params
  useEffect(() => {
    if (!queryEnvsStr) return;
    setEnvs(
      queryEnvsStr
        .split(",")
        .map((env) => {
          const [key, val = ""] = env.split(":");
          return `${key.toLocaleUpperCase()}=${val}`;
        })
        .join("\n"),
    );
  }, [queryEnvsStr]);

  // prefill databases based on query params
  useEffect(() => {
    if (!queryDbsStr) return;
    if (!app.handle) return;
    const qdbs = queryDbsStr.split(",");
    if (qdbs.length === 0) return;

    dbDispatch({ type: "reset" });
    qdbs.forEach((db) => {
      const [env, type, version] = db.split(":");
      const img = dbImages.find(
        (i) => i.type === type && i.version === version,
      );
      if (!img) return;
      dbDispatch({
        type: "add",
        payload: {
          env: env.toLocaleUpperCase(),
          id: `${createId()}`,
          imgId: img.id,
          name: `${app.handle}-${img.type || ""}`,
          dbType: img.type || "",
        },
      });
    });
  }, [queryDbsStr, dbImages, app.handle]);

  const [dbMap, dbDispatch] = useReducer(dbSelectorReducer, {});
  const dbList = Object.values(dbMap).sort((a, b) => a.id.localeCompare(b.id));
  const [dbErrors, setDbErrors] = useState<DbValidatorError[]>([]);
  const [envs, setEnvs] = useState(existingEnvStr);
  const [envErrors, setEnvErrors] = useState<ValidatorError[]>([]);
  const [cmds, setCmds] = useState("");
  const cmdList = parseText(cmds, () => ({ id: "", http: false }));
  const [showServiceCommands, setShowServiceCommands] = useState(false);

  // rehydrate already existing databases
  // this allows us to trigger a provision operation if we failed to do so
  useEffect(() => {
    if (existingDbs.length > 0) {
      dbDispatch({ type: "reset" });
      const envList = parseText(envs, () => ({}));
      existingDbs.forEach((db) => {
        const img = dbImages.find((i) => i.id === db.databaseImageId);
        if (!img) return;
        const env = envList.find((e) => e.value === `{{${db.handle}}}`);
        if (!env) return;
        dbDispatch({
          type: "add",
          payload: {
            env: env.key.replace("_TMP", ""),
            id: `${createId()}`,
            imgId: img.id,
            name: db.handle,
            dbType: img.type || "",
          },
        });
      });
    }
  }, [existingDbs, dbImages]);

  const loader = useSelector((s: AppState) =>
    selectLoaderById(s, { id: `${deployProject}` }),
  );

  useEffect(() => {
    if (serviceDefinitions.length === 0) {
      return;
    }

    // hydrate inputs for consumption on load
    const cmdsToSet = serviceDefinitions
      .map((serviceDefinition) => {
        return `${serviceDefinition.processType}=${serviceDefinition.command}`;
      })
      .join("\n");

    setCmds(cmdsToSet);
  }, [serviceDefinitions]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let cancel = false;

    const dberr = validateDbs(dbList);
    if (dberr.length > 0) {
      cancel = true;
      setDbErrors(dberr);
    } else {
      setDbErrors([]);
    }

    const envList = parseText(envs, () => ({}));
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
        // don't create new databases if they already exist
        dbs: dbList,
        envs: envList,
        curEnvs: curConfig.data?.env || {},
        cmds: cmdList,
        gitRef: scanOp.gitRef || "main",
      }),
    );

    navigate(createProjectGitStatusUrl(appId));
  };

  useEnvOpsPoller({ appId, envId: app.environmentId });
  useProjectOps({
    envId: app.environmentId,
    appId,
  });

  return (
    <div className="mb-8">
      <div className="text-center">
        <h1 className={tokens.type.h1}>Configure your App</h1>
        <p className="my-4 text-gray-600">
          Add required Databases and review settings to finish.
        </p>
      </div>

      <ProgressProject
        cur={3}
        prev={createProjectGitPushUrl(appId)}
        next={createProjectGitStatusUrl(appId)}
      />

      <Box>
        <div className="mb-4">
          {codeScan.isInitialLoading ? (
            <Loading text="Loading code scan results..." />
          ) : (
            <CodeScanInfo codeScan={codeScan.data} />
          )}
        </div>

        <form onSubmit={onSubmit}>
          {imgLoader.isInitialLoading ? (
            <Loading text="Loading Databases..." />
          ) : (
            <FormGroup
              label=""
              htmlFor="databases"
              feedbackVariant={dbErrors ? "danger" : "info"}
              feedbackMessage={dbErrors.map((e) => e.message).join(". ")}
              description={
                <div>
                  {existingDbs.length > 0 ? (
                    <p>
                      Databases have already been created so you cannot make
                      changes to them in this screen anymore.
                    </p>
                  ) : null}
                </div>
              }
            >
              {existingDbs.length > 0 ? null : (
                <DatabaseSelectorForm
                  images={dbImages}
                  namePrefix={app.handle}
                  dbMap={dbMap}
                  dispatch={dbDispatch}
                  appHandle={app.handle}
                />
              )}
            </FormGroup>
          )}

          <hr className="my-4" />

          <FormGroup
            label="Environment Variables"
            htmlFor="envs"
            feedbackVariant={envErrors.length > 0 ? "danger" : "info"}
            feedbackMessage={envErrors.map((e) => e.message).join(". ")}
            description="Add any additional required variables, such as API keys, KNOWN_HOSTS setting, etc. Each line is a separate variable in format: ENV_VAR=VALUE."
          >
            <textarea
              id="envs"
              name="envs"
              className={tokens.type.textarea}
              value={envs}
              onChange={(e) => setEnvs(e.currentTarget.value)}
            />
          </FormGroup>

          <hr className="my-4" />

          {codeScan.data?.procfile_present ? (
            <div className="mb-4">
              <Banner variant="info">
                <span>Your code has a </span>
                <ExternalLink
                  href="https://aptible.com/docs/procfiles"
                  variant="info"
                >
                  Procfile
                </ExternalLink>
                <span>
                  , which will be used to determine your app's services and
                  commands.
                </span>
              </Banner>
            </div>
          ) : null}

          <FormGroup
            label="Service and Commands"
            htmlFor="commands"
            feedbackVariant="info"
            description="This is optional if you already have a Dockerfile or Procfile in your code repository.  Each line is a separate service and command in format: NAME=COMMAND (e.g. web=bundle exec rails server)."
          >
            {showServiceCommands ? (
              <textarea
                name="commands"
                className={tokens.type.textarea}
                value={cmds}
                onChange={(e) => setCmds(e.currentTarget.value)}
                disabled={codeScan.data?.procfile_present}
              />
            ) : null}
          </FormGroup>

          {showServiceCommands ? null : (
            <Button
              onClick={() => setShowServiceCommands(true)}
              variant="secondary"
              disabled={codeScan.data?.procfile_present}
            >
              <IconPlusCircle color="#fff" className="mr-2" />
              Configure
            </Button>
          )}

          <hr className="my-4" />

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
            <div className="mr-2 text-xs text-black-300">id: {op.id}</div>
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

const AppStatus = ({
  app,
  gitRef,
  status,
}: {
  app: Pick<DeployApp, "id" | "handle" | "environmentId">;
  gitRef: string;
  status: OperationStatus;
}) => {
  const dispatch = useDispatch();
  const configOp = useSelector((s: AppState) =>
    selectLatestConfigureOp(s, { appId: app.id }),
  );
  const deployOp = useSelector((s: AppState) =>
    selectLatestDeployOp(s, { appId: app.id }),
  );
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
      <Op
        op={configOp}
        resource={app}
        retry={retry}
        alwaysRetry
        status={status}
      />
      <Op
        op={deployOp}
        resource={app}
        retry={retry}
        alwaysRetry
        status={status}
      />
    </div>
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
  return (
    <div>
      {dbs.map((db) => {
        return <DatabaseStatus key={db.id} db={db} status={status} />;
      })}

      <AppStatus app={app} gitRef={gitRef} status={status} />

      {endpoints.map((vhost) => {
        return (
          <EndpointStatus key={vhost.id} endpoint={vhost} status={status} />
        );
      })}
    </div>
  );
};

const Code = ({ children }: { children: React.ReactNode }) => {
  return <code className="bg-gray-200 text-black p-[2px]">{children}</code>;
};

const CreateEndpointForm = ({ app }: { app: DeployApp }) => {
  const services = useSelector((s: AppState) =>
    selectServicesByIds(s, { ids: app.serviceIds }),
  );
  const vhosts = useSelector((s: AppState) =>
    selectEndpointsByAppId(s, { id: app.id }),
  );
  const dispatch = useDispatch();
  const [curServiceId, setServiceId] = useState("");
  const hasSelected = !!curServiceId;
  const action = provisionEndpoint({ serviceId: curServiceId });
  const loader = useLoader(action);
  const onChange = (id: string) => {
    setServiceId(id);
  };
  const onClick = () => {
    dispatch(action);
  };

  useEffect(() => {
    dispatch(fetchApp({ id: app.id }));
  }, [app.id]);

  return (
    <div>
      {services.map((service) => {
        return (
          <div key={service.id}>
            <label>
              <input
                type="radio"
                key="service"
                value={service.id}
                checked={curServiceId === service.id}
                onChange={() => onChange(service.id)}
                disabled={
                  !!vhosts.find((vhost) => vhost.serviceId === service.id)
                }
              />
              <span className="ml-1">
                {service.processType} <Code>{serviceCommandText(service)}</Code>
              </span>
            </label>
          </div>
        );
      })}
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

const useEnvOpsPoller = ({
  appId,
  envId,
}: {
  appId: string;
  envId: string;
}) => {
  const dispatch = useDispatch();
  const pollAction = pollEnvAllOperations({ envId });
  const pollLoader = useLoader(pollAction);
  useEffect(() => {
    const cancel = () => dispatch(cancelEnvOperationsPoll());
    cancel();
    dispatch(pollAction);

    return () => {
      cancel();
    };
  }, [appId, envId]);

  return pollLoader;
};

const useProjectOps = ({ appId, envId }: { appId: string; envId: string }) => {
  const deployOp = useSelector((s: AppState) =>
    selectLatestDeployOp(s, { appId }),
  );
  const configOp = useSelector((s: AppState) =>
    selectLatestConfigureOp(s, { appId }),
  );

  const vhost = useSelector((s: AppState) =>
    selectFirstEndpointByAppId(s, { id: appId }),
  );
  const dbs = useSelector((s: AppState) =>
    selectDatabasesByEnvId(s, { envId }),
  );

  const resourceIds = useMemo(() => {
    const arr = [...dbs.map((db) => db.id)];
    if (hasDeployEndpoint(vhost)) {
      arr.push(vhost.id);
    }
    return arr;
  }, [dbs, vhost]);

  const provisionOps = useSelector((s: AppState) =>
    selectLatestProvisionOps(s, {
      resourceIds,
    }),
  );
  const ops = useMemo(
    () =>
      [configOp, deployOp, ...provisionOps].filter((op) =>
        hasDeployOperation(op),
      ),
    [configOp, deployOp, provisionOps],
  );

  return { ops };
};

const FeedbackForm = () => {
  const dispatch = useDispatch();
  const feedback = useSelector(selectFeedback);
  const [freeformSurveyData, setFreeFormSurveyData] = useState<string>("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  const handleFeedbackSubmission = (e: SyntheticEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    const w = window as any;
    if (w.aptible?.event) {
      if (freeformSurveyData) {
        w.aptible.event(
          "feedback.survey.post_deploy_feedback",
          freeformSurveyData,
        );
      }
    }
    dispatch(setFeedback({ ...feedback, freeformFeedbackGiven: true }));
  };

  if (feedbackSubmitted) {
    return (
      <StatusBox>
        <h4 className={`${tokens.type.h4} text-center py-4`}>
          Thanks for your feedback!
        </h4>
      </StatusBox>
    );
  }

  const submitButtonClass = freeformSurveyData
    ? "mt-4"
    : "mt-4 disabled pointer-events-none hover:bg-indigo-300 bg-indigo-300";
  const maxFreeformSurveyDataLength = 300;

  return (
    <StatusBox>
      <h4 className={tokens.type.h4} />
      <FormGroup
        label="Share Feedback"
        htmlFor="feedback"
        description="What would you like to change about this deployment experience?"
      >
        <textarea
          maxLength={maxFreeformSurveyDataLength}
          name="feedback"
          className={tokens.type.textarea}
          value={freeformSurveyData}
          onChange={(e) => setFreeFormSurveyData(e.currentTarget.value)}
        />
      </FormGroup>
      <div>
        <div className="float-right mr-2">
          <p className="text-right text-sm">
            {freeformSurveyData.length} / {maxFreeformSurveyDataLength}
          </p>
        </div>
        <div>
          <Button
            disabled={!freeformSurveyData}
            type="submit"
            variant="secondary"
            className={submitButtonClass}
            onClick={handleFeedbackSubmission}
            isLoading={false}
          >
            Submit Feedback
          </Button>
        </div>
      </div>
    </StatusBox>
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

export const CreateProjectGitStatusPage = () => {
  const { appId = "" } = useParams();
  const dispatch = useDispatch();
  const origin = useSelector(selectOrigin);
  const legacyUrl = useSelector(selectLegacyDashboardUrl);
  const appQuery = useQuery(fetchApp({ id: appId }));
  const app = useSelector((s: AppState) => selectAppById(s, { id: appId }));
  const envId = app.environmentId;

  useQuery(fetchEnvironmentById({ id: envId }));
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
            <p>Your services will appear here shortly...</p>
          )}
        </StatusBox>
      )}

      {deployOp.status === "failed" || redeployLoader.isLoading ? (
        <StatusBox>
          <h4 className={tokens.type.h4}>Deployment Failed</h4>
          <p className="text-black-500 my-4">
            View the error logs, make code changes, and then push your code
            again to redeploy or click Redeploy to try again without making
            changes.
          </p>
          <p className="text-black-500 my-4">
            You can also try to trigger a redeploy now if you think it was a
            transient error that caused the deployment to fail.
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
      <FeedbackForm />
    </div>
  );
};
