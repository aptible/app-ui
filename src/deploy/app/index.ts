import { api, cacheMinTimer, thunks } from "@app/api";
import { call, select } from "@app/fx";
import { createSelector } from "@app/fx";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import { selectOrganizationSelectedId } from "@app/organizations";
import { WebState, schema } from "@app/schema";
import { findSourceById, selectSources } from "@app/source";
import type {
  DeployApp,
  DeployAppConfigEnv,
  DeployOperation,
  DeployServiceResponse,
  Deployment,
  LinkResponse,
  ProvisionableStatus,
} from "@app/types";
import {
  findEnvById,
  hasDeployEnvironment,
  selectEnvironments,
  selectEnvironmentsByOrg,
} from "../environment";
import { DeployImageResponse } from "../image";
import { DeployOperationResponse, waitForOperation } from "../operation";
import { selectServiceById } from "../service";
import { findStackById, selectStacks } from "../stack";

export * from "./utils";

export interface DeployAppResponse {
  id: number;
  handle: string;
  git_repo: string;
  created_at: string;
  updated_at: string;
  deployment_method: string;
  status: ProvisionableStatus;
  _links: {
    account: LinkResponse;
    current_configuration: LinkResponse;
    current_deployment: LinkResponse;
    current_image: LinkResponse;
    current_source: LinkResponse;
  };
  _embedded: {
    // TODO: fill in
    services: DeployServiceResponse[] | null;
    current_image: DeployImageResponse | null;
    last_deploy_operation: DeployOperationResponse | null;
    last_operation: DeployOperationResponse | null;
  };
  _type: "app";
}

export const defaultAppResponse = (
  p: Partial<DeployAppResponse> = {},
): DeployAppResponse => {
  const now = new Date().toISOString();
  return {
    id: 1,
    handle: "",
    git_repo: "",
    created_at: now,
    updated_at: now,
    deployment_method: "",
    status: "provisioned",
    _links: {
      account: { href: "" },
      current_configuration: { href: "" },
      current_deployment: { href: "" },
      current_image: { href: "" },
      current_source: { href: "" },
      ...p._links,
    },
    _embedded: {
      services: [],
      current_image: null,
      last_deploy_operation: null,
      last_operation: null,
      ...p._embedded,
    },
    ...p,
    _type: "app",
  };
};

export const deserializeDeployApp = (payload: DeployAppResponse): DeployApp => {
  const links = payload._links;

  return {
    id: `${payload.id}`,
    handle: payload.handle,
    gitRepo: payload.git_repo,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    deploymentMethod: payload.deployment_method,
    status: payload.status,
    environmentId: extractIdFromLink(links.account),
    currentConfigurationId: extractIdFromLink(links.current_configuration),
    currentDeploymentId: extractIdFromLink(links.current_deployment) || "1",
    currentImageId: extractIdFromLink(links.current_image),
    currentSourceId: extractIdFromLink(links.current_source),
  };
};

export const hasDeployApp = (a: DeployApp) => a.id !== "";
export const selectAppById = schema.apps.selectById;
export const selectApps = schema.apps.selectTable;
const selectAppsAsList = schema.apps.selectTableAsList;
export const findAppById = schema.apps.findById;

export interface DeployAppRow extends DeployApp {
  envHandle: string;
  currentDeployment: Deployment;
  gitRef: string;
  gitCommitSha: string;
  dockerImageName: string;
  lastOperation: DeployOperation;
  lastDeployed: string;
  cost: number;
  totalCPU: number;
  totalMemoryLimit: number;
  totalServices: number;
}

export const selectAppsByEnvId = createSelector(
  selectAppsAsList,
  (_: WebState, props: { envId: string }) => props.envId,
  (apps, envId) => {
    return apps.filter((app) => app.environmentId === envId);
  },
);

export const selectFirstAppByEnvId = createSelector(
  selectAppsByEnvId,
  (apps) => apps[0] || schema.apps.empty,
);

export const selectAppsByOrgAsList = createSelector(
  selectAppsAsList,
  selectEnvironmentsByOrg,
  selectOrganizationSelectedId,
  (apps, envs) => {
    return apps.filter((app) => {
      const env = findEnvById(envs, { id: app.environmentId });
      return hasDeployEnvironment(env);
    });
  },
);

export const selectAppsByEnvOnboarding = createSelector(
  selectEnvironments,
  selectAppsByOrgAsList,
  (envs, apps) => {
    return apps.filter((app) => {
      const env = findEnvById(envs, { id: app.environmentId });
      if (!hasDeployEnvironment(env)) {
        return false;
      }
      if (env.onboardingStatus === "unknown") {
        return false;
      }

      return true;
    });
  },
);

export const selectAppsByStack = createSelector(
  selectAppsAsList,
  selectEnvironments,
  (_: WebState, p: { stackId: string }) => p.stackId,
  (apps, envs, stackId) => {
    return apps.filter((app) => {
      const env = findEnvById(envs, { id: app.environmentId });
      return env.stackId === stackId;
    });
  },
);

