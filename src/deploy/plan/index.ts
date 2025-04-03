import { api } from "@app/api";
import { selectHasPaymentMethod } from "@app/billing";
import { createSelector } from "@app/fx";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import { defaultPlan, schema } from "@app/schema";
import { capitalize } from "@app/string-utils";
import type {
  DeployActivePlan,
  DeployPlan,
  LinkResponse,
  PlanName,
} from "@app/types";

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
  horizontal_autoscaling: boolean;
  vertical_autoscaling: boolean;
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
  horizontal_autoscaling: boolean;
  vertical_autoscaling: boolean;
  _links: {
    organization: LinkResponse;
    plan: LinkResponse;
  };
  _type: "active_plan";
}

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
    horizontal_autoscaling: false,
    vertical_autoscaling: false,
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
    horizontal_autoscaling: false,
    vertical_autoscaling: false,
    _type: "plan",
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
    horizontalAutoscaling: payload.horizontal_autoscaling,
    verticalAutoscaling: payload.vertical_autoscaling,
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
    horizontalAutoscaling: payload.horizontal_autoscaling,
    verticalAutoscaling: payload.vertical_autoscaling,
  };
};

// You probably want to use `selectPlanByActiveId` instead
const selectPlanById = schema.plans.selectById;

// when there is no active plan that means we should assume
// the user is on a legacy "enterprise" plan
export const selectPlanByActiveId = createSelector(
  schema.plans.selectTableAsList,
  selectPlanById,
  selectHasPaymentMethod,
  (plans, planById, hasPaymentMethod) => {
    if (planById.id !== "") {
      return planById;
    }

    if (!hasPaymentMethod) {
      return schema.plans.empty;
    }

    // if user has payment method and no active plan that means they are
    // legacy enterprise
    const enterprise = plans.find((p) => p.name === "enterprise");
    return enterprise || schema.plans.empty;
  },
);

export const selectPlansForView = createSelector(
  schema.plans.selectTableAsList,
  (plans) => {
    const init: Record<PlanName, DeployPlan> = {
      none: defaultPlan({ name: "none" }),
      starter: defaultPlan({ name: "starter" }),
      development: defaultPlan({ name: "development" }),
      growth: defaultPlan({ name: "growth" }),
      scale: defaultPlan({ name: "scale" }),
      production: defaultPlan({ name: "production" }),
      enterprise: defaultPlan({ name: "enterprise" }),
    };
    return plans.reduce((acc, plan) => {
      // plan.name should be unique
      acc[plan.name] = plan;
      return acc;
    }, init);
  },
);

export const selectActivePlanById = schema.activePlans.selectById;
export const selectActivePlansAsList = schema.activePlans.selectTableAsList;
export const selectFirstActivePlan = createSelector(
  selectActivePlansAsList,
  (activePlans) => {
    if (activePlans.length === 0) {
      return schema.activePlans.empty;
    }

    return activePlans[0];
  },
);

export const fetchPlans = api.get("/plans");
export const fetchPlanById = api.get<{ id: string }>("/plans/:id");

export const fetchActivePlans = api.get<{ orgId: string }>(
  "/active_plans?organization_id=:orgId",
);

interface UpdateActivePlan {
  planId: string;
  name: string;
}

export const updateActivePlan = api.put<UpdateActivePlan>(
  "/active_plans/update_by_organization",
  function* (ctx, next) {
    const { planId } = ctx.payload;
    const body = {
      plan_id: planId,
    };
    ctx.request = ctx.req({ body: JSON.stringify(body) });

    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    const name = capitalize(ctx.payload.name);
    ctx.loader = {
      message: `Successfully updated plan to ${name}.`,
    };
  },
);

export const planEntities = {
  plan: defaultEntity({
    id: "plan",
    deserialize: deserializePlan,
    save: schema.plans.add,
  }),
};

export const activePlanEntities = {
  active_plan: defaultEntity({
    id: "active_plan",
    deserialize: deserializeActivePlan,
    save: schema.activePlans.add,
  }),
};
