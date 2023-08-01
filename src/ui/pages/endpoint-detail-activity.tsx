import { useParams } from "react-router";

import { ActivityByEndpoint } from "../shared";

export const EndpointDetailActivityPage = () => {
  const { id = "" } = useParams();

  return <ActivityByEndpoint enpId={id} />;
};
