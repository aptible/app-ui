import { useParams } from "react-router";

import { ActivityByEnv } from "../shared";

export const EnvironmentActivityPage = () => {
  const { id = "" } = useParams();
  return <ActivityByEnv envId={id} />;
};
