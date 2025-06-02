import { api, cacheMinTimer } from "@app/api";
import { createSelector } from "@app/fx";
import { select, takeLatest } from "@app/fx";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import { selectOrganizationSelectedId } from "@app/organizations";
import { type WebState, schema } from "@app/schema";
import {
  type DeployEnvironment,
  type DeployEnvironmentStats,
  type LinkResponse,
  type OnboardingStatus,
  excludesFalse,
} from "@app/types";
import type { PermissionResponse } from "../permission";
import { hasDeployStack, selectStackById } from "../stack";

export interface DeployEnvironmentResponse {
  id: number;
  organization_id: string;
  handle: string;
  created_at: string;
  updated_at: string;
  type: "production" | "development";
  activated: boolean;
  container_count: number;
  domain_count: number;
  total_disk_size: number;
  total_app_count: number;
  app_container_count: number;
  database_container_count: number;
  total_database_count: number;
  sweetness_stack: string;
  total_backup_size: number;
  onboarding_status: OnboardingStatus;
  _embedded: {
    permissions: PermissionResponse[];
  };
  _links: {
    stack: LinkResponse;
  };
  _type: "account";
}

export const defaultEnvResponse = (
  e: Partial<DeployEnvironmentResponse> = {},
): DeployEnvironmentResponse => {
  const now = new Date().toISOString();
  return {
    id: 1,
    organization_id: "",
    handle: "",
    created_at: now,
    updated_at: now,
    type: "development",
    activated: true,
    container_count: 0,
    domain_count: 0,
    total_disk_size: 0,
    total_app_count: 0,
    app_container_count: 0,
    database_container_count: 0,
    total_database_count: 0,
    sweetness_stack: "",
    total_backup_size: 0,
    onboarding_status: "unknown",
    _embedded: {
      permissions: [],
    },
    _links: {
      stack: { href: "" },
      ...e._links,
    },
    _type: "account",
    ...e,
  };
};

export const deserializeDeployEnvironment = (
  payload: DeployEnvironmentResponse,
): DeployEnvironment => ({
  id: `${payload.id}`,
  organizationId: payload.organization_id,
  handle: payload.handle,
  createdAt: payload.created_at,
  updatedAt: payload.updated_at,
  type: payload.type,
  activated: payload.activated,
  sweetnessStack: payload.sweetness_stack,
  onboardingStatus: payload.onboarding_status,
  stackId: extractIdFromLink(payload._links.stack),
  totalAppCount: payload.total_app_count,
  totalDatabaseCount: payload.total_database_count,
});

export const deserializeDeployEnvironmentStats = (
  env: DeployEnvironmentResponse,
): DeployEnvironmentStats => {
  return {
    id: `${env.id}`,
    containerCount: env.container_count,
    domainCount: env.domain_count,
    totalDiskSize: env.total_disk_size,
    appContainerCount: env.app_container_count,
    databaseContainerCount: env.database_container_count,
    totalBackupSize: env.total_backup_size,
  };
};

export const selectEnvironmentById = schema.environments.selectById;
export const selectEnvironmentByIds = schema.environments.selectByIds;
export const selectEnvironments = schema.environments.selectTable;
export const selectEnvironmentsAsList = schema.environments.selectTableAsList;
export const findEnvById = schema.environments.findById;
export const selectEnvironmentStatsById = schema.environmentStats.selectById;
export const findEnvironmentsByStackId = (
  envs: DeployEnvironment[],
  stackId: string,
) => envs.filter((env) => env.stackId === stackId);

export const selectEnvironmentsByOrg = createSelector(
  selectEnvironmentsAsList,
  selectOrganizationSelectedId,
  (envs, orgId) => {
    if (orgId === "") return {};
    return envs
      .filter((env) => env.organizationId === orgId)
      .reduce<Record<string, DeployEnvironment>>((acc, env) => {
        acc[env.id] = env;
        return acc;
      }, {});
  },
);

export const isPhiAllowed = (env: DeployEnvironment): boolean => {
  return env.type === "production";
};

export const selectEnvironmentsByOrgAsList = createSelector(
  selectEnvironmentsByOrg,
  (envs) => Object.values(envs).filter(excludesFalse),
);

export const envToOption = (
  env: DeployEnvironment,
): { label: string; value: string } => {
  return {
    label: env.handle,
    value: env.id,
  };
};

