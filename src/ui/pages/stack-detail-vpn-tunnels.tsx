import {
  fetchVpnTunnelsByStackId,
  selectVpnTunnelByStackId,
} from "@app/deploy";
import { useQuery, useSelector } from "@app/react";
import classNames from "classnames";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  ButtonLinkDocs,
  TBody,
  THead,
  Table,
  Td,
  Th,
  Tr,
  tokens,
} from "../shared";

export const StackDetailVpnTunnelsPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchVpnTunnelsByStackId({ id }));
  const vpnTunnels = useSelector((s) =>
    selectVpnTunnelByStackId(s, { stackId: id }),
  );

  return (
    <div className="mb-4">
      <Box className="mb-4">
        <div className="flex justify-between items-start">
          <p className="flex mb-4 text-gray-500 text-md">
            Contact support to edit or add new VPN Tunnels.
          </p>
          <ButtonLinkDocs href="https://www.aptible.com/docs/network-integrations" />
        </div>

        <Link
          className="hover:no-underline"
          to="https://www.aptible.com/docs/support"
        >
          <Button className="font-semibold">Contact Support</Button>
        </Link>
      </Box>

      <p className="flex text-gray-500 text-base mb-4">
        {vpnTunnels.length} VPN Tunnel{vpnTunnels.length !== 1 && "s"}
      </p>

      {vpnTunnels.map((vpnTunnel) => (
        <Box key={vpnTunnel.id} className="mt-4">
          <h1 className={classNames(tokens.type.h4, "block")}>
            {vpnTunnel.handle}
          </h1>

          <p className="flex text-gray-500 text-base my-4">
            Status: {vpnTunnel.state}
          </p>

          <p className="flex text-gray-500 text-base my-4">Gateways</p>

          <Table>
            <THead>
              <Th>Gateway</Th>
              <Th>IP Address</Th>
            </THead>

            <TBody>
              <Tr>
                <Td>Deploy Gateway</Td>
                <Td>{vpnTunnel.ourGateway}</Td>
              </Tr>
              <Tr>
                <Td>Peer Gateway</Td>
                <Td>{vpnTunnel.peerGateway}</Td>
              </Tr>
            </TBody>
          </Table>

          <p className="flex text-gray-500 text-base my-4">Attributes</p>

          <Table>
            <THead>
              <Th>IKE Phase</Th>
              <Th>Parameter</Th>
              <Th>Value</Th>
            </THead>

            <TBody>
              <Tr>
                <Td>Phase 1</Td>
                <Td>Lifetime</Td>
                <Td>{vpnTunnel.phase1Lifetime}</Td>
              </Tr>
              <Tr>
                <Td>Phase 1</Td>
                <Td>DH Group</Td>
                <Td>{vpnTunnel.phase1DhGroup}</Td>
              </Tr>
              <Tr>
                <Td>Phase 2</Td>
                <Td>Algorithm</Td>
                <Td>{vpnTunnel.phase2Alg}</Td>
              </Tr>
              <Tr>
                <Td>Phase 2</Td>
                <Td>Lifetime</Td>
                <Td>{vpnTunnel.phase2Lifetime}</Td>
              </Tr>
              <Tr>
                <Td>Phase 2</Td>
                <Td>DH Group</Td>
                <Td>{vpnTunnel.phase2DhGroup}</Td>
              </Tr>
            </TBody>
          </Table>

          <p className="flex text-gray-500 text-base my-4">Deploy Networks</p>

          <Table>
            <THead>
              <Th>Network (As visible by peer)</Th>
              <Th>Network (As routed by Aptible)</Th>
            </THead>

            <TBody>
              {vpnTunnel.ourNetworks.map((ourNetwork) => (
                <Tr key={ourNetwork}>
                  <Td>{ourNetwork?.[0] || "N/A"}</Td>
                  <Td>{ourNetwork?.[1] || "N/A"}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>

          <p className="flex text-gray-500 text-base my-4">Peer Networks</p>

          <Table>
            <THead>
              <Th>Network (As visible by Aptible)</Th>
              <Th>Network (As routed by Aptible)</Th>
            </THead>

            <TBody>
              {vpnTunnel.peerNetworks.map((peerNetwork) => (
                <Tr key={peerNetwork}>
                  <Td>{peerNetwork?.[0] || "N/A"}</Td>
                  <Td>{peerNetwork?.[1] || "N/A"}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>

          <p className="flex text-gray-500 text-base my-4">Connection Status</p>

          <Table>
            <THead>
              <Th>Deploy Network</Th>
              <Th>Peer Network</Th>
              <Th>Status</Th>
            </THead>

            <TBody>
              {Object.values(vpnTunnel.tunnelAttributes.connections).map(
                (connection) => (
                  <Tr key={connection.name}>
                    <Td>{connection.localAddress}</Td>
                    <Td>{connection.remoteAddress}</Td>
                    <Td>{connection.state}</Td>
                  </Tr>
                ),
              )}
            </TBody>
          </Table>
        </Box>
      ))}
    </div>
  );
};
