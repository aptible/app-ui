import { createSelector } from "@reduxjs/toolkit";

import { PaginateProps, api, cacheTimer, combinePages, thunks } from "@app/api";
import {
  call,
  put,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
} from "@app/fx";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import {
  AppState,
  DeployMetricDrain,
  DeployOperationResponse,
  LinkResponse,
  ProvisionableStatus,
} from "@app/types";

import { selectDeploy } from "../slice";

export type MetricDrainType =
  | "influxdb"
  | "influxdb_database"
  | "datadog"
  | "influxdb2";

export interface DeployMetricDrainResponse {
  id: string;
  handle: string;
  drain_type: MetricDrainType;
  drain_configuration: Record<string, string>;
  environmentId: string;
  created_at: string;
  updated_at: string;
  status: ProvisionableStatus;
  aggregator_ca_certificate: string;
  aggregator_ca_private_key_blob: string;
  aggregator_host: string;
  aggregator_port_mapping: number[][];
  aggregator_instance_id: string;
  aggregator_docker_name: string;
  aggregator_allocation: string[];
  _links: {
    account: LinkResponse;
  };
}

export const defaultMetricDrainResponse = (
  md: Partial<DeployMetricDrainResponse> = {},
): DeployMetricDrainResponse => {
  const now = new Date().toISOString();
  return {
    id: "",
    handle: "",
    drain_type: "datadog",
    drain_configuration: {},
    environmentId: "",
    status: "pending",
    aggregator_host: "",
    aggregator_allocation: [],
    aggregator_docker_name: "",
    aggregator_instance_id: "",
    aggregator_port_mapping: [],
    aggregator_ca_certificate: "",
    aggregator_ca_private_key_blob: "",
    created_at: now,
    updated_at: now,
    _links: {
      account: defaultHalHref(),
      ...md._links,
    },
    ...md,
  };
};

export const deserializeMetricDrain = (
  payload: DeployMetricDrainResponse,
): DeployMetricDrain => {
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
export const findMetricDrainById = must(selectors.findById);
export const {
  selectTableAsList: selectMetricDrainsAsList,
  selectTable: selectMetricDrains,
} = selectors;
export const selectMetricDrainsByEnvId = createSelector(
  selectMetricDrainsAsList,
  (_: AppState, props: { envId: string }) => props.envId,
  (metricDrains, envId) => {
    return metricDrains
      .filter((metricDrain) => metricDrain.environmentId === envId)
      .sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  },
);
export const hasDeployMetricDrain = (a: DeployMetricDrain) => a.id !== "";
export const metricDrainReducers = createReducerMap(slice);

export const fetchEnvMetricDrains = api.get<{ id: string }>(
  "/accounts/:id/metric_drains",
);

export const fetchMetricDrains = api.get<PaginateProps>(
  "/metric_drains?page=:page",
  {
    saga: cacheTimer(),
  },
);
export const fetchAllMetricDrains = thunks.create(
  "fetch-all-metric-drains",
  combinePages(fetchMetricDrains),
);
interface CreateMetricDrainBase {
  envId: string;
  handle: string;
}

interface CreateInfluxDbEnvMetricDrain extends CreateMetricDrainBase {
  drainType: "influxdb_database";
  dbId: string;
}

interface CreateInfluxDb1MetricDrain extends CreateMetricDrainBase {
  drainType: "influxdb";
  protocol: "http" | "https";
  hostname: string;
  username: string;
  password: string;
  database: string;
  port?: string;
}

interface CreateInfluxDb2MetricDrain extends CreateMetricDrainBase {
  drainType: "influxdb2";
  protocol: "http" | "https";
  hostname: string;
  org: string;
  authToken: string;
  bucket: string;
  port?: string;
}

interface CreateDatabaseMetricDrain extends CreateMetricDrainBase {
  drainType: "datadog";
  apiKey: string;
}

export type CreateMetricDrainProps =
  | CreateInfluxDbEnvMetricDrain
  | CreateInfluxDb1MetricDrain
  | CreateInfluxDb2MetricDrain
  | CreateDatabaseMetricDrain;

export const createMetricDrain = api.post<
  CreateMetricDrainProps,
  DeployMetricDrainResponse
>("/accounts/:envId/metric_drains", function* (ctx, next) {
  const preBody: Record<string, string> = {
    drain_type: ctx.payload.drainType,
    handle: ctx.payload.handle,
  };
  let body = "";
  if (ctx.payload.drainType === "influxdb_database") {
    body = JSON.stringify({
      ...preBody,
      database_id: ctx.payload.dbId,
    });
  } else if (ctx.payload.drainType === "influxdb") {
    const { protocol, hostname, username, password, database } = ctx.payload;
    const protoPort = protocol === "http" ? 80 : 443;
    const port = ctx.payload.port || protoPort;
    const address = `${protocol}://${hostname}:${port}`;
    body = JSON.stringify({
      ...preBody,
      drain_configuration: {
        address,
        username,
        password,
        database,
      },
    });
  } else if (ctx.payload.drainType === "influxdb2") {
    const { protocol, hostname, org, authToken, bucket } = ctx.payload;
    const protoPort = protocol === "http" ? 80 : 443;
    const port = ctx.payload.port || protoPort;
    const address = `${protocol}://${hostname}:${port}`;
    body = JSON.stringify({
      ...preBody,
      drain_configuration: {
        address,
        org,
        authToken,
        bucket,
      },
    });
  } else if (ctx.payload.drainType === "datadog") {
    body = JSON.stringify({
      ...preBody,
      drain_configuration: { api_key: ctx.payload.apiKey },
    });
  }

  ctx.request = ctx.req({ body });
  yield* next();
});

export const createMetricDrainOperation = api.post<
  { id: string },
  DeployOperationResponse
>("/metric_drains/:id/operations", function* (ctx, next) {
  const body = JSON.stringify({
    type: "provision",
  });
  ctx.request = ctx.req({ body });
  yield* next();
});

export const provisionMetricDrain = thunks.create<CreateMetricDrainProps>(
  "create-and-provision-metric-drain",
  function* (ctx, next) {
    yield* put(setLoaderStart({ id: ctx.key }));

    const mdCtx = yield* call(
      createMetricDrain.run,
      createMetricDrain(ctx.payload),
    );
    if (!mdCtx.json.ok) {
      yield* put(
        setLoaderError({ id: ctx.key, message: mdCtx.json.data.message }),
      );
      return;
    }

    const metricDrainId = mdCtx.json.data.id;
    const opCtx = yield* call(
      createMetricDrainOperation.run,
      createMetricDrainOperation({ id: metricDrainId }),
    );
    if (!opCtx.json.ok) {
      yield* put(
        setLoaderError({ id: ctx.key, message: opCtx.json.data.message }),
      );
      return;
    }

    yield* next();

    yield* put(
      setLoaderSuccess({
        id: ctx.key,
        meta: { metricDrainId, opId: `${opCtx.json.data.id}` },
      }),
    );
  },
);

export const metricDrainEntities = {
  metric_drain: defaultEntity({
    id: "metric_drain",
    deserialize: deserializeMetricDrain,
    save: addDeployMetricDrains,
  }),
};
