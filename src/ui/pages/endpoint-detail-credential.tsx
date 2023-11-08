import { selectEndpointById, selectServiceById } from "@app/deploy";
import { AppState } from "@app/types";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { DatabaseCredentialBox } from "../shared";

export const EndpointDetailCredentialsPage = () => {
  const { id = "" } = useParams();
  const enp = useSelector((s: AppState) => selectEndpointById(s, { id }));
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: enp.serviceId }),
  );
  return (
    <DatabaseCredentialBox
      dbId={service.databaseId}
      externalHost={enp.externalHost}
    />
  );
};
