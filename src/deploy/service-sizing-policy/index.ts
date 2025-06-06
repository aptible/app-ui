import { api, cacheShortTimer, cacheTimer, thunks } from "@app/api";
import { createSelector } from "@app/fx";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import { schema } from "@app/schema";
import type {
  AutoscalingTypes,
  DeployServiceSizingPolicy,
  LinkResponse,
} from "@app/types";
import { selectServiceById } from "../service";

export interface DeployServiceSizingPolicyResponse {
  id: number | undefined;
  scaling_enabled: boolean;
  autoscaling: AutoscalingTypes;
  default_policy: boolean;
  metric_lookback_seconds: number;
  percentile: number;
  post_scale_up_cooldown_seconds: number;
  post_scale_down_cooldown_seconds: number;
  post_release_cooldown_seconds: number;
  mem_cpu_ratio_r_threshold: number;
  mem_cpu_ratio_c_threshold: number;
  mem_scale_up_threshold: number;
  mem_scale_down_threshold: number;
  minimum_memory: number;
  maximum_memory: number | null;
  min_containers: number | null;
  max_containers: number | null;
  min_cpu_threshold: number | null;
  max_cpu_threshold: number | null;
  scale_up_step: number;
  scale_down_step: number;
  use_horizontal_scale: boolean;
  created_at: string;
  updated_at: string;
  _links: {
    account: LinkResponse;
  };
  _type: "service_sizing_policy";
}

export const defaultServiceSizingPolicyResponse = (
  s: Partial<DeployServiceSizingPolicyResponse> = {},
): DeployServiceSizingPolicyResponse => {
  const now = new Date().toISOString();
  return {
    id: undefined,
    scaling_enabled: false,
    autoscaling: "vertical",
    default_policy: false,
    metric_lookback_seconds: 300,
    percentile: 99,
    post_scale_up_cooldown_seconds: 60,
    post_scale_down_cooldown_seconds: 300,
    post_release_cooldown_seconds: 60,
    mem_cpu_ratio_r_threshold: 4,
    mem_cpu_ratio_c_threshold: 2,
    mem_scale_up_threshold: 0.9,
    mem_scale_down_threshold: 0.75,
    minimum_memory: 2048,
    maximum_memory: null,
    min_containers: 2,
    max_containers: 4,
    min_cpu_threshold: 0.1,
    max_cpu_threshold: 0.9,
    scale_up_step: 1,
    scale_down_step: 1,
    use_horizontal_scale: false,
    created_at: now,
    updated_at: now,
    _type: "service_sizing_policy",
    ...s,
    _links: { account: defaultHalHref(), ...s._links },
  };
};

