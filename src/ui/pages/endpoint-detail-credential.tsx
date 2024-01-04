import { selectEndpointById, selectServiceById } from "@app/deploy";
import { useSelector } from "@app/react";
import { useParams } from "react-router";
import { DatabaseCredentialBox } from "../shared";

export const EndpointDetailCredentialsPage = () => {
  const { id = "" } = useParams();
  const enp = useSelector((s) => selectEndpointById(s, { id }));
  const service = useSelector((s) =>
    selectServiceById(s, { id: enp.serviceId }),
  );
  return (
    <DatabaseCredentialBox
      dbId={service.databaseId}
      externalHost={enp.externalHost}
    />
  );
};
