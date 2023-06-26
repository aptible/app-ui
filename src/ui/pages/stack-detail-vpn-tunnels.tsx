import { useParams } from "react-router";

export const StackDetailVpnTunnelsPage = () => {
  const { id = "" } = useParams();
  return <div>Stack detail vpn tunnels {id}</div>;
};