export const deserializeDeployServiceSizingPolicy = (
  payload: DeployServiceSizingPolicyResponse,
): DeployServiceSizingPolicy => {
  const links = payload._links;
  const environmentId = extractIdFromLink(links.account);

  return {
    id: `${payload.id}`,
    environmentId,
    scalingEnabled: payload.scaling_enabled,
    autoscaling: payload.autoscaling,
    defaultPolicy: payload.default_policy,
    metricLookbackSeconds: payload.metric_lookback_seconds,
    percentile: payload.percentile,
    postScaleUpCooldownSeconds: payload.post_scale_up_cooldown_seconds,
    postScaleDownCooldownSeconds: payload.post_scale_down_cooldown_seconds,
    postReleaseCooldownSeconds: payload.post_release_cooldown_seconds,
    memCpuRatioRThreshold: payload.mem_cpu_ratio_r_threshold,
    memCpuRatioCThreshold: payload.mem_cpu_ratio_c_threshold,
    memScaleUpThreshold: payload.mem_scale_up_threshold,
    memScaleDownThreshold: payload.mem_scale_down_threshold,
    minimumMemory: payload.minimum_memory,
    maximumMemory: payload.maximum_memory,
    minContainers: payload.min_containers,
    maxContainers: payload.max_containers,
    scaleUpStep: payload.scale_up_step,
    scaleDownStep: payload.scale_down_step,
    minCpuThreshold: payload.min_cpu_threshold,
    maxCpuThreshold: payload.max_cpu_threshold,
    useHorizontalScale: payload.use_horizontal_scale,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
};

export const serviceSizingPolicyEntities = {
  service_sizing_policy: defaultEntity({
    id: "service_sizing_policy",
    deserialize: deserializeDeployServiceSizingPolicy,
    save: schema.serviceSizingPolicies.add,
  }),
};

export const selectServiceSizingPolicyById =
  schema.serviceSizingPolicies.selectById;
export const selectServiceSizingPolicyByServiceId = createSelector(
  selectServiceById,
  schema.serviceSizingPolicies.selectTableAsList,
  (service, policies) =>
    policies.find((p) => p.id === service.serviceSizingPolicyId) ||
    schema.serviceSizingPolicies.empty,
);

export const selectAutoscalingEnabledById = createSelector(
  selectServiceSizingPolicyById,
  (policy) => policy.scalingEnabled,
);
export const selectAutoscalingEnabledByServiceId = createSelector(
  selectServiceSizingPolicyByServiceId,
  (policy) => policy.scalingEnabled,
);

export const fetchServiceSizingPolicies = api.get(
  "/service_sizing_policies?per_page=5000",
  {
    supervisor: cacheTimer(),
  },
);

export const fetchServiceSizingPoliciesByEnvironmentId = api.get<{
  id: string;
}>("/accounts/:id/service_sizing_policies", { supervisor: cacheShortTimer() });
export const fetchServiceSizingPoliciesByServiceId = api.get<{
  serviceId: string;
}>("/services/:serviceId/service_sizing_policies", {
  supervisor: cacheShortTimer(),
});

export interface ServiceSizingPolicyEditProps {
  scalingEnabled: boolean;
  autoscaling: AutoscalingTypes;
  metricLookbackSeconds: number;
  percentile: number;
  postScaleUpCooldownSeconds: number;
  postScaleDownCooldownSeconds: number;
  postReleaseCooldownSeconds: number;
  memCpuRatioRThreshold: number;
  memCpuRatioCThreshold: number;
  memScaleUpThreshold: number;
  memScaleDownThreshold: number;
  minimumMemory: number;
  maximumMemory: number | null;
  minContainers: number | null;
  maxContainers: number | null;
  minCpuThreshold: number | null;
  maxCpuThreshold: number | null;
  scaleUpStep: number;
  scaleDownStep: number;
  useHorizontalScale: boolean;
}

const serializeServiceSizingPolicyEditProps = (
  payload: ServiceSizingPolicyEditProps,
) => ({
  scaling_enabled: payload.scalingEnabled,
  autoscaling: payload.autoscaling,
  metric_lookback_seconds: payload.metricLookbackSeconds,
  percentile: payload.percentile,
  post_scale_up_cooldown_seconds: payload.postScaleUpCooldownSeconds,
  post_scale_down_cooldown_seconds: payload.postScaleDownCooldownSeconds,
  post_release_cooldown_seconds: payload.postReleaseCooldownSeconds,
  mem_cpu_ratio_r_threshold: payload.memCpuRatioRThreshold,
  mem_cpu_ratio_c_threshold: payload.memCpuRatioCThreshold,
  mem_scale_up_threshold: payload.memScaleUpThreshold,
  mem_scale_down_threshold: payload.memScaleDownThreshold,
  minimum_memory: payload.minimumMemory,
  maximum_memory: payload.maximumMemory || null, // 0 => null
  min_containers: payload.minContainers,
  max_containers: payload.maxContainers,
  min_cpu_threshold: payload.minCpuThreshold,
  max_cpu_threshold: payload.maxCpuThreshold,
  scale_up_step: payload.scaleUpStep,
  scale_down_step: payload.scaleDownStep,
  use_horizontal_scale: payload.useHorizontalScale,
});

export interface ModifyServiceSizingPolicyProps
  extends ServiceSizingPolicyEditProps {
  id: string;
  serviceId: string;
}

export const createServiceSizingPolicyByServiceId = api.post<
  ModifyServiceSizingPolicyProps,
  DeployServiceSizingPolicyResponse
>(["/services/:serviceId/service_sizing_policies"], function* (ctx, next) {
  ctx.request = ctx.req({
    body: JSON.stringify(serializeServiceSizingPolicyEditProps(ctx.payload)),
  });
  yield* next();
});

export const updateServiceSizingPolicyByServiceId = api.put<
  ModifyServiceSizingPolicyProps,
  DeployServiceSizingPolicyResponse
>(["/services/:serviceId/service_sizing_policies"], function* (ctx, next) {
  ctx.request = ctx.req({
    body: JSON.stringify(serializeServiceSizingPolicyEditProps(ctx.payload)),
  });
  yield* next();
});

export const deleteServiceSizingPolicyByServiceId = api.delete<{
  serviceId: string;
}>(["/services/:serviceId/service_sizing_policy"], function* (ctx, next) {
  yield* next();
  if (!ctx.json.ok) {
    return;
  }
  ctx.loader = { message: "Policy changes saved" };
});

export const modifyServiceSizingPolicy =
  thunks.create<ModifyServiceSizingPolicyProps>(
    "modify-service-sizing-policy",
    function* (ctx, next) {
      yield* schema.update(schema.loaders.start({ id: ctx.name }));
      const nextPolicy = ctx.payload;
      const updateCtx = nextPolicy.id
        ? yield* updateServiceSizingPolicyByServiceId.run(nextPolicy)
        : yield* createServiceSizingPolicyByServiceId.run(nextPolicy);

      yield* next();

      if (updateCtx.json.ok) {
        yield* schema.update([
          schema.services.patch({
            [nextPolicy.serviceId]: {
              serviceSizingPolicyId: `${updateCtx.json.value.id}`,
            },
          }),
          schema.loaders.success({
            id: ctx.name,
            message: "Policy changes saved",
          }),
        ]);
      } else {
        const data = updateCtx.json.error as Error;
        yield* schema.update(
          schema.loaders.error({ id: ctx.name, message: data.message }),
        );
      }
    },
  );
