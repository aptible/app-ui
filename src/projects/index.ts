import {
  all,
  call,
  fork,
  put,
  select,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
} from "saga-query";

import { ThunkCtx, thunks } from "@app/api";
import { createLog } from "@app/debug";
import {
  createAppOperation,
  createDeployApp,
  createDeployEnvironment,
  createServiceDefinition,
  fetchConfiguration,
  fetchDatabase,
  fetchDatabasesByEnvId,
  hasDeployApp,
  hasDeployEnvironment,
  provisionDatabase,
  selectAppById,
  selectDatabasesByEnvId,
  selectEnvironmentByName,
  waitForOperation,
} from "@app/deploy";
import { ApiGen, DeployApp } from "@app/types";

interface CreateProjectProps {
  name: string;
  stackId: string;
  orgId: string;
}

const log = createLog("project");

export const createProject = thunks.create<CreateProjectProps>(
  "create-project",
  function* (ctx, next): ApiGen {
    yield* put(setLoaderStart({ id: ctx.key }));

    if (!ctx.payload.stackId) {
      yield* put(
        setLoaderError({ id: ctx.key, message: "stack cannot be empty" }),
      );
      return;
    }

    if (!ctx.payload.name) {
      yield* put(
        setLoaderError({ id: ctx.key, message: "name cannot be empty" }),
      );
      return;
    }

    const env = yield* select(selectEnvironmentByName, {
      handle: ctx.payload.name,
    });

    let envId = "";
    if (hasDeployEnvironment(env)) {
      log("environment already exists, continuing", env);
      envId = env.id;
    } else {
      log("environment doesn't exist, creating");
      const envCtx = yield* call(
        createDeployEnvironment.run,
        createDeployEnvironment(ctx.payload),
      );

      if (!envCtx.json.ok) {
        yield* put(
          setLoaderError({ id: ctx.key, message: envCtx.json.data.message }),
        );
        return;
      }

      log(envCtx);
      envId = `${envCtx.json.data.id}`;
    }

    const appCtx = yield* call(
      createDeployApp.run,
      createDeployApp({ name: ctx.payload.name, envId }),
    );

    if (!appCtx.json.ok) {
      yield* put(
        setLoaderError({
          id: ctx.key,
          meta: { envId },
          message: appCtx.json.data.message,
        }),
      );
      return;
    }

    log(appCtx);
    const appId = appCtx.json.data.id;

    yield* put(
      setLoaderSuccess({
        id: ctx.key,
        meta: { envId, appId },
      }),
    );
    yield next();
  },
);

interface WaitDbProps {
  id: string;
  handle: string;
  connectionUrl: string;
}

function* waitForDb(opId: string, dbId: string): Iterator<any, WaitDbProps> {
  yield* call(waitForOperation, { id: opId, skipFetch: true });
  const res = yield* call(fetchDatabase.run, fetchDatabase({ id: dbId }));
  if (!res.json.ok) return { id: "", handle: "", connectionUrl: "" };

  return {
    id: `${res.json.data.id}`,
    handle: res.json.data.handle,
    connectionUrl: res.json.data.connection_url,
  };
}

export interface DbSelectorProps {
  id: string;
  imgId: string;
  name: string;
  env: string;
  dbType: string;
}

export interface TextVal<
  M extends { [key: string]: unknown } = {
    [key: string]: unknown;
  },
> {
  key: string;
  value: string;
  meta: M;
}

export interface CreateProjectSettingsProps {
  appId: string;
  envId: string;
  dbs: DbSelectorProps[];
  envs: TextVal[];
  curEnvs: { [key: string]: any };
  cmds: TextVal<{ id: string; http: boolean }>[];
  gitRef: string;
}

