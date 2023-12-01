import { api, cacheTimer } from "@app/api";
import { createSelector } from "@app/fx";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import { WebState, db } from "@app/schema";
import type { DeployServiceDefinition, LinkResponse } from "@app/types";

export interface DeployServiceDefinitionResponse {
  id: number;
  command: string;
  process_type: string;
  created_at: string;
  updated_at: string;
  _links: {
    app: LinkResponse;
  };
}

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

export const selectServiceDefinitionsAsList =
  db.serviceDefinitions.selectTableAsList;
export const selectServiceDefinitionById = db.serviceDefinitions.selectById;
export const selectServiceDefinitionsByAppId = createSelector(
  db.serviceDefinitions.selectTableAsList,
  (_: WebState, props: { appId: string }) => props.appId,
  (serviceDefinitions, appId) =>
    serviceDefinitions
      .filter((serviceDefinition) => serviceDefinition.appId === appId)
      .sort((a, b) => a.processType.localeCompare(b.processType)),
);

export const fetchServiceDefinitionsByAppId = api.get<{ appId: string }>(
  "/apps/:appId/service_definitions",
  { supervisor: cacheTimer() },
);

export const deleteServiceDefinition = api.delete<{
  id: string;
}>("/service_definitions/:id");

export const fetchServiceDefinition = api.get<{ id: string }>(
  "/service_definitions/:id",
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

  yield* next();
});

export const serviceDefinitionEntities = {
  service_definition: defaultEntity({
    id: "service_definition",
    deserialize: deserializeServiceDefinition,
    save: db.serviceDefinitions.add,
  }),
};
