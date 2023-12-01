import {
  connectionUrlRewrite,
  fetchCredentialsByDatabaseId,
  selectCredentialsByDatabaseId,
  selectDatabaseById,
} from "@app/deploy";
import { useQuery, useSelector } from "@app/react";
import { DeployDatabaseCredential } from "@app/types";
import { Box } from "../box";
import { IconAlertTriangle } from "../icons";
import { Secret } from "../secret";
import { tokens } from "../tokens";

export const Credential = ({
  cred,
  envId,
}: { cred: DeployDatabaseCredential; envId: string }) => {
  return (
    <div className="flex flex-col gap-2 mb-4">
      <h3 className={tokens.type.h3}>
        {cred.type} {cred.default ? "(default)" : ""}
      </h3>
      <div>
        <p className="text-base font-semibold text-gray-900">Connection URL</p>
        <div className="mt-1">
          <Secret secret={cred.connectionUrl} envId={envId} />
        </div>
      </div>
    </div>
  );
};

export const DatabaseCredentialBox = ({
  dbId,
  externalHost = "",
}: { dbId: string; externalHost?: string }) => {
  const creds = useSelector((s) => selectCredentialsByDatabaseId(s, { dbId }));
  useQuery(fetchCredentialsByDatabaseId({ dbId }));
  const db = useSelector((s) => selectDatabaseById(s, { id: dbId }));

  return (
    <Box>
      <h1 className="text-lg text-red-500 font-semibold flex items-center gap-2 mb-4">
        <IconAlertTriangle color="#AD1A1A" />
        Credentials - This information is sensitive: keep it safe!
      </h1>
      {creds.map((c) => {
        const url = connectionUrlRewrite(
          c.connectionUrl,
          externalHost,
          db.portMapping,
        );
        return (
          <Credential
            key={c.id}
            cred={{ ...c, connectionUrl: url }}
            envId={db.environmentId}
          />
        );
      })}
    </Box>
  );
};
