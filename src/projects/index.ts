import { thunks } from "@app/api";
import { createLog } from "@app/debug";
import {
  type DbCreatorProps,
  configEnvListToEnv,
  createAppOperation,
  createDeployApp,
  createDeployEnvironment,
  createServiceDefinition,
  fetchApp,
  fetchConfiguration,
  fetchDatabase,
  fetchDatabasesByEnvId,
  hasDeployApp,
  hasDeployEnvironment,
  mapCreatorToProvision,
  provisionDatabase,
  selectAppById,
  selectDatabasesByEnvId,
  selectEnvironmentByName,
  updateDeployEnvironmentStatus,
  waitForOperation,
} from "@app/deploy";
import { type Operation, call, parallel, put, select } from "@app/fx";
import { type WebState, schema } from "@app/schema";
import type { TextVal } from "@app/string-utils";
import type { DeployApp } from "@app/types";

interface CreateProjectProps {
  name: string;
  stackId: string;
  orgId: string;
}

const log = createLog("project");

export const DB_ENV_TEMPLATE_KEY = "_TMP";
export const getDbEnvTemplateKey = (envKey: string) =>
  `${envKey}${DB_ENV_TEMPLATE_KEY}`;
export const getDbEnvTemplateValue = (dbHandle: string) => `{{${dbHandle}}}`;

export const createProject = thunks.create<CreateProjectProps>(
  "create-project",
  function* (ctx, next) {
    yield* schema.update(schema.loaders.start({ id: ctx.key }));

    if (!ctx.payload.stackId) {
      yield* schema.update(
        schema.loaders.error({ id: ctx.key, message: "stack cannot be empty" }),
      );
      return;
    }

    if (!ctx.payload.name) {
      yield* schema.update(
        schema.loaders.error({ id: ctx.key, message: "name cannot be empty" }),
      );
      return;
    }

    const env = yield* select((s: WebState) =>
      selectEnvironmentByName(s, {
        handle: ctx.payload.name,
      }),
    );

    let envId = "";
    if (hasDeployEnvironment(env)) {
      log("environment already exists, continuing", env);
      envId = env.id;
    } else {
      log("environment doesn't exist, creating");
      const envCtx = yield* call(() =>
        createDeployEnvironment.run(createDeployEnvironment(ctx.payload)),
      );

      if (!envCtx.json.ok) {
        const data = envCtx.json.error;
        yield* schema.update(
          schema.loaders.error({ id: ctx.key, message: data.message }),
        );
        return;
      }

      log(envCtx);
      envId = `${envCtx.json.value.id}`;
    }

    const appCtx = yield* call(() =>
      createDeployApp.run(createDeployApp({ name: ctx.payload.name, envId })),
    );

    if (!appCtx.json.ok) {
      const data = appCtx.json.error;
      yield* schema.update(
        schema.loaders.error({
          id: ctx.key,
          message: data.message,
          meta: { envId } as any,
        }),
      );
      return;
    }

    log(appCtx);
    const appId = appCtx.json.value.id;

    yield* schema.update(
      schema.loaders.success({
        id: ctx.key,
        meta: { envId, appId } as any,
      }),
    );
    yield* next();
  },
);

interface WaitDbProps {
  id: string;
  handle: string;
  connectionUrl: string;
}

function* waitForDb(opId: string, dbId: string): Operation<WaitDbProps> {
  yield* call(() => waitForOperation({ id: opId, skipFetch: true }));
  const res = yield* call(() => fetchDatabase.run(fetchDatabase({ id: dbId })));
  if (!res.json.ok) return { id: "", handle: "", connectionUrl: "" };

  return {
    id: `${res.json.value.id}`,
    handle: res.json.value.handle,
    connectionUrl: res.json.value.connection_url,
  };
}

export interface CreateProjectSettingsProps {
  appId: string;
  envId: string;
  dbs: DbCreatorProps[];
  envs: TextVal[];
  curEnvs: { [key: string]: any };
  cmds: TextVal<{ id: string; http: boolean }>[];
  gitRef: string;
}

