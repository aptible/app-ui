import { useParams } from "react-router";

import { ActivityByDatabase } from "../shared";

export const DatabaseActivityPage = () => {
  const { id = "" } = useParams();
  return <ActivityByDatabase dbId={id} />;
};
