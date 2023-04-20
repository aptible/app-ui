import cn from "classnames";
import { useEffect, useMemo, useReducer, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useNavigate, useParams } from "react-router";
import { Link, useSearchParams } from "react-router-dom";
import { selectDataById, selectLoaderById } from "saga-query";
import {
  useApi,
  useCache,
  useLoader,
  useLoaderSuccess,
  useQuery,
} from "saga-query/react";

import { prettyDateRelative } from "@app/date";
import {
  appDetailUrl,
  createProjectAddKeyUrl,
  createProjectAddNameUrl,
  createProjectGitPushUrl,
  createProjectGitSettingsUrl,
  createProjectGitStatusUrl,
  createProjectGitUrl,
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
  DeployEnvironment,
  DeployOperation,
  HalEmbedded,
  OnboardingStatus,
  OperationStatus,
} from "@app/types";
import { selectCurrentUser } from "@app/users";

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
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconGitBranch,
  IconInfo,
  IconPlusCircle,
  IconSettings,
  IconX,
  Input,
  Loading,
  PreCode,
  Select,
  SelectOption,
  StackSelect,
  listToInvertedTextColor,
  tokens,
} from "../shared";
import { AddSSHKeyForm } from "../shared/add-ssh-key";
import { OnboardingLink } from "../shared/onboarding-link";
import {
  cancelAppOpsPoll,
  createEndpointOperation,
  deriveAccountStatus,
  fetchAllApps,
  fetchAllEnvironments,
  fetchAllStacks,
  fetchApp,
  fetchAppOperations,
  fetchDatabasesByEnvId,
  fetchEndpointsByAppId,
  fetchEnvironmentById,
  hasDeployEndpoint,
  pollAppOperations,
  provisionEndpoint,
  selectAppById,
  selectDatabasesByEnvId,
  selectEnvironmentById,
  selectEnvironmentOnboarding,
  selectFirstAppByEnvId,
  selectFirstEndpointByAppId,
  selectServicesByIds,
  selectStackPublicDefaultAsOption,
  updateDeployEnvironmentStatus,
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
  fetchOperationLogs,
  hasDeployOperation,
  pollEnvOperations,
  selectLatestConfigureOp,
  selectLatestDeployOp,
  selectLatestOpByEnvId,
  selectLatestProvisionOp,
  selectLatestProvisionOps,
  selectLatestScanOp,
  selectLatestSucceessScanOp,
} from "@app/deploy/operation";
import { selectEnv, selectLegacyDashboardUrl, selectOrigin } from "@app/env";
import { selectOrganizationSelected } from "@app/organizations";
import {
  DbSelectorProps,
  TextVal,
  createProject,
  deployProject,
  redeployApp,
} from "@app/projects";

export const CreateProjectLayout = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const origin = useSelector(selectOrigin);
  const legacyUrl = useSelector(selectLegacyDashboardUrl);
  const org = useSelector(selectOrganizationSelected);
  const orgSettingsUrl = `${legacyUrl}/organizations/${org.id}/members`;
  return (
    <>
      <div className="p-6 flex justify-between shadow bg-white border-b border-black-50">
        <div className="flex">
          <Link to={homeUrl()}>
            <AptibleLogo />
          </Link>
          <div className="ml-4">
            {origin === "ftux" ? (
              <a href={legacyUrl} className="text-black-300">
                Back to dashboard
              </a>
            ) : (
              <Link to={homeUrl()} className="text-black-300">
                Back to dashboard
              </Link>
            )}
          </div>
        </div>

        <div>
          <a href={orgSettingsUrl} className="text-black-300">
            {org.name} Settings
          </a>
          <Link to={logoutUrl()} className="text-black-300 ml-4">
            Logout
          </Link>
        </div>
      </div>

      <div
        className="flex flex-col flex-1 h-full bg-no-repeat bg-center bg-cover"
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
                    {children ? children : <Outlet />}
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

export const CreateProjectSetupPage = () => {
  const { envId = "" } = useParams();
  const dispatch = useDispatch();
  const env = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: envId }),
  );
  const navigate = useNavigate();
  const app = useSelector((s: AppState) => selectFirstAppByEnvId(s, { envId }));

  useEffect(() => {
    dispatch(fetchAllApps());
    dispatch(fetchEnvironmentById({ id: envId }));
  }, []);

  useEffect(() => {
    if (env.onboardingStatus === "initiated") {
      navigate(createProjectGitPushUrl(app.id), { replace: true });
    } else if (env.onboardingStatus === "scanned") {
      navigate(createProjectGitSettingsUrl(app.id), { replace: true });
    } else if (
      env.onboardingStatus === "db_provisioned" ||
      env.onboardingStatus === "app_provisioned"
    ) {
      navigate(createProjectGitStatusUrl(app.id), { replace: true });
    } else {
      navigate(appDetailUrl(app.id), { replace: true });
    }
  }, [env.id, app.id]);

  return <Loading text="Detecting project status ..." />;
};

