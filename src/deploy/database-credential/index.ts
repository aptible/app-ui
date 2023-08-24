import { selectDeploy } from "../slice";
import { api } from "@app/api";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import { createReducerMap, createTable } from "@app/slice-helpers";
import { AppState, DeployDatabaseCredential, LinkResponse } from "@app/types";
import { createSelector } from "@reduxjs/toolkit";

interface DatabaseCredentialResponse {
  _type: "database_credential";
  id: string;
  connection_url: string;
  default: boolean;
  type: string;
  _links: {
    database: LinkResponse;
  };
}

export const deserializeDatabaseCredential = (
  cred: DatabaseCredentialResponse,
): DeployDatabaseCredential => {
  return {
    id: cred.id,
    connectionUrl: cred.connection_url,
    default: cred.default,
    type: cred.type,
    databaseId: extractIdFromLink(cred._links.database),
  };
};

export const defaultDatabaseCredential = (
  p: Partial<DeployDatabaseCredential> = {},
): DeployDatabaseCredential => {
  return {
    id: "",
    databaseId: "",
    connectionUrl: "",
    type: "",
    default: false,
    ...p,
  };
};

export const DATABASE_CREDENTIALS_NAME = "databaseCredentials";
export const slice = createTable<DeployDatabaseCredential>({
  name: DATABASE_CREDENTIALS_NAME,
});
const { add: addDatabaseCredentials } = slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DATABASE_CREDENTIALS_NAME],
);
export const selectCredentialsByDatabaseId = createSelector(
  selectors.selectTableAsList,
  (_: AppState, p: { dbId: string }) => p.dbId,
  (creds, dbId) => creds.filter((c) => c.databaseId === dbId),
);
export const credReducers = createReducerMap(slice);

export const credEntities = {
  database_credential: defaultEntity({
    id: "database_credential",
    save: addDatabaseCredentials,
    deserialize: deserializeDatabaseCredential,
  }),
};

export const fetchCredentialsByDatabaseId = api.get<{ dbId: string }>(
  "/databases/:dbId/database_credentials",
);
