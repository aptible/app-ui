import {
  fetchCredentialsByDatabaseId,
  selectCredentialsByDatabaseId,
  selectDatabaseById,
} from "@app/deploy";
import { AppState, DeployDatabaseCredential } from "@app/types";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { useQuery } from "saga-query/react";
import { Box, IconAlertTriangle, Secret, tokens } from "../shared";

const Credential = ({
  cred,
  envId,
}: { cred: DeployDatabaseCredential; envId: string }) => {
  return (
    <div className="flex flex-col gap-2 mb-4">
      <h3 className={tokens.type.h3}>{cred.type}</h3>
      <div>
        <p className="text-base font-semibold text-gray-900">Connection URL</p>
        <div className="mt-1">
          <Secret secret={cred.connectionUrl} envId={envId} />
        </div>
      </div>
    </div>
  );
};

export const DatabaseCredentialsPage = () => {
  const { id = "" } = useParams();
  const creds = useSelector((s: AppState) =>
    selectCredentialsByDatabaseId(s, { dbId: id }),
  );
  useQuery(fetchCredentialsByDatabaseId({ dbId: id }));
  const db = useSelector((s: AppState) => selectDatabaseById(s, { id }));

  return (
    <Box>
      <h1 className="text-lg text-red-500 font-semibold mb-4">
        <IconAlertTriangle
          className="inline pr-3 mb-1"
          style={{ width: 32 }}
          color="#AD1A1A"
        />
        Credentials - This information is sensitive: keep it safe!
      </h1>
      {creds.map((c) => (
        <Credential key={c.id} cred={c} envId={db.environmentId} />
      ))}
    </Box>
  );
};