export const deployProject = thunks.create<CreateProjectSettingsProps>(
  "project-deploy",
  function* (ctx, next) {
    const { appId, envId, dbs, envs, cmds, gitRef, curEnvs } = ctx.payload;
    const id = ctx.name;
    yield* schema.update(schema.loaders.start({ id }));

    const app: DeployApp = yield* select((s: WebState) =>
      selectAppById(s, { id: appId }),
    );
    if (!hasDeployApp(app)) {
      const message = `no app found with id ${appId}, cannot deploy project`;
      log(message);
      yield* schema.update(schema.loaders.error({ id, message }));
      return;
    }

    if (!envId) {
      const message = "envId cannot be empty, cannot deploy project";
      log(message);
      yield* schema.update(schema.loaders.error({ id, message }));
      return;
    }

    // optimistically mark `account.onboarding_state=completed`
    // this is not great but waiting for all ops to complete is riddled
    // with edge cases and weird scenarios (e.g. user closes app)
    yield* put(
      updateDeployEnvironmentStatus({ id: envId, status: "completed" }),
    );

    // TODO - convert this to a series of updates where possible (currently information is agnostic)
    // create all the new ones
    const group = yield* parallel(
      cmds.map((cmd) => {
        const processType = cmd.key;
        return () =>
          createServiceDefinition.run(
            createServiceDefinition({
              appId,
              processType,
              command: cmd.value,
            }),
          );
      }),
    );
    yield* group;

    const env = configEnvListToEnv(envs, curEnvs);
    // we want to also inject the db env vars with placeholders
    dbs.forEach((db) => {
      env[`${db.env}${DB_ENV_TEMPLATE_KEY}`] = getDbEnvTemplateValue(db.name);
    });

    let configureOpId = "";
    const shouldConfigure = Object.keys(env).length > 0;
    if (shouldConfigure) {
      // Trigger configure operation now so we can store the env vars
      // immediately.
      const configCtx = yield* call(() =>
        createAppOperation.run(
          createAppOperation({
            type: "configure",
            appId,
            env,
          }),
        ),
      );

      if (!configCtx.json.ok) {
        const data = configCtx.json.error;
        yield* schema.update(
          schema.loaders.error({ id, message: data.message }),
        );
        return;
      }
      const data = configCtx.json.value;
      configureOpId = `${data.id}`;
    }

    const groupDb = yield* parallel(
      dbs.map((db) => {
        return () =>
          provisionDatabase.run(
            provisionDatabase(mapCreatorToProvision(envId, db)),
          );
      }),
    );
    const results = yield* groupDb;

    if (shouldConfigure) {
      // when creating a standalone app with no databases to provision
      // we don't want to deploy an app until the config operation completes
      yield* call(() => waitForOperation({ id: configureOpId }));
    }

    // fetch app to get latest configuration id
    yield* call(() => fetchApp.run(fetchApp({ id: appId })));

    /**
     * now we hot-swap db env vars for the actual connection url
     */

    const waiting = [];
    for (let i = 0; i < results.length; i += 1) {
      const res = results[i];
      if (!res.ok) continue;
      const json = res.value.json;
      if (!json) continue;

      if (json.error) {
        yield* schema.update(schema.loaders.error({ id, message: json.error }));
        continue;
      }

      const { opCtx, dbCtx, dbId } = json;
      if (opCtx && !opCtx.json.ok) {
        yield* schema.update(
          schema.loaders.error({ id, message: opCtx.json.error.message }),
        );
        continue;
      }

      if (dbCtx && !dbCtx.json.ok) {
        yield* schema.update(
          schema.loaders.error({ id, message: dbCtx.json.error.message }),
        );
        continue;
      }

      const result = opCtx?.json;
      if (result?.ok) {
        waiting.push(() => waitForDb(`${result?.value.id}`, dbId));
      }
    }

    const groupWait = yield* parallel(waiting);
    yield* groupWait;

    yield* call(() =>
      updateEnvWithDbUrls.run(
        updateEnvWithDbUrls({ appId, envId, force: true }),
      ),
    );

    if (gitRef) {
      const deployCtx = yield* call(() =>
        createAppOperation.run(
          createAppOperation({
            type: "deploy",
            appId,
            envId,
            gitRef,
          }),
        ),
      );

      if (!deployCtx.json.ok) {
        const data = deployCtx.json.error;
        yield* schema.update(
          schema.loaders.error({ id, message: data.message }),
        );
        return;
      }
    }

    yield* next();
    yield* schema.update(schema.loaders.success({ id }));
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
      if (nextEnv[key] !== getDbEnvTemplateValue(db.handle)) return;
      nextEnv[key.replace(DB_ENV_TEMPLATE_KEY, "")] = db.connectionUrl;
      nextEnv[key] = "";
      swapped = true;
    });
  });

  // no-op
  if (!(force || swapped)) return;

  // finally trigger the operation to overwrite previous temporary
  // env vars with real ones
  const configureCtx = yield* call(() =>
    createAppOperation.run(
      createAppOperation({
        type: "configure",
        appId,
        env: nextEnv,
      }),
    ),
  );

  if (!configureCtx.json.ok) return;
  const id = `${configureCtx.json.value.id}`;
  yield* call(() =>
    waitForOperation({
      id,
      skipFetch: true,
    }),
  );
}

