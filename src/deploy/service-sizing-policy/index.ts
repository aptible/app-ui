import { api, cacheShortTimer, thunks } from "@app/api";
import { call, createSelector } from "@app/fx";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import { schema } from "@app/schema";
import { DeployServiceSizingPolicy, LinkResponse } from "@app/types";
import { selectServiceById } from "../service";

export interface DeployServiceSizingPolicyResponse {
  id: number | undefined;
  scaling_enabled: boolean;
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
    default_policy: false,
    metric_lookback_seconds: 300,
    percentile: 99,
    post_scale_up_cooldown_seconds: 60,
    post_scale_down_cooldown_seconds: 300,
    post_release_cooldown_seconds: 300,
    mem_cpu_ratio_r_threshold: 4,
    mem_cpu_ratio_c_threshold: 2,
    mem_scale_up_threshold: 0.9,
    mem_scale_down_threshold: 0.75,
    minimum_memory: 2048,
    maximum_memory: null,
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

export const fetchServiceSizingPoliciesByEnvironmentId = api.get<{
  id: string;
}>("/accounts/:id/service_sizing_policies");
export const fetchServiceSizingPoliciesByServiceId = api.get<{
  serviceId: string;
}>("/services/:serviceId/service_sizing_policies", {
  supervisor: cacheShortTimer(),
});

export interface ServiceSizingPolicyEditProps {
  scalingEnabled: boolean;
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
}

const serializeServiceSizingPolicyEditProps = (
  payload: ServiceSizingPolicyEditProps,
) => ({
  scaling_enabled: payload.scalingEnabled,
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
      let updateCtx;
      if (nextPolicy.id) {
        updateCtx = yield* call(() =>
          updateServiceSizingPolicyByServiceId.run(nextPolicy),
        );
      } else {
        updateCtx = yield* call(() =>
          createServiceSizingPolicyByServiceId.run(nextPolicy),
        );
      }

      yield* next();

      if (updateCtx.json.ok) {
        yield* schema.update(
          schema.loaders.success({
            id: ctx.name,
            message: "Policy changes saved",
          }),
        );
      } else {
        const data = updateCtx.json.error as Error;
        yield* schema.update(
          schema.loaders.error({ id: ctx.name, message: data.message }),
        );
      }
    },
  );
