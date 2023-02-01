import { nanoid } from "nanoid";
import {
  all,
  call,
  put,
  select,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
} from "saga-query";

import { createLog } from "@app/debug";
import { ThunkCtx, thunks } from "@app/api";
import {
  CreateAppCtx,
  CreateAppOpCtx,
  createAppOperation,
  createDeployApp,
  createDeployEnvironment,
  CreateEnvCtx,
  hasDeployApp,
  hasDeployEnvironment,
  provisionDatabase,
  ProvisionDatabaseCtx,
  selectAppById,
  selectEnvironmentByName,
} from "@app/deploy";
import { ApiGen, DeployApp, DeployEnvironment } from "@app/types";

interface CreateProjectProps {
  name: string;
  stackId: string;
  orgId: string;
}

const log = createLog("project");

export const createProject = thunks.create<CreateProjectProps>(
  "create-project",
  function* (ctx: ThunkCtx<CreateProjectProps>, next): ApiGen {
    if (!ctx.payload.stackId) {
      setLoaderError({ id: ctx.key, message: "stack cannot be empty" });
      return;
    }

    if (!ctx.payload.name) {
      setLoaderError({ id: ctx.key, message: "name cannot be empty" });
      return;
    }

    yield put(setLoaderStart({ id: ctx.key }));

    const env: DeployEnvironment = yield select(selectEnvironmentByName, {
      handle: ctx.payload.name,
    });

    let envId = "";
    if (hasDeployEnvironment(env)) {
      log("environment already exists, continuing", env);
      envId = env.id;
    } else {
      log("environment doesn't exist, creating");
      const envCtx: CreateEnvCtx = yield call(
        createDeployEnvironment.run,
        createDeployEnvironment(ctx.payload),
      );

      if (!envCtx.json.ok) {
        yield put(
          setLoaderError({ id: ctx.key, message: envCtx.json.data.message }),
        );
        return;
      }

      log(envCtx);
      envId = envCtx.json.data.id;
    }

    const appCtx: CreateAppCtx = yield call(
      createDeployApp.run,
      createDeployApp({ name: ctx.payload.name, envId }),
    );

    if (!appCtx.json.ok) {
      yield put(
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

    yield put(
      setLoaderSuccess({
        id: ctx.key,
        meta: { envId, appId },
      }),
    );
    yield next();
  },
);

export interface TextVal<
  M extends { [key: string]: string } = { [key: string]: string },
> {
  key: string;
  value: string;
  meta?: M;
}

export interface CreateProjectSettingsProps {
  appId: string;
  envId: string;
  dbs: TextVal<{ id: string }>[];
  envs: TextVal[];
  cmds: TextVal[];
}

export const deployProject = thunks.create<CreateProjectSettingsProps>(
  "project-deploy",
  function* (ctx: ThunkCtx<CreateProjectSettingsProps>, next) {
    const { appId, envId, dbs, envs } = ctx.payload;
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

    const dbCtx: ProvisionDatabaseCtx[] = yield all(
      dbs
        .filter((db) => db.meta?.id)
        .map((db) => {
          const handle = `${app.handle}-${db.key}-${nanoid(5)}`;
          return call(
            provisionDatabase.run,
            provisionDatabase({
              handle: handle.toLocaleLowerCase(),
              type: db.key,
              envId,
              databaseImageId: db.meta?.id || "",
            }),
          );
        }),
    );

    log(dbCtx);

    const configCtx: CreateAppOpCtx = yield call(
      createAppOperation.run,
      createAppOperation({
        appId,
        env: envs.reduce((acc, env) => ({ ...acc, [env.key]: env.value }), {}),
      }),
    );

    log(configCtx);

    yield next();
    yield put(setLoaderSuccess({ id }));
  },
);