export const updateEnvWithDbUrls = thunks.create<{
  appId: string;
  envId: string;
  force?: boolean;
}>("update-env-with-db-urls", function* (ctx, next) {
  const { appId, envId, force = false } = ctx.payload;
  const id = ctx.name;
  const app = yield* select((s: WebState) => selectAppById(s, { id: appId }));

  const dbCtx = yield* call(() =>
    fetchDatabasesByEnvId.run(fetchDatabasesByEnvId({ envId })),
  );
  const configCtx = yield* call(() =>
    fetchConfiguration.run(
      fetchConfiguration({ id: app.currentConfigurationId }),
    ),
  );

  if (!dbCtx.json.ok) {
    yield* next();
    ctx.json = { message: "failed to fetch databases" };
    return;
  }

  if (!configCtx.json.ok) {
    yield* next();
    ctx.json = { message: "failed to fetch app env vars" };
    return;
  }

  const env = configCtx.json.value.env || {};
  const dbs = yield* select((s: WebState) =>
    selectDatabasesByEnvId(s, { envId }),
  );
  yield* call(() =>
    _updateEnvWithDbUrls({
      appId,
      dbs,
      env,
      force,
    }),
  );

  yield* schema.update(schema.loaders.success({ id }));
  yield* next();
  ctx.json = { message: "success" };
});

export const redeployApp = thunks.create<{
  appId: string;
  envId: string;
  gitRef: string;
  force: boolean;
}>("redeploy-app", function* (ctx, next) {
  yield* schema.update(schema.loaders.resetByIds([`${deployProject}`]));
  const id = ctx.name;
  yield* schema.update(schema.loaders.start({ id }));
  const result = yield* call(() =>
    updateEnvWithDbUrls.run(updateEnvWithDbUrls(ctx.payload)),
  );

  if (result.json.message !== "success") {
    yield* schema.update(
      schema.loaders.error({ id, message: result.json.message }),
    );
    yield* next();

    return;
  }

  const deployCtx = yield* call(() =>
    createAppOperation.run(
      createAppOperation({
        type: "deploy",
        appId: ctx.payload.appId,
        envId: ctx.payload.envId,
        gitRef: ctx.payload.gitRef,
      }),
    ),
  );
  if (!deployCtx.json.ok) {
    const data = deployCtx.json.error;
    yield* schema.update(schema.loaders.error({ id, message: data.message }));
    yield* next();
    return;
  }

  yield* schema.update(
    schema.loaders.success({ id, message: "Redeploy initiated" }),
  );
});
