import {
  fetchVpnTunnelsByStackId,
  selectVpnTunnelByStackId,
} from "@app/deploy";
import { AppState } from "@app/types";
import classNames from "classnames";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { useQuery } from "saga-query/react";
import {
  Box,
  Button,
  ButtonLinkDocs,
  EmptyResourcesTable,
  LoadResources,
  TableHead,
  Td,
  tokens,
} from "../shared";

export const StackDetailVpnTunnelsPage = () => {
  const { id = "" } = useParams();
  const query = useQuery(fetchVpnTunnelsByStackId({ id }));
  const vpnTunnels = useSelector((s: AppState) =>
    selectVpnTunnelByStackId(s, { stackId: id }),
  );

  return (
    <div className="mb-4">
      <Box className="mb-4">
        <ButtonLinkDocs href="https://www.aptible.com/docs/network-integrations" />
        <p className="flex mb-4 text-gray-500 text-md">
          Contact support to edit or add new VPN Tunnels.
        </p>
        <Link
          className="hover:no-underline"
          to="https://www.aptible.com/docs/support"
        >
          <Button className="font-semibold">Contact Support</Button>
        </Link>
      </Box>
      <LoadResources
        empty={
          <EmptyResourcesTable
            headers={[]}
            titleBar={
              <p className="flex text-gray-500 text-base mb-4">
                {vpnTunnels.length} VPN Tunnel
                {vpnTunnels.length !== 1 && "s"}
              </p>
            }
          />
        }
        query={query}
        isEmpty={vpnTunnels.length === 0}
      >
        <p className="flex text-gray-500 text-base mb-4">
          {vpnTunnels.length} VPN Tunnel{vpnTunnels.length !== 1 && "s"}
        </p>
        {vpnTunnels.map((vpnTunnel) => (
          <Box key={vpnTunnel.id} className="mt-4">
            <h1 className={classNames(tokens.type.h4, "block")}>
              {vpnTunnel.handle}
            </h1>
            <p className="flex text-gray-500 text-base my-4">Gateways</p>
            <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg my-4 mx-4 sm:my-auto sm:mx-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <TableHead headers={["Gateway", "IP Address"]} />
                <tbody className="divide-y divide-gray-200 bg-white">
                  <tr className="group hover:bg-gray-50">
                    <Td>Deploy Gateway</Td>
                    <Td>{vpnTunnel.ourGateway}</Td>
                  </tr>
                  <tr className="group hover:bg-gray-50">
                    <Td>Peer Gateway</Td>
                    <Td>{vpnTunnel.peerGateway}</Td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="flex text-gray-500 text-base my-4">Attributes</p>
            <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg my-4 mx-4 sm:my-auto sm:mx-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <TableHead headers={["IKE Phase", "Parameter", "Value"]} />
                <tbody className="divide-y divide-gray-200 bg-white">
                  <tr className="group hover:bg-gray-50">
                    <Td>Phase 1</Td>
                    <Td>Algorithm</Td>
                    <Td>{vpnTunnel.phase1Alg}</Td>
                  </tr>
                  <tr className="group hover:bg-gray-50">
                    <Td>Phase 1</Td>
                    <Td>Lifetime</Td>
                    <Td>{vpnTunnel.phase1Lifetime}</Td>
                  </tr>
                  <tr className="group hover:bg-gray-50">
                    <Td>Phase 1</Td>
                    <Td>DH Group</Td>
                    <Td>{vpnTunnel.phase1DhGroup}</Td>
                  </tr>
                  <tr className="group hover:bg-gray-50">
                    <Td>Phase 2</Td>
                    <Td>Algorithm</Td>
                    <Td>{vpnTunnel.phase2Alg}</Td>
                  </tr>
                  <tr className="group hover:bg-gray-50">
                    <Td>Phase 2</Td>
                    <Td>Lifetime</Td>
                    <Td>{vpnTunnel.phase2Lifetime}</Td>
                  </tr>
                  <tr className="group hover:bg-gray-50">
                    <Td>Phase 2</Td>
                    <Td>DH Group</Td>
                    <Td>{vpnTunnel.phase2DhGroup}</Td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="flex text-gray-500 text-base my-4">Deploy Networks</p>
            <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg my-4 mx-4 sm:my-auto sm:mx-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <TableHead
                  headers={[
                    "Network (As visible by peer)",
                    "Network (As routed by Aptible)",
                  ]}
                />
                <tbody className="divide-y divide-gray-200 bg-white">
                  {vpnTunnel.ourNetworks.map((ourNetwork) => (
                    <tr className="group hover:bg-gray-50" key={ourNetwork}>
                      <Td>{ourNetwork?.[0] || "N/A"}</Td>
                      <Td>{ourNetwork?.[1] || "N/A"}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="flex text-gray-500 text-base my-4">Peer Networks</p>
            <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg my-4 mx-4 sm:my-auto sm:mx-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <TableHead
                  headers={[
                    "Network (As visible by Aptible)",
                    "Network (As routed to Aptible)",
                  ]}
                />
                <tbody className="divide-y divide-gray-200 bg-white">
                  {vpnTunnel.peerNetworks.map((peerNetwork) => (
                    <tr className="group hover:bg-gray-50" key={peerNetwork}>
                      <Td>{peerNetwork?.[0] || "N/A"}</Td>
                      <Td>{peerNetwork?.[1] || "N/A"}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Box>
        ))}
      </LoadResources>
    </div>
  );
};
