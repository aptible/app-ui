import { Reducer, useEffect, useReducer, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
import { selectLoaderById } from "saga-query";
import { useQuery } from "saga-query/react";

import {
  DbCreatorProps,
  fetchAllDatabaseImages,
  fetchApp,
  fetchConfiguration,
  fetchDatabasesByEnvId,
  fetchServiceDefinitionsByAppId,
  selectAppById,
  selectAppConfigById,
  selectDatabaseImagesVisible,
  selectDatabasesByEnvId,
  selectServiceDefinitionsByAppId,
} from "@app/deploy";
import { DeployCodeScanResponse } from "@app/deploy";
import { idCreator } from "@app/id";
import {
  DB_ENV_TEMPLATE_KEY,
  TextVal,
  deployProject,
  getDbEnvTemplateValue,
} from "@app/projects";
import {
  createProjectGitPushUrl,
  createProjectGitStatusUrl,
} from "@app/routes";
import { AppState } from "@app/types";

import { useEnvOpsPoller, useLatestCodeResults, useProjectOps } from "../hooks";
import { AppSidebarLayout } from "../layouts";
import {
  Banner,
  Box,
  Button,
  DatabaseCreatorForm,
  DatabaseEnvVarInput,
  DbCreatorReducer,
  DbFormProps,
  DbSelector,
  DbSelectorAction,
  DbValidatorError,
  ExternalLink,
  FormGroup,
  IconChevronDown,
  IconChevronUp,
  IconPlusCircle,
  Loading,
  PreCode,
  ProgressProject,
  SelectOption,
  dbSelectorReducer,
  tokens,
  validateDbName,
} from "../shared";

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

const validateDbs = (items: DbCreatorProps[]): DbValidatorError[] => {
  const errors: DbValidatorError[] = [];
  const envVars = new Set();

  const validate = (item: DbCreatorProps) => {
    const name = validateDbName(item);
    if (name) {
      errors.push(name);
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

const createId = idCreator();

const DbExistingSelector = ({
  envId,
  db,
  propChange,
  onDelete,
}: {
  envId: string;
  db: DbExistingProps;
  propChange: (d: DbExistingProps) => void;
  onDelete: () => void;
}) => {
  const dbs = useSelector((s: AppState) =>
    selectDatabasesByEnvId(s, { envId }),
  );
  const selectChange = (option: SelectOption) => {
    const dbId = option.value;
    const foundDb = dbs.find((d) => d.id === dbId);

    propChange({
      ...db,
      dbId,
      connectionUrl: foundDb ? foundDb.connectionUrl : "",
    });
  };

  const sel = (
    <div className="flex justify-between gap-3 mt-4">
      <DatabaseEnvVarInput
        value={db.env}
        onChange={(value) => propChange({ ...db, env: value })}
      />
    </div>
  );

  return (
    <div className="mb-4">
      <h4 className={`${tokens.type.h4} mb-2`}>Existing Database</h4>
      <p className="text-black-500 mb-2">
        Choose an already existing database. The environment variable here will
        be injected into your app with the connection URL.
      </p>
      <div className="flex mb-2">
        <DbSelector
          envId={envId}
          ariaLabel="existing-db"
          onSelect={selectChange}
          value={db.dbId}
          className="flex-1 mr-2"
        />
        <Button variant="delete" onClick={onDelete}>
          Delete
        </Button>
      </div>

      {sel}

      <hr className="my-4" />
    </div>
  );
};

interface DbExistingProps {
  id: string;
  dbId: string;
  env: string;
  connectionUrl: string;
}

type DbExistingReducer = Reducer<
  { [key: string]: DbExistingProps },
  DbSelectorAction<DbExistingProps>
>;

const DatabaseExistingForm = ({
  envId,
  dbMap,
  dbDispatch,
  isLoading,
}: { envId: string; isLoading: boolean } & DbFormProps<DbExistingProps>) => {
  const onClick = () => {
    const payload: DbExistingProps = {
      id: `${createId()}`,
      env: "DATABASE_URL",
      dbId: "",
      connectionUrl: "",
    };
    dbDispatch({
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
            <DbExistingSelector
              key={db.id}
              db={db}
              envId={envId}
              propChange={(payload) => dbDispatch({ type: "add", payload })}
              onDelete={() => dbDispatch({ type: "rm", payload: db.id })}
            />
          );
        })}
      <Button
        type="button"
        onClick={onClick}
        variant="secondary"
        isLoading={isLoading}
      >
        <IconPlusCircle className="mr-2" color="#fff" variant="sm" /> Connect
        Existing Database
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

  const loader = useSelector((s: AppState) =>
    selectLoaderById(s, { id: `${deployProject}` }),
  );

  useQuery(fetchApp({ id: appId }));
  const app = useSelector((s: AppState) => selectAppById(s, { id: appId }));
  const { scanOp, codeScan } = useLatestCodeResults(appId);
  const dbsQuery = useQuery(
    fetchDatabasesByEnvId({ envId: app.environmentId }),
  );
  const existingDbs = useSelector((s: AppState) =>
    selectDatabasesByEnvId(s, { envId: app.environmentId }),
  );

  const imgLoader = useQuery(fetchAllDatabaseImages());
  const dbImages = useSelector(selectDatabaseImagesVisible);

  useQuery(fetchServiceDefinitionsByAppId({ appId }));
  const serviceDefinitions = useSelector((s: AppState) =>
    selectServiceDefinitionsByAppId(s, { appId }),
  );

  useQuery(fetchConfiguration({ id: app.currentConfigurationId }));
  const appConfig = useSelector((s: AppState) =>
    selectAppConfigById(s, { id: app.currentConfigurationId }),
  );
  const existingEnvStr = Object.keys(appConfig.env).reduce((acc, key) => {
    const value = appConfig.env[key];
    const prev = acc ? `${acc}\n` : "";
    return `${prev}${key}=${value}`;
  }, "");

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

  const [dbErrors, setDbErrors] = useState<DbValidatorError[]>([]);
  const [envs, setEnvs] = useState(existingEnvStr);
  const envList = parseText(envs, () => ({}));
  const [envErrors, setEnvErrors] = useState<ValidatorError[]>([]);
  const [cmds, setCmds] = useState("");
  const cmdList = parseText(cmds, () => ({ id: "", http: false }));
  const [showServiceCommands, setShowServiceCommands] = useState(false);
  const [dbCreatorMap, dbCreatorDispatch] = useReducer<DbCreatorReducer>(
    dbSelectorReducer,
    {},
  );
  const [dbExistingMap, dbExistingDispatch] = useReducer<DbExistingReducer>(
    dbSelectorReducer,
    {},
  );

  // rehydrate already existing databases
  // this allows us to trigger a provision operation if we failed to do so
  useEffect(() => {
    if (existingDbs.length > 0) {
      const envList = parseText(envs, () => ({}));
      existingDbs.forEach((db) => {
        const img = dbImages.find((i) => i.id === db.databaseImageId);
        if (!img) return;
        const env = envList.find(
          (e) => e.value === getDbEnvTemplateValue(db.handle),
        );
        if (!env) return;
        dbCreatorDispatch({
          type: "add",
          payload: {
            env: env.key.replace(DB_ENV_TEMPLATE_KEY, ""),
            id: `${createId()}`,
            imgId: img.id,
            name: db.handle,
            dbType: img.type || "",
            enableBackups: db.enableBackups,
          },
        });
      });
    }
  }, [existingDbs, dbImages]);

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
    const dbCreatorList = Object.values(dbCreatorMap).sort((a, b) =>
      a.id.localeCompare(b.id),
    );
    const dbExistingList = Object.values(dbExistingMap).sort((a, b) =>
      a.id.localeCompare(b.id),
    );
    let cancel = false;

    const allDbs = [...dbCreatorList];
    // also check with existing db list
    dbExistingList.forEach((edb) => {
      allDbs.push({
        id: edb.id,
        env: edb.env,
        // hack to get around name validation
        name: edb.env.toLocaleLowerCase(),
        dbType: "",
        imgId: "",
        enableBackups: true,
      });
    });
    const dberr = validateDbs(allDbs);

    if (dberr.length > 0) {
      cancel = true;
      setDbErrors(dberr);
    } else {
      setDbErrors([]);
    }

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

    // add existing dbs to env list since we already have the connection url
    dbExistingList.forEach((edb) => {
      envList.push({ key: edb.env, value: edb.connectionUrl, meta: {} });
    });

    dispatch(
      deployProject({
        appId,
        envId: app.environmentId,
        // don't create new databases if they already exist
        dbs: dbCreatorList,
        envs: envList,
        curEnvs: appConfig.env,
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
    <AppSidebarLayout className="mb-8">
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
          <FormGroup
            label=""
            description={
              envList.some((e) => e.key.includes(DB_ENV_TEMPLATE_KEY))
                ? "We have detected existing databases inside your App config.  Be sure you didn't already create the databases you require."
                : ""
            }
            htmlFor="databases"
            feedbackVariant={dbErrors ? "danger" : "info"}
            feedbackMessage={dbErrors.map((e) => e.message).join(". ")}
          >
            <div className="flex flex-col gap-4">
              <Loading
                text="Loading databases..."
                isLoading={dbsQuery.isInitialLoading}
              />
              {existingDbs.length > 0 ? (
                <DatabaseExistingForm
                  envId={app.environmentId}
                  dbMap={dbExistingMap}
                  dbDispatch={dbExistingDispatch}
                  isLoading={dbsQuery.isInitialLoading}
                />
              ) : null}

              <DatabaseCreatorForm
                dbImages={dbImages}
                namePrefix={app.handle}
                dbMap={dbCreatorMap}
                dbDispatch={dbCreatorDispatch}
                isLoading={imgLoader.isInitialLoading}
                showEnv
              />
            </div>
          </FormGroup>

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
              <IconPlusCircle color="#fff" className="mr-2" variant="sm" />
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
    </AppSidebarLayout>
  );
};
