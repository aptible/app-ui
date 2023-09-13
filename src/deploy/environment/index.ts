import { createAction, createSelector } from "@reduxjs/toolkit";

import { PaginateProps, api, combinePages, thunks } from "@app/api";
import { latest, leading, poll, put, select } from "@app/fx";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import { selectOrganizationSelectedId } from "@app/organizations";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import {
  AppState,
  DeployEnvironment,
  LinkResponse,
  MapEntity,
  OnboardingStatus,
  excludesFalse,
} from "@app/types";

import { PermissionResponse } from "../permission";
import { selectDeploy } from "../slice";
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
    environment: LinkResponse;
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
      environment: { href: "" },
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
  containerCount: payload.container_count,
  domainCount: payload.domain_count,
  totalDiskSize: payload.total_disk_size,
  totalAppCount: payload.total_app_count,
  appContainerCount: payload.app_container_count,
  databaseContainerCount: payload.database_container_count,
  totalDatabaseCount: payload.total_database_count,
  sweetnessStack: payload.sweetness_stack,
  totalBackupSize: payload.total_backup_size,
  onboardingStatus: payload.onboarding_status,
  stackId: extractIdFromLink(payload._links.stack),
});

export const defaultDeployEnvironment = (
  e: Partial<DeployEnvironment> = {},
): DeployEnvironment => {
  const now = new Date().toISOString();
  return {
    id: "",
    organizationId: "",
    handle: "Unknown",
    createdAt: now,
    updatedAt: now,
    type: "development",
    activated: true,
    containerCount: 0,
    domainCount: 0,
    totalDiskSize: 0,
    totalAppCount: 0,
    totalDatabaseCount: 0,
    appContainerCount: 0,
    databaseContainerCount: 0,
    sweetnessStack: "",
    totalBackupSize: 0,
    stackId: "",
    onboardingStatus: "unknown",
    ...e,
  };
};

export const DEPLOY_ENVIRONMENT_NAME = "environments";
const slice = createTable<DeployEnvironment>({
  name: DEPLOY_ENVIRONMENT_NAME,
});
const {
  add: addDeployEnvironments,
  patch: patchDeployEnvironments,
  remove: removeEnvironments,
} = slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_ENVIRONMENT_NAME],
);
const initEnv = defaultDeployEnvironment();
const must = mustSelectEntity(initEnv);
export const selectEnvironmentById = must(selectors.selectById);
export const selectEnvironmentByIds = selectors.selectByIds;
export const { selectTable: selectEnvironments } = selectors;
const selectEnvironmentsAsList = selectors.selectTableAsList;
export const findEnvById = must(selectors.findById);

export const selectEnvironmentsByOrg = createSelector(
  selectEnvironmentsAsList,
  selectOrganizationSelectedId,
  (envs, orgId) => {
    if (orgId === "") return {};
    return envs
      .filter((env) => env.organizationId === orgId)
      .reduce<MapEntity<DeployEnvironment>>((acc, env) => {
        acc[env.id] = env;
        return acc;
      }, {});
  },
);

export const selectEnvironmentsByOrgAsList = createSelector(
  selectEnvironmentsByOrg,
  (envs) => Object.values(envs).filter(excludesFalse),
);

export const selectEnvironmentsAsOptions = createSelector(
  selectEnvironmentsByOrgAsList,
  (envs) => {
    return envs.map((e) => {
      return {
        label: e.handle,
        value: e.id,
      };
    });
  },
);
export const hasDeployEnvironment = (a: DeployEnvironment) => a.id !== "";
export const environmentReducers = createReducerMap(slice);
export const selectEnvironmentByName = createSelector(
  selectEnvironmentsAsList,
  (_: AppState, p: { handle: string }) => p.handle,
  (envs, handle) => {
    return envs.find((e) => e.handle === handle) || initEnv;
  },
);

export const fetchEnvironmentById = api.get<{ id: string }>("/accounts/:id");

