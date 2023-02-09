import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useNavigate, useParams } from "react-router";
import { Link } from "react-router-dom";
import { useApi, useCache, useLoaderSuccess, useQuery } from "saga-query/react";
import { selectLoaderById } from "saga-query";

import { prettyDateTime } from "@app/date";
import {
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
  DeployDatabaseImage,
  DeployOperation,
  HalEmbedded,
} from "@app/types";

import { ListingPageLayout } from "../layouts";
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
} from "../shared";
import { AddSSHKeyForm } from "../shared/add-ssh-key";
import { createProject, deployProject, TextVal } from "@app/projects";
import {
  cancelAppOpsPoll,
  fetchAllStacks,
  fetchApp,
  fetchAppOperations,
  fetchEnvironment,
  pollAppOperations,
  selectAppById,
  selectEnvironmentById,
  selectStackPublicDefault,
} from "@app/deploy";
import {
  cancelEnvOperationsPoll,
  pollEnvOperations,
  selectLatestDeployOp,
  selectLatestScanOp,
  selectLatestSucceessScanOp,
  selectOperationsByEnvId,
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

export const CreateProjectLayout = () => {
  return (
    <ListingPageLayout>
      <div className="flex justify-center container">
        <div style={{ width: 700 }}>
          <Outlet />
        </div>
      </div>
    </ListingPageLayout>
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
          <h2 className={tokens.type.h3}>Add Aptible's Git Server</h2>
          <PreCode>
            git remote add aptible git@beta.aptible.com:{env.handle}/
            {app.handle}.git
          </PreCode>
        </div>
        <div className="mt-4">
          <h2 className={tokens.type.h3}>Push your code</h2>
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

export const CreateProjectGitSettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { appId = "" } = useParams();

  useQuery(fetchApp({ id: appId }));
  const app = useSelector((s: AppState) => selectAppById(s, { id: appId }));
  const { scanOp, codeScan, appOps } = useLatestCodeResults(appId);

  const query = useQuery(fetchAllDatabaseImages());
  const dbImages = useSelector(selectDatabaseImagesAsList);

  const [dbs, setDbs] = useState("postgresql=14");
  const [dbErrors, setDbErrors] = useState<ValidatorError[]>([]);
  const [envs, setEnvs] = useState(["STRIPE_SECRET_KEY=1234"].join("\n"));
  const [envErrors, setEnvErrors] = useState<ValidatorError[]>([]);
  const [cmds, setCmds] = useState(
    ["http:web=bundle exec rails server", "worker=bundle exec sidekiq"].join(
      "\n",
    ),
  );
  const loader = useSelector((s: AppState) =>
    selectLoaderById(s, { id: `${deployProject}` }),
  );
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
        cmds: [],
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
          "Loading code scan results ...."
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

            {query.isInitialLoading ? (
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

const Op = ({ op }: { op: DeployOperation }) => {
  const resource = op.resourceType;
  return (
    <div className="border-b-2 py-4">
      {resource}:{op.type} - {op.status}
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
  const { isInitialLoading } = useQuery(pollEnvOperations({ envId }));
  const ops = useSelector((s: AppState) =>
    selectOperationsByEnvId(s, { envId }),
  );

  const cancel = () => dispatch(cancelEnvOperationsPoll());
  useEffect(() => {
    cancel();
    dispatch(pollEnvOperations({ envId }));

    return () => {
      cancel();
    };
  }, [appId, envId]);

  return (
    <div>
      <div className="text-center">
        <h1 className={tokens.type.h1}>Deploying your code</h1>
        <p className="my-4 text-gray-600">Estimated wait time is 5 minutes.</p>
      </div>

      <FormNav prev={createProjectGitSettingsUrl(appId)} />
      <Box>
        <div className="border-b-2 py-4">
          <h2 className={tokens.type.h2}>{app.handle}</h2>
          <p>Text for URL</p>
        </div>

        {isInitialLoading ? (
          <Loading text="Provisioning resources ..." />
        ) : (
          <div>
            {ops.map((op) => {
              return <Op key={op.id} op={op} />;
            })}
          </div>
        )}
      </Box>
    </div>
  );
};
