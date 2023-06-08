import { selectDeploy } from "../slice";
import { api } from "@app/api";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import { AppState, DeployMetricDrain } from "@app/types";
import { createSelector } from "@reduxjs/toolkit";

export const deserializeMetricDrain = (payload: any): DeployMetricDrain => {
  const links = payload._links;

  return {
    id: payload.id,
    handle: payload.handle,
    drainType: payload.drain_type,
    agggregatorCaCertificate: payload.aggregator_ca_certificate,
    aggregatorCaPrivateKeyBlob: payload.aggregator_ca_private_key_blob,
    aggregatorHost: payload.aggregator_host,
    aggregatorPortMapping: payload.aggregator_port_mapping,
    aggregatorInstanceId: payload.aggregator_instance_id,
    aggregatorDockerName: payload.aggregator_docker_name,
    aggregatorAllocation: payload.aggregator_allocation,
    drainConfiguration: payload.drain_configuration,
    environmentId: extractIdFromLink(links.account),
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    status: payload.status,
  };
};

export const defaultDeployMetricDrain = (
  md: Partial<DeployMetricDrain> = {},
): DeployMetricDrain => {
  const now = new Date().toISOString();
  return {
    id: "",
    handle: "",
    drainType: "",
    agggregatorCaCertificate: "",
    aggregatorCaPrivateKeyBlob: "",
    aggregatorHost: "",
    aggregatorPortMapping: [],
    aggregatorInstanceId: "",
    aggregatorDockerName: "",
    aggregatorAllocation: [],
    drainConfiguration: {},
    environmentId: "",
    createdAt: now,
    updatedAt: now,
    status: "pending",
    ...md,
  };
};

export const DEPLOY_METRIC_DRAIN_NAME = "metricDrains";
const slice = createTable<DeployMetricDrain>({
  name: DEPLOY_METRIC_DRAIN_NAME,
});
const { add: addDeployMetricDrains } = slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_METRIC_DRAIN_NAME],
);
const initMetricDrain = defaultDeployMetricDrain();
const must = mustSelectEntity(initMetricDrain);
export const selectMetricDrainById = must(selectors.selectById);
export const { selectTableAsList: selectMetricDrainsAsList } = selectors;
export const selectMetricDrainsByEnvId = createSelector(
  selectMetricDrainsAsList,
  (_: AppState, props: { envId: string }) => props.envId,
  (metricDrains, envId) => {
    return metricDrains
      .filter((metricDrain) => metricDrain.environmentId === envId)
      .sort((a, b) => a.id.localeCompare(b.id));
  },
);
export const hasDeployMetricDrain = (a: DeployMetricDrain) => a.id !== "";
export const metricDrainReducers = createReducerMap(slice);

export const fetchMetricDrains = api.get<{ id: string }>(
  "/accounts/:id/metric_drains",
);

export const metricDrainEntities = {
  metric_drain: defaultEntity({
    id: "metric_drain",
    deserialize: deserializeMetricDrain,
    save: addDeployMetricDrains,
  }),
};
