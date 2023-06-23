import { useParams } from "react-router";

export const StackDetailEnvironmentsPage = () => {
  const { id = "" } = useParams();
  return <div>Stack detail environments {id}</div>;
};
