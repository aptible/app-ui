import { useParams } from "react-router";
import { DatabaseCredentialBox } from "../shared";

export const DatabaseCredentialsPage = () => {
  const { id = "" } = useParams();
  return <DatabaseCredentialBox dbId={id} />;
};
