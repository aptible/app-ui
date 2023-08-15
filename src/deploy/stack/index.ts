import {
  CONTAINER_PROFILES,
  ContainerProfileData,
  ContainerProfileTypes,
} from "../app";
import { selectDeploy } from "../slice";
import { PaginateProps, api, cacheTimer, combinePages, thunks } from "@app/api";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import type { AppState, DeployStack, LinkResponse } from "@app/types";
import { createSelector } from "@reduxjs/toolkit";

export interface DeployStackResponse {
  id: number;
  name: string;
  region: string;
  default: boolean;
  public: boolean;
  created_at: string;
  updated_at: string;
  outbound_ip_addresses: string[];
  memory_limits: boolean;
  cpu_limits: boolean;
  intrusion_detection: boolean;
  expose_intrusion_detection_reports: boolean;
  allow_t_instance_profile: boolean;
  allow_c_instance_profile: boolean;
  allow_m_instance_profile: boolean;
  allow_r_instance_profile: boolean;
  allow_granular_container_sizes: boolean;
  _links: {
    organization: LinkResponse;
  };
  _type: "stack";
}

export const defaultStackResponse = (
  s: Partial<DeployStackResponse> = {},
): DeployStackResponse => {
  const now = new Date().toISOString();
  return {
    id: 1,
    name: "",
    region: "",
    default: true,
    public: true,
    created_at: now,
    updated_at: now,
    outbound_ip_addresses: [],
    memory_limits: false,
    cpu_limits: false,
    intrusion_detection: false,
    expose_intrusion_detection_reports: false,
    allow_c_instance_profile: true,
    allow_m_instance_profile: true,
    allow_r_instance_profile: true,
    allow_t_instance_profile: true,
    allow_granular_container_sizes: true,
    _links: { organization: { href: "" } },
    _type: "stack",
    ...s,
  };
};

export const deserializeDeployStack = (
  payload: DeployStackResponse,
): DeployStack => {
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
export const { selectTable: selectStacks } = selectors;
export const selectStacksAsList = createSelector(
  selectors.selectTableAsList,
  (stacks) => {
    return stacks.sort((a, b) => a.name.localeCompare(b.name));
  },
);

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

export type StackType = "shared" | "dedicated";
/*
 * A stack with no organization id could be a coordinator or a shared stack
 * A stack with public set to true could be a shared stack, but is never a coordinator
 * (we also have shared stacks that are no longer public because they’re too full)
 *
 * The API only ever returns:
 *  - Stacks that belong to your org
 *  - Stacks that are public
 *  - Stacks that have no org id and are not public, but you have an account on
 */
export const getStackType = (stack: DeployStack): StackType => {
  return stack.organizationId === "" ? "shared" : "dedicated";
};

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
export const hasDeployStack = (s: DeployStack) => s.id !== "";

export const selectStacksForTableSearch = createSelector(
  selectStacksAsList,
  (_: AppState, p: { search: string }) => p.search,
  (stacks, search) => {
    if (search === "") {
      return stacks;
    }

    const searchLower = search.toLocaleLowerCase();

    return stacks
      .filter((stack) => {
        const name = stack.name.toLocaleLowerCase();
        const region = stack.region.toLocaleLowerCase();
        const type = getStackType(stack);

        const nameMatch = name.includes(searchLower);
        const regionMatch = region.includes(searchLower);
        const typeMatch = type.includes(searchLower);
        const idMatch = searchLower === stack.id;

        return nameMatch || regionMatch || typeMatch || idMatch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  },
);

export const selectContainerProfilesForStack = createSelector(
  selectStackById,
  (stack) => {
    const containerProfiles: {
      [profile in ContainerProfileTypes]?: ContainerProfileData;
    } = {};

    if (stack.allowCInstanceProfile) {
      containerProfiles.c4 = CONTAINER_PROFILES.c4;
      containerProfiles.c5 = CONTAINER_PROFILES.c5;
    }

    if (stack.allowMInstanceProfile) {
      // TODO - do we want to show this? not sure if we just
      //        direct new users to m5 somehow
      containerProfiles.m4 = CONTAINER_PROFILES.m4;
      containerProfiles.m5 = CONTAINER_PROFILES.m5;
    }

    if (stack.allowRInstanceProfile) {
      containerProfiles.r4 = CONTAINER_PROFILES.r4;
      containerProfiles.r5 = CONTAINER_PROFILES.r5;
    }

    if (stack.allowTInstanceProfile) {
      containerProfiles.t3 = CONTAINER_PROFILES.t3;
    }

    return containerProfiles;
  },
);

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
