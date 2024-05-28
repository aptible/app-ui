import { api } from "@app/api";
import { createSelector } from "@app/fx";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import { type WebState, schema } from "@app/schema";
import type { DeployDatabaseCredential, LinkResponse } from "@app/types";

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

export const selectCredentialsByDatabaseId = createSelector(
  schema.databaseCredentials.selectTableAsList,
  (_: WebState, p: { dbId: string }) => p.dbId,
  (creds, dbId) => creds.filter((c) => c.databaseId === dbId),
);

export const credEntities = {
  database_credential: defaultEntity({
    id: "database_credential",
    save: schema.databaseCredentials.add,
    deserialize: deserializeDatabaseCredential,
  }),
};

export const fetchCredentialsByDatabaseId = api.get<{ dbId: string }>(
  "/databases/:dbId/database_credentials",
);

// https://github.com/aptible/deploy-ui/blob/1342a430ac6849b38eeaa64cdb94ada1754b26fd/app/database/vhosts/route.js#L50
// we have to take original credential URL and replace it with vhost information:
//   - postgresql://<user>:<pass>@<host>:<port>/db
// <host>: comes from vhost.external_host
// <port>: comes from schema.port_mapping which is [number1, number2][]
//   where `number1` is from the connectionUrl and `number2` is what we need to replace it with
export const connectionUrlRewrite = (
  connUrl: string,
  host: string,
  portMapping: [number, number][],
): string => {
  // if there's no external host then we cannot rewrite credential
  if (host === "") {
    return connUrl;
  }
  let connectionUrl = connUrl;
  const hostRe = new RegExp(/\@.+\:/);
  const portRe = new RegExp(/\:([0-9]+)\//);
  const port = connectionUrl.match(portRe);
  if (!port) return connUrl;

  const portFound = portMapping.find((pair) => port[1] === `${pair[0]}`);
  if (!portFound || portFound.length < 2) return connUrl;
  const portPair = portFound[1];

  connectionUrl = connectionUrl.replace(hostRe, `@${host}:`);
  connectionUrl = connectionUrl.replace(portRe, `:${portPair}/`);
  return connectionUrl;
};
