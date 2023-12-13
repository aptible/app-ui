import { api } from "@app/api";
import { defaultEntity } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import { AppState, DeploySource } from "@app/types";

interface DeploySourceResponse {
  id: string;
  name: string;
  git_browse_url: string;
  created_at: string;
  updated_at: string;
  _type: "source";
}

export const defaultDeploySourceResponse = (
  r: Partial<DeploySourceResponse> = {},
): DeploySourceResponse => {
  const now = new Date().toISOString();
  return {
    id: "",
    name: "",
    git_browse_url: "",
    created_at: now,
    updated_at: now,
    ...r,
    _type: "source",
  };
};

const defaultDeploySource = (s: Partial<DeploySource> = {}): DeploySource => {
  const now = new Date().toISOString();
  return {
    id: "",
    name: "",
    gitBrowseUrl: "",
    createdAt: now,
    updatedAt: now,
    ...s,
  };
};

const deserializeDeploySource = (r: DeploySourceResponse): DeploySource => {
  return {
    id: r.id,
    name: r.name,
    gitBrowseUrl: r.git_browse_url,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
};

export const DEPLOY_SOURCE_NAME = "sources";
const slice = createTable<DeploySource>({ name: DEPLOY_SOURCE_NAME });
export const { add: addDeploySources, reset: resetDeploySources } =
  slice.actions;
export const hasDeploySource = (a: DeploySource) => a.id !== "";
export const reducers = createReducerMap(slice);

const initSource = defaultDeploySource();
const must = mustSelectEntity(initSource);

const selectors = slice.getSelectors((s: AppState) => s[DEPLOY_SOURCE_NAME]);
export const selectSourceById = must(selectors.selectById);
export const { selectTableAsList: selectSourcesAsList } = selectors;

export const entities = {
  source: defaultEntity({
    id: "source",
    save: addDeploySources,
    deserialize: deserializeDeploySource,
  }),
};

const sources = {
  "1": defaultDeploySourceResponse({
    id: "1",
    name: "quay.io/aptible/cloud-ui",
    git_browse_url: "https://github.com/aptible/app-ui",
  }),
  "2": defaultDeploySourceResponse({
    id: "2",
    name: "quay.io/aptible/deploy-ui",
    git_browse_url: "https://github.com/aptible/deploy-ui",
  }),
  "3": defaultDeploySourceResponse({
    id: "3",
    name: "quay.io/aptible/deploy-api",
    git_browse_url: "https://github.com/aptible/deploy-api",
  }),
  "4": defaultDeploySourceResponse({
    id: "4",
    name: "quay.io/aptible/auth-api",
    git_browse_url: "https://github.com/aptible/auth-api",
  }),
};

export const fetchSources = api.get("/sources", function* (ctx, next) {
  const data = {
    _embedded: {
      sources: Object.values(sources),
    },
  };
  ctx.response = new Response(JSON.stringify(data));
  yield* next();
});

export const fetchSourceById = api.get<{ id: string }>(
  "/sources/:id",
  function* (ctx, next) {
    const data = (sources as any)[ctx.payload.id];
    ctx.response = new Response(JSON.stringify(data));
    yield* next();
  },
);

export const updateSource = api.patch<{ id: string; gitBrowseUrl: string }>(
  "/sources/:id",
  [
    function* (ctx, next) {
      ctx.request = ctx.req({
        body: JSON.stringify({ git_browse_url: ctx.payload.gitBrowseUrl }),
      });

      yield* next();

      if (!ctx.json.ok) {
        return;
      }

      ctx.loader = { message: "Successfully updated source!" };
    },
    // stubbed API
    function* (ctx, next) {
      const source = (sources as any)[ctx.payload.id];
      if (!source) {
        yield* next();
      }

      ctx.response = new Response(
        JSON.stringify({ ...source, git_browse_url: ctx.payload.gitBrowseUrl }),
      );

      yield* next();
    },
  ],
);
