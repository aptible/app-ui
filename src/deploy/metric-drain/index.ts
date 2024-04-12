import { api, cacheTimer, thunks } from "@app/api";
import { createSelector } from "@app/fx";
import { call } from "@app/fx";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import { WebState, schema } from "@app/schema";
import {
  DeployMetricDrain,
  LinkResponse,
  ProvisionableStatus,
} from "@app/types";
import { DeployOperationResponse } from "../operation";

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
    database: LinkResponse;
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
      database: defaultHalHref(),
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
    databaseId: extractIdFromLink(links.database),
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    status: payload.status,
  };
};

export const selectMetricDrainById = schema.metricDrains.selectById;
export const findMetricDrainById = schema.metricDrains.findById;
export const selectMetricDrainsAsList = schema.metricDrains.selectTableAsList;
export const selectMetricDrains = schema.metricDrains.selectTable;

export const selectMetricDrainsByEnvId = createSelector(
  selectMetricDrainsAsList,
  (_: WebState, props: { envId: string }) => props.envId,
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

export const fetchEnvMetricDrains = api.get<{ id: string }>(
  "/accounts/:id/metric_drains",
);

export const fetchMetricDrains = api.get(
  "/metric_drains?per_page=5000",
  {
    supervisor: cacheTimer(),
  },
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }
    yield* schema.update(schema.metricDrains.reset());
  },
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
    yield* schema.update(schema.loaders.start({ id: ctx.key }));

    const mdCtx = yield* call(() =>
      createMetricDrain.run(createMetricDrain(ctx.payload)),
    );
    if (!mdCtx.json.ok) {
      const data = mdCtx.json.error as any;
      yield* schema.update(
        schema.loaders.error({ id: ctx.key, message: data.message }),
      );
      return;
    }

    const metricDrainId = mdCtx.json.value.id;
    const opCtx = yield* call(() =>
      createMetricDrainOperation.run(
        createMetricDrainOperation({ id: metricDrainId }),
      ),
    );
    if (!opCtx.json.ok) {
      const data = opCtx.json.error as any;
      yield* schema.update(
        schema.loaders.error({ id: ctx.key, message: data.message }),
      );
      return;
    }

    yield* next();

    yield* schema.update(
      schema.loaders.success({
        id: ctx.key,
        meta: { metricDrainId, opId: `${opCtx.json.value.id}` } as any,
      }),
    );
  },
);

export const deprovisionMetricDrain = api.post<
  { id: string },
  DeployOperationResponse
>(["/metric_drains/:id/operations", "deprovision"], function* (ctx, next) {
  const { id } = ctx.payload;
  // an empty provision triggers a restart for metric drains
  const body = {
    type: "deprovision",
    id,
  };

  ctx.request = ctx.req({ body: JSON.stringify(body) });
  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  const opId = ctx.json.value.id;
  ctx.loader = {
    message: `Deprovision log drain operation queued (operation ID: ${opId})`,
    meta: { opId: `${opId}` },
  };
});

export const restartMetricDrain = api.post<
  { id: string },
  DeployOperationResponse
>(["/metric_drains/:id/operations", "restart"], function* (ctx, next) {
  const { id } = ctx.payload;
  // an empty provision triggers a restart for metric drains
  const body = {
    type: "provision",
    id,
  };

  ctx.request = ctx.req({ body: JSON.stringify(body) });
  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  const opId = ctx.json.value.id;
  ctx.loader = {
    message: `Restart log drain operation queued (operation ID: ${opId})`,
    meta: { opId: `${opId}` },
  };
});

export const metricDrainEntities = {
  metric_drain: defaultEntity({
    id: "metric_drain",
    deserialize: deserializeMetricDrain,
    save: schema.metricDrains.add,
  }),
};