export const hasDeployEnvironment = (a: DeployEnvironment) => a.id !== "";
export const selectEnvironmentByName = createSelector(
  selectEnvironmentsAsList,
  (_: WebState, p: { handle: string }) => p.handle,
  (envs, handle) => {
    return envs.find((e) => e.handle === handle) || schema.environments.empty;
  },
);

export const fetchEnvironmentById = api.get<
  { id: string },
  DeployEnvironmentResponse
>("/accounts/:id", function* (ctx, next) {
  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  const stats = deserializeDeployEnvironmentStats(ctx.json.value);
  yield* schema.update(schema.environmentStats.add({ [stats.id]: stats }));
});

export const fetchEnvironments = api.get(
  "/accounts?per_page=5000&no_embed=true&metrics[]=app_count&metrics[]=database_count",
  {
    supervisor: cacheMinTimer(),
  },
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }
    yield* schema.update(schema.environments.reset());
  },
);

export const deprovisionEnvironment = api.delete<{ id: string }>(
  ["/accounts/:id"],
  function* (ctx, next) {
    yield* next();
    yield* schema.update(schema.environments.remove([ctx.payload.id]));
  },
);

export const updateEnvironmentName = api.patch<{ id: string; handle: string }>(
  ["/accounts/:id", "update-name"],
  function* (ctx, next) {
    const body = {
      handle: ctx.payload.handle,
    };
    ctx.request = ctx.req({ body: JSON.stringify(body) });
    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    ctx.loader = {
      message: "Saved changes successfully!",
    };
  },
);

export interface CreateEnvProps {
  name: string;
  stackId: string;
  orgId: string;
}

export const selectEnvironmentsByStackId = createSelector(
  selectEnvironmentsAsList,
  (_: WebState, props: { stackId?: string }) => props.stackId || "",
  (envs, stackId) => {
    if (stackId === "") {
      return [...envs].sort((a, b) => a.id.localeCompare(b.id));
    }

    return envs
      .filter((env) => env.stackId === stackId)
      .sort((a, b) => a.id.localeCompare(b.id));
  },
);

export const selectEnvironmentsForTableSearchByStackId = createSelector(
  selectEnvironmentsByOrgAsList,
  (_: WebState, props: { search: string }) => props.search.toLocaleLowerCase(),
  (_: WebState, props: { stackId?: string }) => props.stackId || "",
  (envs, search, stackId): DeployEnvironment[] => {
    if (search === "") {
      return envs;
    }

    return envs
      .filter((env) => {
        if (env.stackId !== stackId) return false;
        const handleMatch = env.handle.toLocaleLowerCase().includes(search);
        const idMatch = env.id === search;

        return handleMatch || idMatch;
      })
      .sort((a, b) => a.handle.localeCompare(b.handle));
  },
);

interface EnvPatch {
  id: string;
  status: OnboardingStatus;
}

export const updateDeployEnvironmentStatus = api.patch<EnvPatch>(
  "/accounts/:id",
  { supervisor: takeLatest },
  function* (ctx, next) {
    const { id, status } = ctx.payload;
    const env = yield* select((s: WebState) =>
      selectEnvironmentById(s, { id }),
    );
    if (env.onboardingStatus === status) {
      return;
    }

    // optimistically update status to prevent this endpoint getting hit multiple times from the
    // create project git status view
    yield* schema.update(
      schema.environments.patch({ [id]: { onboardingStatus: status } }),
    );

    const body = {
      onboarding_status: status,
    };

    ctx.request = ctx.req({
      body: JSON.stringify(body),
    });

    yield* next();
  },
);

export const createDeployEnvironment = api.post<
  CreateEnvProps,
  DeployEnvironmentResponse
>("/accounts", function* (ctx, next) {
  const { name, stackId, orgId } = ctx.payload;
  const stack = yield* select((s: WebState) =>
    selectStackById(s, { id: stackId }),
  );
  const body: Record<string, string> = {
    handle: name,
    organization_id: orgId,
    type: stack.organizationId ? "production" : "development",
    onboarding_status: "initiated",
  };

  if (hasDeployStack(stack)) {
    body.stack_id = stackId;
  }

  ctx.request = ctx.req({
    body: JSON.stringify(body),
  });

  yield* next();
  if (!ctx.json.ok) return;

  ctx.loader = { meta: { id: ctx.json.value.id } };
});

export const environmentEntities = {
  account: defaultEntity({
    id: "account",
    deserialize: deserializeDeployEnvironment,
    save: schema.environments.add,
  }),
};