export const selectAppsCountByStack = createSelector(
  selectAppsByStack,
  (apps) => apps.length,
);

export const selectAppsBySource = createSelector(
  selectAppsAsList,
  selectSources,
  (_: WebState, p: { sourceId: string }) => p.sourceId,
  (apps, sources, sourceId) => {
    return apps.filter((app) => {
      const source = findSourceById(sources, { id: app.currentSourceId });
      return source.id === sourceId;
    });
  },
);

export const selectAppsCountBySource = createSelector(
  selectAppsBySource,
  (apps) => apps.length,
);

export const fetchApps = api.get(
  "/apps?per_page=5000&no_embed=true",
  {
    supervisor: cacheMinTimer(),
  },
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }
    yield* schema.update(schema.apps.reset());
  },
);

export const selectEnvironmentByAppId = createSelector(
  selectEnvironments,
  selectAppById,
  (envs, app) => {
    return findEnvById(envs, { id: app.environmentId });
  },
);

export const selectStackByAppId = createSelector(
  selectStacks,
  selectEnvironmentByAppId,
  (stacks, env) => {
    return findStackById(stacks, { id: env.stackId });
  },
);

export const selectAppByServiceId = createSelector(
  selectServiceById,
  selectApps,
  (service, apps) => {
    return findAppById(apps, { id: service.appId });
  },
);

interface AppIdProp {
  id: string;
}

export const fetchApp = api.get<AppIdProp>("/apps/:id");

interface CreateAppProps {
  name: string;
  envId: string;
}

export const createDeployApp = api.post<CreateAppProps, DeployAppResponse>(
  "/accounts/:envId/apps",
  function* (ctx, next) {
    const { name, envId } = ctx.payload;
    const body = {
      handle: name,
      account_id: envId,
    };
    ctx.request = ctx.req({
      body: JSON.stringify(body),
    });

    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    ctx.loader = { meta: { appId: ctx.json.value.id } };
  },
);

interface ScanAppOpProps {
  type: "scan_code";
  envId: string;
  appId: string;
  gitRef: string;
}
interface DeployAppOpProps {
  type: "deploy";
  envId: string;
  appId: string;
  gitRef: string;
}
interface ConfigAppOpProps {
  type: "configure";
  appId: string;
  env: DeployAppConfigEnv;
}

interface DeprovisionAppOpProps {
  type: "deprovision";
  appId: string;
}

type AppOpProps =
  | ScanAppOpProps
  | DeployAppOpProps
  | DeprovisionAppOpProps
  | ConfigAppOpProps;
export const createAppOperation = api.post<AppOpProps, DeployOperationResponse>(
  "/apps/:appId/operations",
  function* (ctx, next) {
    const { type } = ctx.payload;

    const getBody = () => {
      switch (type) {
        case "deprovision": {
          return { type };
        }

        case "deploy":
        case "scan_code": {
          const { gitRef } = ctx.payload;
          return { type, git_ref: gitRef };
        }

        case "configure": {
          const { env } = ctx.payload;
          return { type, env };
        }

        default:
          return {};
      }
    };

    const body = getBody();
    ctx.request = ctx.req({ body: JSON.stringify(body) });
    yield* next();
  },
);

export const appEntities = {
  app: defaultEntity({
    id: "app",
    deserialize: deserializeDeployApp,
    save: schema.apps.add,
  }),
};

export const restartApp = api.post<{ id: string }, DeployOperationResponse>(
  ["/apps/:id/operations", "restart"],
  function* (ctx, next) {
    const { id } = ctx.payload;
    const body = {
      type: "restart",
      id,
    };

    ctx.request = ctx.req({ body: JSON.stringify(body) });
    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    const opId = ctx.json.value.id;
    ctx.loader = {
      message: `Restart app operation queued (operation ID: ${opId})`,
      meta: { opId: `${opId}` },
    };
  },
);

export const deprovisionApp = thunks.create<{
  appId: string;
}>("deprovision-app", function* (ctx, next) {
  const { appId } = ctx.payload;
  yield* select((s: WebState) => selectAppById(s, { id: appId }));

  const deprovisionCtx = yield* call(() =>
    createAppOperation.run(
      createAppOperation({
        type: "deprovision",
        appId,
      }),
    ),
  );

  if (!deprovisionCtx.json.ok) {
    return;
  }
  const id = `${deprovisionCtx.json.value.id}`;
  yield* call(() => waitForOperation({ id }));
  yield* next();
});

interface UpdateApp {
  id: string;
  handle: string;
}

export const updateApp = api.put<UpdateApp>("/apps/:id", function* (ctx, next) {
  const { handle } = ctx.payload;
  const body = {
    handle,
  };
  ctx.request = ctx.req({ body: JSON.stringify(body) });

  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  ctx.loader = {
    message: "Saved changes successfully!",
  };
});
