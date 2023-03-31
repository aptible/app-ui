import { selectDeploy } from "../slice";
import { PaginateProps, api, cacheTimer, combinePages, thunks } from "@app/api";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import type { AppState, DeployStack } from "@app/types";
import { createSelector } from "@reduxjs/toolkit";

export const deserializeDeployStack = (payload: any): DeployStack => {
  return {
    id: `${payload.id}`,
    name: payload.name,
    region: payload.region,
    default: payload.default,
    public: payload.public,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    outboundIpAddresses: payload.outbound_ip_addresses,
    memoryLimits: payload.memory_limits,
    cpuLimits: payload.cpu_limits,
    intrusionDetection: payload.intrusion_detection,
    exposeIntrusionDetectionReports: payload.expose_intrusion_detection_reports,
    allowTInstanceProfile: payload.allow_t_instance_profile,
    allowCInstanceProfile: payload.allow_c_instance_profile,
    allowMInstanceProfile: payload.allow_m_instance_profile,
    allowRInstanceProfile: payload.allow_r_instance_profile,
    allowGranularContainerSizes: payload.allow_granular_container_sizes,
    organizationId: extractIdFromLink(payload._links.organization),
  };
};

export const defaultDeployStack = (
  s: Partial<DeployStack> = {},
): DeployStack => {
  const now = new Date().toISOString();
  return {
    id: "",
    organizationId: "",
    name: "",
    region: "",
    default: false,
    public: false,
    createdAt: now,
    updatedAt: now,
    outboundIpAddresses: [],
    memoryLimits: false,
    cpuLimits: false,
    intrusionDetection: false,
    exposeIntrusionDetectionReports: false,
    allowCInstanceProfile: false,
    allowMInstanceProfile: false,
    allowRInstanceProfile: false,
    allowTInstanceProfile: false,
    allowGranularContainerSizes: false,
    ...s,
  };
};

export const DEPLOY_STACK_NAME = "stacks";
const slice = createTable<DeployStack>({
  name: DEPLOY_STACK_NAME,
});
const { add: addDeployStacks } = slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_STACK_NAME],
);
const initStack = defaultDeployStack();
const must = mustSelectEntity(initStack);
export const selectStackById = must(selectors.selectById);
export const { selectTableAsList: selectStacksAsList } = selectors;

export const stackToOption = (
  stack: DeployStack,
): { label: string; value: string } => {
  return {
    value: stack.id,
    label: stack.name,
  };
};

export const selectStacksAsOptions = createSelector(
  selectStacksAsList,
  (stacks) =>
    stacks.map(stackToOption).sort((a, b) => a.label.localeCompare(b.label)),
);

export const selectStacksByOrgAsOptions = createSelector(
  selectStacksAsList,
  (_: AppState, p: { orgId: string }) => p.orgId,
  (stacks, orgId) => {
    return stacks
      .filter(
        (stack) =>
          stack.organizationId === "" || stack.organizationId === orgId,
      )
      .map(stackToOption)
      .sort((a, b) => a.label.localeCompare(b.label));
  },
);

export const selectStackPublicDefault = createSelector(
  selectStacksAsList,
  (stacks) => {
    if (stacks.length === 0) {
      return initStack;
    }

    // find first public stack
    return stacks.find((s) => s.public) || initStack;
  },
);
export const selectStackPublicDefaultAsOption = createSelector(
  selectStackPublicDefault,
  stackToOption,
);
export const hasDeployStack = (s: DeployStack) => s.organizationId !== "";
export const stackReducers = createReducerMap(slice);

export const fetchStacks = api.get<PaginateProps>("/stacks?page=:page");
export const fetchAllStacks = thunks.create(
  "fetch-all-stacks",
  { saga: cacheTimer() },
  combinePages(fetchStacks),
);

export const fetchStack = api.get<{ id: string }>("/stacks/:id");

export const stackEntities = {
  stack: defaultEntity({
    id: "stack",
    deserialize: deserializeDeployStack,
    save: addDeployStacks,
  }),
};
