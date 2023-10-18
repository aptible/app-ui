import {
  DbCreatorProps,
  configEnvToStr,
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
  deployProject,
  getDbEnvTemplateValue,
} from "@app/projects";
import { appDeployGetStartedUrl, appDeployStatusUrl } from "@app/routes";
import { parseText } from "@app/string-utils";
import { AppState } from "@app/types";
import { Reducer, useEffect, useReducer, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
import { selectLoaderById } from "saga-query";
import { useQuery } from "saga-query/react";
import {
  useEnvEditor,
  useEnvOpsPoller,
  useLatestCodeResults,
  useProjectOps,
} from "../hooks";
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
  IconChevronRight,
  IconChevronUp,
  IconPlusCircle,
  Loading,
  PreBox,
  ProgressProject,
  SelectOption,
  dbSelectorReducer,
  tokens,
  validateDbName,
} from "../shared";

export const AppDeployConfigurePage = () => {
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
  const existingEnvStr = configEnvToStr(appConfig.env);
  const {
    envs,
    setEnvs,
    envList,
    validate: validateEnvs,
    errors: envErrors,
  } = useEnvEditor(existingEnvStr);

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
    const dbExistingList = Object.values(dbExistingMap)
      .sort((a, b) => a.id.localeCompare(b.id))
      .filter((db) => db.dbId !== "");
    let cancel = false;

    const envVars = new Set<string>();
    const newDbErr = validateNewDbs(dbCreatorList, envVars);
    const existingDbErr = validateExistingDbs(dbExistingList, envVars);
    const dberr = [...newDbErr, ...existingDbErr];

    if (dberr.length > 0) {
      cancel = true;
      setDbErrors(dberr);
    } else {
      setDbErrors([]);
    }

    if (!validateEnvs()) {
      cancel = true;
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

    navigate(appDeployStatusUrl(appId));
  };

  useEnvOpsPoller({ appId, envId: app.environmentId });
  useProjectOps({
    envId: app.environmentId,
    appId,
  });

  return (
    <AppSidebarLayout className="mb-8">
      <div className="text-center mt-10">
        <h1 className={tokens.type.h1}>Configure your App</h1>
        <p className="my-4 text-gray-600">
          Add required Databases and review settings to finish.
        </p>
      </div>

      <ProgressProject
        cur={3}
        prev={appDeployGetStartedUrl(appId)}
        next={appDeployStatusUrl(appId)}
      />

      <Box className="w-full max-w-[700px] mx-auto">
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
            description="Add any additional required variables, such as API keys, KNOWN_HOSTS setting, etc. Each line is a separate variable in format: ENV_VAR=VALUE. Multiline values are supported but must be wrapped in double-quotes."
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
      <div className="bg-[url('/background-pattern-v2.png')] bg-no-repeat bg-cover bg-center absolute w-full h-full top-0 left-0 z-[-999]" />
    </AppSidebarLayout>
  );
};

const validateNewDbs = (
  items: DbCreatorProps[],
  envVars: Set<string>,
): DbValidatorError[] => {
  const errors: DbValidatorError[] = [];

  const validate = (item: DbCreatorProps) => {
    const name = validateDbName(item);
    if (name) {
      errors.push(name);
    }

    if (item.imgId === "") {
      errors.push({
        item,
        message: "Must pick a database or delete the selector from the menu",
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

const validateExistingDbs = (
  items: DbExistingProps[],
  envVars: Set<string>,
): DbValidatorError[] => {
  const errors: DbValidatorError[] = [];

  const validate = (item: DbExistingProps) => {
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
      <h4 className={`${tokens.type.h4}`}>Existing Database</h4>
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
  name: string;
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
      name: "",
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
            {isOpen ? <IconChevronUp /> : <IconChevronRight />}
            <p className="ml-2">View scanned Dockerfile:</p>
          </div>
        </div>
      </div>
      {isOpen ? (
        <div className="pb-4">
          <PreBox allowCopy segments={segments} />
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

  if (codeScan.languages_detected?.includes("python")) {
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
