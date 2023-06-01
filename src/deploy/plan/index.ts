import { selectDeploy } from "../slice";
import { api, thunks } from "@app/api";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import { capitalize } from "@app/string-utils";
import {
  AppState,
  DeployActivePlan,
  DeployPlan,
  LinkResponse,
  PlanName,
} from "@app/types";
import { createSelector } from "@reduxjs/toolkit";
import {
  call,
  put,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
} from "saga-query";

export interface DeployPlanResponse {
  id: number;
  automated_backup_limit_per_db: number;
  compliance_dashboard_access: boolean;
  container_memory_limit: number;
  cost_cents: number;
  cpu_allowed_profiles: any;
  created_at: string;
  disk_limit: number;
  environment_limit?: number;
  ephemeral_session_limit: number;
  included_container_mb: number;
  included_disk_gb: number;
  included_vhosts: number;
  manual_backup_limit_per_db: number;
  name: string;
  updated_at: string;
  vhost_limit: number;
  _type: "plan";
}

export interface DeployActivePlanResponse {
  id: number;
  automated_backup_limit_per_db: number;
  available_plans: string[];
  compliance_dashboard_access: boolean;
  container_memory_limit: number;
  cost_cents: number;
  cpu_allowed_profiles: any;
  created_at: string;
  disk_limit: number;
  environment_limit?: number;
  ephemeral_session_limit: number;
  included_container_mb: number;
  included_disk_gb: number;
  included_vhosts: number;
  manual_backup_limit_per_db: number;
  organization_id: string;
  updated_at: string;
  vhost_limit: number;
  _links: {
    organization: LinkResponse;
    plan: LinkResponse;
  };
  _type: "active_plan";
}

export const defaultPlan = (c: Partial<DeployPlan> = {}): DeployPlan => {
  const now = new Date().toISOString();
  return {
    id: "",
    automatedBackupLimitPerDb: 0,
    complianceDashboardAccess: false,
    containerMemoryLimit: 0,
    costCents: 0,
    cpuAllowedProfiles: 0,
    createdAt: now,
    diskLimit: 0,
    environmentLimit: undefined,
    ephemeralSessionLimit: 0,
    includedContainerMb: 0,
    includedDiskGb: 0,
    includedVhosts: 0,
    manualBackupLimitPerDb: 0,
    name: "starter",
    updatedAt: now,
    vhostLimit: 0,
    ...c,
  };
};

export const defaultActivePlanResponse = (
  c: Partial<DeployActivePlanResponse> = {},
): DeployActivePlanResponse => {
  const now = new Date().toISOString();
  return {
    id: 0,
    automated_backup_limit_per_db: 0,
    available_plans: [],
    compliance_dashboard_access: false,
    container_memory_limit: 0,
    cost_cents: 0,
    cpu_allowed_profiles: 0,
    created_at: now,
    disk_limit: 0,
    environment_limit: undefined,
    ephemeral_session_limit: 0,
    included_container_mb: 0,
    included_disk_gb: 0,
    included_vhosts: 0,
    manual_backup_limit_per_db: 0,
    organization_id: "",
    updated_at: now,
    vhost_limit: 0,
    _links: {
      organization: defaultHalHref(),
      plan: defaultHalHref(),
    },
    _type: "active_plan",
    ...c,
  };
};

export const defaultPlanResponse = (
  c: Partial<DeployPlanResponse> = {},
): DeployPlanResponse => {
  const now = new Date().toISOString();
  return {
    id: 0,
    automated_backup_limit_per_db: 0,
    compliance_dashboard_access: false,
    container_memory_limit: 0,
    cost_cents: 0,
    cpu_allowed_profiles: 0,
    created_at: now,
    disk_limit: 0,
    environment_limit: undefined,
    ephemeral_session_limit: 0,
    included_container_mb: 0,
    included_disk_gb: 0,
    included_vhosts: 0,
    manual_backup_limit_per_db: 0,
    name: "starter",
    updated_at: now,
    vhost_limit: 0,
    _type: "plan",
    ...c,
  };
};

export const defaultActivePlan = (
  c: Partial<DeployActivePlan> = {},
): DeployActivePlan => {
  const now = new Date().toISOString();
  return {
    id: "",
    automatedBackupLimitPerDb: 0,
    availablePlans: [],
    complianceDashboardAccess: false,
    containerMemoryLimit: 0,
    costCents: 0,
    cpuAllowedProfiles: 0,
    createdAt: now,
    diskLimit: 0,
    environmentLimit: undefined,
    ephemeralSessionLimit: 0,
    includedContainerMb: 0,
    includedDiskGb: 0,
    includedVhosts: 0,
    manualBackupLimitPerDb: 0,
    organizationId: "",
    updatedAt: now,
    vhostLimit: 0,
    planId: "",
    ...c,
  };
};