const EnvOverview = ({ env }: { env: DeployEnvironment }) => {
  const app = useSelector((s: AppState) =>
    selectFirstAppByEnvId(s, { envId: env.id }),
  );
  const op = useSelector((s: AppState) =>
    selectLatestOpByEnvId(s, { envId: env.id }),
  );
  const endpointQuery = useQuery(fetchEndpointsByAppId({ appId: app.id }));
  useEffect(() => {
    endpointQuery.trigger();
  }, [app.id]);

  return (
    <ProjectBox
      env={env}
      appId={app.id}
      status={
        <EnvStatusPill status={env.onboardingStatus} from={op.updatedAt} />
      }
    >
      <div className="mt-4">
        <OnboardingLink env={env} />
      </div>
    </ProjectBox>
  );
};

export const ResumeSetupPage = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchAllEnvironments());
    dispatch(fetchAllApps());
  }, []);
  const envs = useSelector(selectEnvironmentOnboarding);
  return (
    <div>
      <h1 className={`${tokens.type.h1} mb-6 text-center`}>Deploy Code</h1>
      <ButtonLink to={createProjectGitUrl()}>
        <IconPlusCircle className="mr-2" /> Deploy
      </ButtonLink>
      {envs.length === 0 ? <div>No environments found</div> : null}

      {envs.map((env) => (
        <EnvOverview key={env.id} env={env} />
      ))}
    </div>
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
    return <div className="mt-6 flex justify-center">{progress}</div>;
  }

  return (
    <div className="mt-4 flex justify-center">
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
        <h1 className={tokens.type.h1}>
          Get ready to deploy your app on Aptible
        </h1>
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
  const thunk = useApi(
    createProject({ name, stackId: stackValue.value, orgId: org.id }),
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
        <h1 className={tokens.type.h1}>
          Get ready to deploy your app on Aptible
        </h1>
        <p className="mt-4 mb-2 text-gray-600">
          An Aptible environment contains your app along with any required
          databases.
        </p>
        <p className="mb-4 text-gray-600">Name your Environment to continue.</p>
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
            description="Lowercase alphanumerics, periods, and dashes only"
            htmlFor="name"
            feedbackVariant="info"
          >
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
}

const starterTemplateOptions: StarterOption[] = [
  { label: "Custom Code", value: "none", query: {} },
  {
    label: "Ruby on Rails v7",
    value: "git@github.com:aptible/template-rails.git",
    query: {
      dbs: ["database_url:postgresql:14", "redis_url:redis:3.0"],
      envs: ["development_secret_key"],
    },
  },
  {
    label: "Django v4",
    value: "git@github.com:aptible/template-django.git",
    query: { dbs: ["database_url:postgresql:14"], envs: ["secret_key"] },
  },
  {
    label: "Express v4",
    value: "git@github.com:aptible/template-express.git",
    query: { dbs: ["database_url:postgresql:14"] },
  },
  {
    label: "Laravel v10",
    value: "git@github.com:aptible/template-laravel.git",
    query: { dbs: ["database_url:postgresql:14"] },
  },
  {
    label: "Deploy Demo App",
    value: "git@github.com:aptible/deploy-demo-app.git",
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
        <h1 className={tokens.type.h1}>
          Get ready to deploy your app on Aptible
        </h1>
        <p className="my-4 text-gray-600">Push your code to continue.</p>
      </div>

      <ProgressProject
        cur={2}
        prev={createProjectAddKeyUrl()}
        next={createProjectGitSettingsUrl(appId, query)}
      />

      <Box>
        <div>
          <h3 className={tokens.type.h3}>
            Deploy Custom Code or Starter Template
          </h3>
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
            <PreCode
              segments={listToInvertedTextColor(["git clone", starter.value])}
              allowCopy
            />
          ) : null}
        </div>

        <div className="mt-4">
          <h3 className={tokens.type.h3}>Add Aptible's Git Server</h3>
          <PreCode
            segments={listToInvertedTextColor([
              "git remote add aptible",
              app.gitRepo,
            ])}
            allowCopy
          />
        </div>

        <div className="mt-4">
          <h3 className={tokens.type.h3}>Push your code to our scan branch</h3>
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
      const vals = t.split("=").map(trim);
      return {
        key: vals[0],
        value: vals[1],
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
    <FormGroup
      label="Database alias"
      htmlFor="dbname"
      description="This is the name of the database which is an alias for your reference"
    >
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
    <FormGroup
      label="Environment variable"
      htmlFor="envvar"
      description="We will automatically inject this environment variable into your app with the correct connection string"
    >
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
    <div>
      <div className="mb-2">
        <DatabaseNameInput
          value={db.name}
          onChange={(value) => propChange({ ...db, name: value })}
        />
      </div>
      <DatabaseEnvVarInput
        value={db.env}
        onChange={(value) => propChange({ ...db, env: value })}
      />
    </div>
  );

  const imgOptions = [
    { value: "", label: "select a db" },
    ...images.map((img) => ({
      label: `${img.type}:${img.version}`,
      value: img.id,
    })),
  ];
  const selectedValue = imgOptions.find((img) => img.value === db.imgId);

  return (
    <div className="my-4">
      <div className="flex justify-between items-center mb-2">
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
      <Button type="button" onClick={onClick}>
        <IconPlusCircle className="mr-2" /> New
      </Button>
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
    );
  }

  return (
    <Banner variant="error">
      <span>
        Your code needs a Dockerfile to deploy. Add a Dockerfile, commit it, and
        re-push your code to continue,{" "}
      </span>
      <ExternalLink href="https://aptible.com/docs" variant="error">
        view our docs.
      </ExternalLink>
    </Banner>
  );

  /*
    TODO: uncomment when we have aptible/builder ready
    return (
    <Banner variant="info">
      <span>Aptible did not detect a </span>
      <ExternalLink href="https://www.aptible.com/docs/dockerfile">
        Dockerfile
      </ExternalLink>
      <span>
        {" "}
        in your code, and will automatically create one during deployment.{" "}
      </span>
      <ExternalLink href="https://www.aptible.com/docs">
        View docs to learn more
      </ExternalLink>
      <span>, or to add your own custom Dockerfile.</span>
    </Banner>
  ); */
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

  useQuery(fetchAllDatabaseImages());
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
        .map((env) => `${env}=""`.toLocaleUpperCase())
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
      ? serviceDefinitions
          .map((serviceDefinition) => {
            return `${serviceDefinition.processType}=${serviceDefinition.command}`;
          })
          .join("\n")
      : "";
    setCmds(cmdsToSet);
  }, [serviceDefinitions.length]);

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

  useProjectOps({
    envId: app.environmentId,
    appId,
  });

  return (
    <div>
      <div className="text-center">
        <h1 className={tokens.type.h1}>Review your Settings</h1>
        <p className="my-4 text-gray-600">Review and click deploy to finish.</p>
      </div>

      <ProgressProject
        cur={3}
        prev={createProjectGitPushUrl(appId)}
        next={createProjectGitStatusUrl(appId)}
      />

      <Box>
        <div className="mb-4">
          {codeScan.isInitialLoading ? (
            <Loading text="Loading code scan results ..." />
          ) : (
            <CodeScanInfo codeScan={codeScan.data} />
          )}
        </div>

        <form onSubmit={onSubmit}>
          <FormGroup
            label="Required Databases"
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

          <hr className="my-4" />

          <FormGroup
            label="Environment Variables"
            htmlFor="envs"
            feedbackVariant={envErrors.length > 0 ? "danger" : "info"}
            feedbackMessage={envErrors.map((e) => e.message).join(". ")}
            description="Environment Variables (each line is a separate variable in format: ENV_VAR=VALUE)."
          >
            <textarea
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
            description="Each line is separated by a service command in format: NAME=COMMAND."
          >
            <textarea
              name="commands"
              className={tokens.type.textarea}
              value={cmds}
              onChange={(e) => setCmds(e.currentTarget.value)}
              disabled={codeScan.data?.procfile_present}
            />
          </FormGroup>

          <Button
            type="submit"
            className="w-full mt-4"
            isLoading={loader.isLoading}
            disabled={!codeScan.data?.dockerfile_present}
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
  const [isOpen, setOpen] = useState(false);
  if (!hasDeployOperation(op)) {
    return null;
  }
  const extra = "border-b border-black-100";
  const statusView = () => {
    const cns = "font-semibold flex justify-center items-center";

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
          <div>{createReadableResourceName(op, resource.handle)}</div>
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

const EnvStatusPill = ({
  status,
  from,
}: {
  status: OnboardingStatus;
  from: string;
}) => {
  const date = prettyDateRelative(from);
  const className = cn(
    "rounded-full border-2",
    "text-sm font-semibold ",
    "px-2 flex justify-between items-center w-fit",
  );
  const inProgress = () => {
    if (status === "initiated") return "Started";
    if (status === "scanned") return "Code Pushed";
    if (status === "db_provisioned") return "Database(s) Provisioned";
    if (status === "app_provisioned") return "App Provisioned";
    return "Unknown";
  };

  if (status === "completed") {
    return (
      <div className={cn(className, "text-forest border-lime-300 bg-lime-100")}>
        <IconCheck color="#00633F" className="mr-1" variant="sm" />
        Completed {date}
      </div>
    );
  }

  return (
    <div className={cn(className, "text-brown border-brown bg-orange-100")}>
      <IconSettings color="#825804" className="mr-1" variant="sm" />
      <div>
        {inProgress()} {date}
      </div>
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
        <IconSettings color="#825804" className="mr-1" variant="sm" />
        <div>
          {status === "running" ? "Building" : "Queued"} {date}
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className={cn(className, "text-red border-red-300 bg-red-100")}>
        <IconX color="#AD1A1A" variant="sm" />
        <div>Failed {date}</div>
      </div>
    );
  }

  if (status === "succeeded") {
    return (
      <div className={cn(className, "text-forest border-lime-300 bg-lime-100")}>
        <IconCheck color="#00633F" className="mr-1" variant="sm" />
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
    if (op.status === "succeeded" || op.status === "failed") {
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

const Code = ({ children }: { children: React.ReactNode }) => {
  return <code className="bg-orange-200 p-[2px]">{children}</code>;
};

const CreateEndpointView = ({
  app,
  serviceId,
}: {
  app: DeployApp;
  serviceId: string;
}) => {
  const services = useSelector((s: AppState) =>
    selectServicesByIds(s, { ids: app.serviceIds }),
  );
  const dispatch = useDispatch();
  const [curServiceId, setServiceId] = useState(serviceId);
  const action = provisionEndpoint({ serviceId: curServiceId });
  const loader = useLoader(action);
  const onChange = (id: string) => {
    setServiceId(id);
  };
  const onClick = () => {
    dispatch(action);
  };

  useEffect(() => {
    setServiceId(serviceId);
  }, [serviceId]);

  useEffect(() => {
    dispatch(fetchApp({ id: app.id }));
  }, [app.id]);

  return (
    <div>
      {services.map((service) => {
        return (
          <div key={service.id}>
            <input
              type="radio"
              key="service"
              value={service.id}
              checked={curServiceId === service.id}
              onChange={() => onChange(service.id)}
              disabled={!!serviceId}
            />
            <span className="ml-1">
              {service.processType === "cmd" ? (
                "Docker CMD Service"
              ) : (
                <>
                  {service.processType} <Code>{service.command}</Code>
                </>
              )}
            </span>
          </div>
        );
      })}
      <Button
        onClick={onClick}
        isLoading={loader.isLoading}
        disabled={!!serviceId}
        className="mt-4"
      >
        Create endpoint
      </Button>
    </div>
  );
};

const ProjectBox = ({
  env,
  appId,
  children,
  status,
}: {
  env: DeployEnvironment;
  appId: string;
  children: React.ReactNode;
  status: JSX.Element;
}) => {
  const vhost = useSelector((s: AppState) =>
    selectFirstEndpointByAppId(s, { id: appId }),
  );
  const deployOp = useSelector((s: AppState) =>
    selectLatestDeployOp(s, { appId }),
  );

  return (
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
              {hasDeployEndpoint(vhost) ? (
                <a
                  href={`https://${vhost.virtualDomain}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  https://{vhost.virtualDomain}
                </a>
              ) : (
                "pending http endpoint"
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center mt-1">
          {status}
          <Pill icon={<IconGitBranch color="#595E63" variant="sm" />}>
            {deployOp.gitRef.slice(0, 12) || "pending"}
          </Pill>
        </div>
      </div>

      {children}
    </StatusBox>
  );
};

const useProjectOps = ({ appId, envId }: { appId: string; envId: string }) => {
  const dispatch = useDispatch();
  const env = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: envId }),
  );

  const pollAction = pollEnvOperations({ envId });
  const pollLoader = useLoader(pollAction);
  useEffect(() => {
    const cancel = () => dispatch(cancelEnvOperationsPoll());
    cancel();
    dispatch(pollAction);

    return () => {
      cancel();
    };
  }, [appId, envId]);

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
  const { scanOp } = useLatestCodeResults(appId);

  useEffect(() => {
    const status = deriveAccountStatus([...ops, scanOp]);
    if (status === env.onboardingStatus) {
      return;
    }

    if (pollLoader.lastSuccess === 0) {
      return;
    }

    dispatch(
      updateDeployEnvironmentStatus({
        id: envId,
        status,
      }),
    );
  }, [ops, env.onboardingStatus, pollLoader.lastSuccess, scanOp]);

  return { ops };
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
  const vhost = useSelector((s: AppState) =>
    selectFirstEndpointByAppId(s, { id: appId }),
  );
  const { ops } = useProjectOps({
    envId,
    appId,
  });

  const [status, dateStr] = resolveOperationStatuses(ops);
  const { isInitialLoading } = useQuery(pollEnvOperations({ envId }));

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
      redeployApp({
        appId,
        envId: env.id,
        gitRef,
        force,
      }),
    );
  };

  // if the user started the deployment process but left before
  // we could create an app deploy operation then we need to kick that
  // off again here
  /* useEffect(() => {
    if (!appId) return;
    if (!env.id) return;
    if (status !== "succeeded") return;
    if (redeployLoader.isLoading) return;

    if (!hasDeployOperation(deployOp)) {
      dispatch(
        redeployApp({
          appId,
          envId: env.id,
          gitRef,
          force: true,
        }),
      );
    }
  }, [appId, env.id, deployOp.id, status, redeployLoader.isLoading]); */

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

  return (
    <div>
      {header()}

      <ProgressProject cur={4} prev={createProjectGitSettingsUrl(appId)} />

      <ProjectBox
        env={env}
        appId={appId}
        status={<StatusPill status={status} from={dateStr} />}
      >
        {isInitialLoading ? (
          <Loading text="Loading resources ..." />
        ) : (
          <ProjectStatus
            status={status}
            app={app}
            dbs={dbs}
            endpoints={[vhost]}
            gitRef={gitRef}
          />
        )}
      </ProjectBox>

      {redeployLoader.isError || deployProjectLoader.isError ? (
        <StatusBox>
          <h4 className={tokens.type.h4}>Error!</h4>
          <BannerMessages {...redeployLoader} />
          <BannerMessages {...deployProjectLoader} />
        </StatusBox>
      ) : null}

      {status === "succeeded" && !hasDeployOperation(deployOp) ? (
        <StatusBox>
          <h4 className={tokens.type.h4}>
            Don't see an app deployment operation?
          </h4>
          <Button onClick={() => redeploy(true)}>Deploy!</Button>
        </StatusBox>
      ) : null}

      {deployOp.status === "succeeded" && !vhost?.serviceId ? (
        <StatusBox>
          <h4 className={tokens.type.h4}>Which service needs an endpoint?</h4>
          <CreateEndpointView app={app} serviceId={vhost?.serviceId || ""} />
        </StatusBox>
      ) : null}

      {deployOp.status === "failed" ? (
        <StatusBox>
          <h4 className={tokens.type.h4}>Deployment failed</h4>
          <p className="text-black-500 my-4">
            If the app deployment failed, you can view the error logs, make code
            changes, and then push the code to us to redeploy. This screen will
            track your deployment status.
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
          <p className="mt-4">
            {redeployLoader.isError ? redeployLoader.message : ""}
          </p>
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

        {origin === "ftux" ? (
          <ButtonLinkExternal
            href={`${legacyUrl}/accounts/${envId}/apps`}
            className="mt-4 mb-2"
          >
            View Project <IconArrowRight variant="sm" className="ml-2" />
          </ButtonLinkExternal>
        ) : (
          <ButtonLink to={appDetailUrl(appId)} className="mt-4 mb-2">
            View Project <IconArrowRight variant="sm" className="ml-2" />
          </ButtonLink>
        )}

        <ButtonLink to={createProjectGitSettingsUrl(appId)} variant="white">
          Back
        </ButtonLink>
      </StatusBox>
    </div>
  );
};
