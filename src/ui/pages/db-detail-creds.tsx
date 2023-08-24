import { Box, Secret, tokens } from "../shared";
import {
  fetchCredentialsByDatabaseId,
  selectCredentialsByDatabaseId,
} from "@app/deploy";
import { AppState, DeployDatabaseCredential } from "@app/types";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { useQuery } from "saga-query/react";

const Credential = ({ cred }: { cred: DeployDatabaseCredential }) => {
  return (
    <div className="flex flex-col gap-4 mb-4">
      <h2 className={tokens.type.h2}>{cred.type}</h2>
      <div>
        <h4 className={tokens.type.h4}>Connection URL</h4>
        <div className="mt-1">
          <Secret secret={cred.connectionUrl} />
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

  return (
    <Box>
      {creds.map((c) => (
        <Credential key={c.id} cred={c} />
      ))}
    </Box>
  );
};