export const deserializePlan = (payload: DeployPlanResponse): DeployPlan => {
  return {
    id: `${payload.id}`,
    automatedBackupLimitPerDb: payload.automated_backup_limit_per_db,
    complianceDashboardAccess: payload.compliance_dashboard_access,
    containerMemoryLimit: payload.container_memory_limit,
    costCents: payload.cost_cents,
    cpuAllowedProfiles: payload.cpu_allowed_profiles,
    createdAt: payload.created_at,
    diskLimit: payload.disk_limit,
    environmentLimit: payload.environment_limit,
    ephemeralSessionLimit: payload.ephemeral_session_limit,
    includedContainerMb: payload.included_container_mb,
    includedDiskGb: payload.included_disk_gb,
    includedVhosts: payload.included_vhosts,
    manualBackupLimitPerDb: payload.manual_backup_limit_per_db,
    name: payload.name as PlanName,
    updatedAt: payload.updated_at,
    vhostLimit: payload.vhost_limit,
  };
};

export const deserializeActivePlan = (
  payload: DeployActivePlanResponse,
): DeployActivePlan => {
  const links = payload._links;

  return {
    id: `${payload.id}`,
    availablePlans: payload.available_plans,
    automatedBackupLimitPerDb: payload.automated_backup_limit_per_db,
    complianceDashboardAccess: payload.compliance_dashboard_access,
    containerMemoryLimit: payload.container_memory_limit,
    costCents: payload.cost_cents,
    cpuAllowedProfiles: payload.cpu_allowed_profiles,
    createdAt: payload.created_at,
    diskLimit: payload.disk_limit,
    environmentLimit: payload.environment_limit,
    ephemeralSessionLimit: payload.ephemeral_session_limit,
    includedContainerMb: payload.included_container_mb,
    includedDiskGb: payload.included_disk_gb,
    includedVhosts: payload.included_vhosts,
    manualBackupLimitPerDb: payload.manual_backup_limit_per_db,
    organizationId: payload.organization_id,
    planId: extractIdFromLink(links.plan),
    updatedAt: payload.updated_at,
    vhostLimit: payload.vhost_limit,
  };
};

export const DEPLOY_PLAN_NAME = "plans";
const planSlice = createTable<DeployPlan>({ name: DEPLOY_PLAN_NAME });
const { add: addPlans } = planSlice.actions;

const planSelectors = planSlice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_PLAN_NAME],
);

const initPlan = defaultPlan;
const mustPlan = mustSelectEntity(initPlan);

export const selectPlanById = mustPlan(planSelectors.selectById);
export const { selectTableAsList: selectPlansAsList } = planSelectors;
export const planReducers = createReducerMap(planSlice);

export const DEPLOY_ACTIVE_PLAN_NAME = "active_plans";
const activePlanSlice = createTable<DeployActivePlan>({
  name: DEPLOY_ACTIVE_PLAN_NAME,
});
const { add: addActivePlans, remove: removeActivePlans } =
  activePlanSlice.actions;

const initActivePlan = defaultActivePlan();
const mustActivePlan = mustSelectEntity(initActivePlan);

const activePlanSelectors = activePlanSlice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_ACTIVE_PLAN_NAME],
);
export const selectActivePlanById = mustActivePlan(
  activePlanSelectors.selectById,
);
export const { selectTableAsList: selectActivePlansAsList } =
  activePlanSelectors;
export const activePlanReducers = createReducerMap(activePlanSlice);
export const selectFirstActivePlan = createSelector(
  selectActivePlansAsList,
  (activePlans) => {
    if (activePlans.length === 0) {
      return initActivePlan;
    }

    return activePlans[0];
  },
);

export const fetchPlans = api.get("/plans");
export const fetchPlanById = api.get<{ id: string }>("/plans/:id");

export const fetchAllActivePlans = api.get<{ organization_id: string }>(
  "/active_plans",
);

export const fetchActivePlans = api.get<{ organization_id: string }>(
  "/active_plans?organization_id=:organization_id",
);

interface UpdateActivePlan {
  id: string;
  planId: string;
  name: string;
}

export const updateActivePlan = api.put<UpdateActivePlan>(
  "/active_plans/:id",
  function* (ctx, next) {
    const { planId } = ctx.payload;
    const body = {
      plan_id: planId,
    };
    ctx.request = ctx.req({ body: JSON.stringify(body) });
    yield next();
  },
);

export const updateAndRefreshActivePlans = thunks.create<UpdateActivePlan>(
  "update-and-refresh-active-plans",
  function* (ctx, next) {
    yield put(setLoaderStart({ id: ctx.key }));

    const updateActivePlanCtx = yield* call(
      updateActivePlan.run,
      updateActivePlan(ctx.payload),
    );
    if (!updateActivePlanCtx.json.ok) {
      yield put(
        setLoaderError({
          id: ctx.name,
          message: updateActivePlanCtx.json.data.message,
        }),
      );
      return;
    }
    yield next();

    ctx.actions.push(removeActivePlans([ctx.payload.id]));
    yield put(
      setLoaderSuccess({
        id: ctx.name,
        message: `Successfully updated plan to ${capitalize(
          ctx.payload.name,
        )}.`,
      }),
    );
  },
);

export const planEntities = {
  plan: defaultEntity({
    id: "plan",
    deserialize: deserializePlan,
    save: addPlans,
  }),
};

export const activePlanEntities = {
  active_plan: defaultEntity({
    id: "active_plan",
    deserialize: deserializeActivePlan,
    save: addActivePlans,
  }),
};