export const fetchEnvironments = api.get<PaginateProps>(
  "/accounts?page=:page&per_page=5000",
  { saga: leading },
);
export const fetchAllEnvironments = thunks.create(
  "fetch-all-envs",
  { saga: leading },
  combinePages(fetchEnvironments),
);

export const cancelEnvPoll = createAction("cancel-env-poll");
export const pollEnvs = thunks.create(
  "poll-envs",
  { saga: poll(60 * 1000, `${cancelEnvPoll}`) },
  combinePages(fetchEnvironments),
);

export const fetchEnvironmentOperations = api.get<{ id: string }>(
  "/accounts/:id/operations",
  api.cache(),
);

export const deprovisionEnvironment = api.delete<{ id: string }>(
  ["/accounts/:id"],
  function* (ctx, next) {
    yield* next();
    ctx.actions.push(removeEnvironments([ctx.payload.id]));
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
  },
);

export interface CreateEnvProps {
  name: string;
  stackId: string;
  orgId: string;
}

const computeSearchMatch = (
  env: DeployEnvironment,
  search: string,
): boolean => {
  const handleMatch = env.handle.toLocaleLowerCase().includes(search);
  const idMatch = env.id === search;
  return handleMatch || idMatch;
};

export const selectEnvironmentsForTableSearch = createSelector(
  selectEnvironmentsByOrgAsList,
  (_: AppState, props: { search: string }) => props.search.toLocaleLowerCase(),
  (_: AppState, props: { stackId?: string }) => props.stackId || "",
  (envs, search, stackId): DeployEnvironment[] => {
    if (search === "" && stackId === "") {
      return envs;
    }

    return envs
      .filter((env) => {
        const searchMatch = computeSearchMatch(env, search);
        const stackIdMatch = stackId !== "" && env.stackId === stackId;
        if (stackId !== "") {
          if (search !== "") {
            return stackIdMatch && searchMatch;
          }
          return stackIdMatch;
        }
        return searchMatch;
      })
      .sort((a, b) => a.handle.localeCompare(b.handle));
  },
);

export const selectEnvironmentsByStackId = createSelector(
  selectEnvironmentsAsList,
  (_: AppState, props: { stackId: string }) => props.stackId,
  (envs, stackId) => {
    return envs
      .filter((env) => env.stackId === stackId)
      .sort((a, b) => a.id.localeCompare(b.id));
  },
);

export const selectEnvironmentsForTableSearchByStackId = createSelector(
  selectEnvironmentsByOrgAsList,
  (_: AppState, props: { search: string }) => props.search.toLocaleLowerCase(),
  (_: AppState, props: { stackId?: string }) => props.stackId || "",
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

export const selectEnvironmentsByStack = createSelector(
  selectEnvironmentsAsList,
  (_: AppState, p: { stackId: string }) => p.stackId,
  (envs, stackId) => {
    return envs.filter((env) => env.stackId === stackId);
  },
);

export const selectEnvironmentsCountByStack = createSelector(
  selectEnvironmentsByStack,
  (envs) => envs.length,
);

interface EnvPatch {
  id: string;
  status: OnboardingStatus;
}

export const updateDeployEnvironmentStatus = api.patch<EnvPatch>(
  "/accounts/:id",
  { saga: latest },
  function* (ctx, next) {
    const { id, status } = ctx.payload;
    const env = yield* select(selectEnvironmentById, { id });
    if (env.onboardingStatus === status) {
      return;
    }

    // optimistically update status to prevent this endpoint getting hit multiple times from the
    // create project git status view
    yield* put(patchDeployEnvironments({ [id]: { onboardingStatus: status } }));

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
  const stack = yield* select(selectStackById, { id: stackId });
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

  ctx.loader = { meta: { id: ctx.json.data.id } };
});

export const environmentEntities = {
  account: defaultEntity({
    id: "account",
    deserialize: deserializeDeployEnvironment,
    save: addDeployEnvironments,
  }),
};
