import { useParams } from "react-router";

import { ActivityByApp } from "../shared";

export const AppActivityPage = () => {
  const { id = "" } = useParams();
  return <ActivityByApp appId={id} />;
};
