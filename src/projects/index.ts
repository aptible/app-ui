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
  createAppOperation,
  createDeployApp,
  createDeployEnvironment,
  hasDeployApp,
  hasDeployEnvironment,
  provisionDatabase,
  selectAppById,
  selectEnvironmentByName,
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
      envId = envCtx.json.data.id;
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
  gitRef: string;
}

export const deployProject = thunks.create<CreateProjectSettingsProps>(
  "project-deploy",
  function* (ctx: ThunkCtx<CreateProjectSettingsProps>, next) {
    const { appId, envId, dbs, envs, gitRef } = ctx.payload;
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

    yield all([
      call(
        createAppOperation.run,
        createAppOperation({
          type: "configure",
          appId,
          env: envs.reduce(
            (acc, env) => ({ ...acc, [env.key]: env.value }),
            {},
          ),
        }),
      ),

      call(
        createAppOperation.run,
        createAppOperation({ type: "deploy", appId, gitRef }),
      ),

      ...dbs
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
    ]);

    yield next();
    yield put(setLoaderSuccess({ id }));
  },
);
