import { createSelector } from "@reduxjs/toolkit";
import {
  api,
  cacheTimer,
  combinePages,
  DeployApiCtx,
  PaginateProps,
  thunks,
} from "@app/api";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import type {
  AppState,
  DeployServiceDefinition,
  LinkResponse,
} from "@app/types";
import { selectDeploy } from "../slice";

export interface DeployServiceDefinitionResponse {
  id: string;
  command: string;
  process_type: string;
  created_at: string;
  updated_at: string;
  _links: {
    app: LinkResponse;
  };
}

export const defaultDeployServiceDefinition = (
  e: Partial<DeployServiceDefinition> = {},
): DeployServiceDefinition => {
  const now = new Date().toISOString();
  return {
    createdAt: now,
    updatedAt: now,
    id: "",
    appId: "",
    command: "",
    processType: "",
    ...e,
  };
};

export const deserializeServiceDefinition = (
  payload: DeployServiceDefinitionResponse,
): DeployServiceDefinition => {
  const links = payload._links;
  return {
    id: payload.id.toString(),
    appId: extractIdFromLink(links.app),
    command: payload.command,
    processType: payload.process_type,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
};

export const DEPLOY_SERVICE_DEFINITION_NAME = "serviceDefinitions";
const slice = createTable<DeployServiceDefinition>({
  name: DEPLOY_SERVICE_DEFINITION_NAME,
});
const { add: addServiceDefinitions } = slice.actions;
export const serviceDefinitionReducers = createReducerMap(slice);

const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_SERVICE_DEFINITION_NAME],
);
export const { selectTableAsList: selectServiceDefinitionsAsList } = selectors;
const initApp = defaultDeployServiceDefinition();
const must = mustSelectEntity(initApp);
export const selectServiceDefinitionById = must(selectors.selectById);
export const selectServiceDefinitionsByAppId = createSelector(
  selectors.selectTableAsList,
  (_: AppState, props: { appId: string }) => props.appId,
  (serviceDefinitions, appId) =>
    serviceDefinitions
      .filter((serviceDefinition) => serviceDefinition.appId === appId)
      .sort((a, b) => a.processType.localeCompare(b.processType)),
);

export const fetchServiceDefinitionsByAppId = api.get<{ appId: string }>(
  "/apps/:appId/service_definitions",
  { saga: cacheTimer() },
);

export const deleteServiceDefinition = api.delete<{
  id: string;
}>("/service_definitions/:id");

export const fetchServiceDefinition = api.get<{ id: string }>(
  "/service_definitions/:id",
  api.cache(),
);

interface CreateServiceDefinitionProps {
  appId: string;
  command: string;
  processType: string;
}

export const createServiceDefinition = api.post<
  CreateServiceDefinitionProps,
  DeployServiceDefinitionResponse
>("/apps/:appId/service_definitions", function* (ctx, next) {
  const { command, processType } = ctx.payload;
  const body = {
    command: command,
    process_type: processType,
  };
  ctx.request = ctx.req({ body: JSON.stringify(body) });

  yield next();
});

export const serviceDefinitionEntities = {
  service_definition: defaultEntity({
    id: "service_definition",
    deserialize: deserializeServiceDefinition,
    save: addServiceDefinitions,
  }),
};
