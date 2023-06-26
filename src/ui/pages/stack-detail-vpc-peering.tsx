import { useParams } from "react-router";

export const StackDetailVpcPeeringPage = () => {
  const { id = "" } = useParams();
  return <div>Stack detail vpc peering {id}</div>;
};
