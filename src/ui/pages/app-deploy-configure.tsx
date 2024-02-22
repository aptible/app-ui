import {
  DbCreatorProps,
  configEnvListToEnv,
  configEnvToStr,
  fetchApp,
  fetchConfiguration,
  fetchDatabaseImages,
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
import { DB_ENV_TEMPLATE_KEY, deployProject } from "@app/projects";
import { useDispatch, useQuery, useSelector } from "@app/react";
import { appDeployGetStartedUrl, appDeployStatusUrl } from "@app/routes";
import { schema } from "@app/schema";
import { parseText } from "@app/string-utils";
import { Reducer, useEffect, useReducer, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
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
  EnvEditorFormInput,
  ExternalLink,
  FormGroup,
  Group,
  IconChevronDown,
  IconChevronRight,
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

  const loader = useSelector((s) =>
    schema.loaders.selectById(s, { id: `${deployProject}` }),
  );

  useQuery(fetchApp({ id: appId }));
  const app = useSelector((s) => selectAppById(s, { id: appId }));
  const { gitRef, codeScan } = useLatestCodeResults(appId);
  const dbsQuery = useQuery(
    fetchDatabasesByEnvId({ envId: app.environmentId }),
  );
  const existingDbs = useSelector((s) =>
    selectDatabasesByEnvId(s, { envId: app.environmentId }),
  );

  const imgLoader = useQuery(fetchDatabaseImages());
  const dbImages = useSelector(selectDatabaseImagesVisible);

  useQuery(fetchServiceDefinitionsByAppId({ appId }));
  const serviceDefinitions = useSelector((s) =>
    selectServiceDefinitionsByAppId(s, { appId }),
  );

  useQuery(fetchConfiguration({ id: app.currentConfigurationId }));
  const appConfig = useSelector((s) =>
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
  const previewEnv = configEnvListToEnv(envList);

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
        gitRef,
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
        <div>
          {codeScan.isInitialLoading ? null : (
            <CodeScanInfo codeScan={codeScan.data} />
          )}
        </div>

        <FormGroup
          label="Databases"
          description="Aptible automatically handles configuring and managing databases for Elasticsearch, InfluxDB, MySQL, PostgreSQL, Redis and more."
        ></FormGroup>

        <form onSubmit={onSubmit}>
          <Group>
            {envList.some((e) => e.key.includes(DB_ENV_TEMPLATE_KEY)) ? (
              <Banner variant="warning">
                We have detected existing databases inside your App's config. Be
                sure you didn't already create the databases you require.
              </Banner>
            ) : null}

            <FormGroup
              label=""
              htmlFor="databases"
              feedbackVariant={dbErrors ? "danger" : "info"}
              feedbackMessage={dbErrors.map((e) => e.message).join(". ")}
            >
              <Group>
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
              </Group>
            </FormGroup>

            <hr />

            <EnvEditorFormInput
              envs={envs}
              setEnvs={setEnvs}
              errors={envErrors}
              previewEnv={previewEnv}
            />

            <hr />

            {codeScan.data?.procfile_present ? (
              <div>
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
              <div>
                <Button
                  onClick={() => setShowServiceCommands(true)}
                  variant="secondary"
                  disabled={codeScan.data?.procfile_present}
                >
                  <IconPlusCircle color="#fff" className="mr-2" variant="sm" />
                  Configure
                </Button>
              </div>
            )}

            <hr />

            <Button
              type="submit"
              className="w-full"
              isLoading={loader.isLoading}
            >
              Save & Deploy
            </Button>
          </Group>
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
  const dbs = useSelector((s) => selectDatabasesByEnvId(s, { envId }));
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
            {isOpen ? <IconChevronDown /> : <IconChevronRight />}
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