export const deployProject = thunks.create<CreateProjectSettingsProps>(
  "project-deploy",
  function* (ctx: ThunkCtx<CreateProjectSettingsProps>, next) {
    const { appId, envId, dbs, envs, cmds, gitRef, curEnvs } = ctx.payload;
    const id = ctx.name;
    yield put(setLoaderStart({ id }));

    const app: DeployApp = yield select(selectAppById, { id: appId });
    if (!hasDeployApp(app)) {
      const message = `no app found with id ${appId}, cannot deploy project`;
      log(message);
      yield put(setLoaderError({ id, message }));
      return;
    }

    if (!envId) {
      const message = "envId cannot be empty, cannot deploy project";
      log(message);
      yield put(setLoaderError({ id, message }));
      return;
    }

    // TODO - convert this to a series of updates where possible (currently information is agnostic)
    // create all the new ones
    yield* all(
      cmds.map((cmd) => {
        const processType = cmd.key;
        return call(
          createServiceDefinition.run,
          createServiceDefinition({
            appId,
            processType,
            command: cmd.value,
          }),
        );
      }),
    );

    const env: { [key: string]: any } = {};
    // the way to "remove" env vars from config is to set them as empty
    // so we do that here
    Object.keys(curEnvs).forEach((key) => {
      env[key] = "";
    });

    envs.forEach((e) => {
      env[e.key] = e.value;
    });
    // we want to also inject the db env vars with placeholders
    dbs.forEach((db) => {
      env[`${db.env}_TMP`] = `{{${db.name}}}`;
    });

    // Trigger configure operation now so we can store the env vars
    // immediately.
    yield* fork(function* () {
      yield* call(
        createAppOperation.run,
        createAppOperation({
          type: "configure",
          appId,
          env,
        }),
      );
    });

    const results = yield* all(
      dbs.map((db) => {
        const handle = db.name.toLocaleLowerCase();
        const dbType = db.dbType;

        return call(
          provisionDatabase.run,
          provisionDatabase({
            handle,
            type: dbType,
            envId,
            databaseImageId: db.imgId,
          }),
        );
      }),
    );

    /**
     * now we hot-swap db env vars for the actual connection url
     */

    const waiting = [];
    for (let i = 0; i < results.length; i += 1) {
      const res = results[i];
      if (!res.json) continue;

      const { opCtx, dbCtx, dbId } = res.json;
      if (!opCtx.json.ok) {
        yield put(setLoaderError({ id, message: opCtx.json.data.message }));
        continue;
      }

      if (dbCtx && !dbCtx.json.ok) {
        yield put(setLoaderError({ id, message: dbCtx.json.data.message }));
        continue;
      }

      waiting.push(call(waitForDb, `${opCtx.json.data.id}`, dbId));
    }

    yield* all(waiting);

    yield* call(
      updateEnvWithDbUrls.run,
      updateEnvWithDbUrls({ appId, envId, force: true }),
    );

    const deployCtx = yield* call(
      createAppOperation.run,
      createAppOperation({
        type: "deploy",
        appId,
        envId,
        gitRef,
      }),
    );

    if (!deployCtx.json.ok) {
      yield put(setLoaderError({ id, message: deployCtx.json.data.message }));
      return;
    }

    yield next();
    yield put(setLoaderSuccess({ id }));
  },
);

function* _updateEnvWithDbUrls({
  appId,
  env,
  dbs,
  force = false,
}: {
  appId: string;
  env: { [key: string]: any };
  dbs: WaitDbProps[];
  force?: boolean;
}) {
  let swapped = false;
  const nextEnv = { ...env };
  dbs.forEach((db) => {
    Object.keys(nextEnv).forEach((key) => {
      if (nextEnv[key] !== `{{${db.handle}}}`) return;
      nextEnv[key.replace("_TMP", "")] = db.connectionUrl;
      nextEnv[key] = "";
      swapped = true;
    });
  });

  // no-op
  if (!(force || swapped)) return;

  // finally trigger the operation to overwrite previous temporary
  // env vars with real ones
  const configureCtx = yield* call(
    createAppOperation.run,
    createAppOperation({
      type: "configure",
      appId,
      env: nextEnv,
    }),
  );

  if (!configureCtx.json.ok) return;
  yield* call(waitForOperation, {
    id: `${configureCtx.json.data.id}`,
    skipFetch: true,
  });
}

export const updateEnvWithDbUrls = thunks.create<{
  appId: string;
  envId: string;
  force?: boolean;
}>("update-env-with-db-urls", function* (ctx, next) {
  const { appId, envId, force = false } = ctx.payload;
  const id = ctx.name;
  const app = yield* select(selectAppById, { id: appId });

  const results = yield* all({
    dbs: call(fetchDatabasesByEnvId.run, fetchDatabasesByEnvId({ envId })),
    configure: call(
      fetchConfiguration.run,
      fetchConfiguration({ id: app.currentConfigurationId }),
    ),
  });

  if (!results.dbs.json.ok) {
    yield next();
    ctx.json = { message: "failed to fetch databases" };
    return;
  }

  if (!results.configure.json.ok) {
    yield next();
    ctx.json = { message: "failed to fetch app env vars" };
    return;
  }

  const dbs = yield* select(selectDatabasesByEnvId, { envId });

  yield* call(_updateEnvWithDbUrls, {
    appId,
    dbs,
    env: results.configure.json.data.env,
    force,
  });

  yield* put(setLoaderSuccess({ id }));
  yield next();
  ctx.json = { message: "success" };
});

export const redeployApp = thunks.create<{
  appId: string;
  envId: string;
  gitRef: string;
  force: boolean;
}>("redeploy-app", function* (ctx, next) {
  const id = ctx.name;
  yield* put(setLoaderStart({ id }));
  const result = yield* call(
    updateEnvWithDbUrls.run,
    updateEnvWithDbUrls(ctx.payload),
  );

  if (result.json.message !== "success") {
    yield* put(setLoaderError({ id, message: result.json.message }));
    yield next();

    return;
  }

  const deployCtx = yield* call(
    createAppOperation.run,
    createAppOperation({
      type: "deploy",
      appId: ctx.payload.appId,
      envId: ctx.payload.envId,
      gitRef: ctx.payload.gitRef,
    }),
  );
  if (!deployCtx.json.ok) {
    yield* put(setLoaderError({ id, message: deployCtx.json.data.message }));
    yield next();
    return;
  }

  yield* put(setLoaderSuccess({ id }));
});
