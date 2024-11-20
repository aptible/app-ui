import {
  fetchVpnTunnelsByStackId,
  selectVpnTunnelByStackId,
} from "@app/deploy";
import { useQuery, useSelector } from "@app/react";
import { supportUrl } from "@app/routes";
import classNames from "classnames";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  ButtonLink,
  ButtonLinkDocs,
  IconInfo,
  TBody,
  THead,
  Table,
  Td,
  Th,
  Tooltip,
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
          <ButtonLink className="w-fit font-semibold" to={supportUrl()}>
            Contact Support
          </ButtonLink>
        </Link>
      </Box>

      <p className="flex text-gray-500 text-base mb-4">
        {vpnTunnels.length} VPN Tunnel{vpnTunnels.length !== 1 && "s"}
      </p>

      {vpnTunnels.map((vpnTunnel) => (
        <Box key={vpnTunnel.id} className="mt-4">
          <h1
            className={classNames(tokens.type.h4, "flex justify-between block")}
          >
            {vpnTunnel.handle}
            {vpnTunnel.auto === "route" ? (
              <Tooltip text="This tunnel is set to `routing` mode. In this mode, connections come up and down depending on traffic. Please check individual connections below.">
                <IconInfo
                  className="inline-block mb-1 mr-1 opacity-50 hover:opacity-100"
                  variant="sm"
                />
                <span className="text-base mt-1 text-gray-500">
                  Status: {vpnTunnel.state}
                </span>
              </Tooltip>
            ) : (
              <span className="text-base mt-1 text-gray-500">
                Status: {vpnTunnel.state}
              </span>
            )}
          </h1>

          <p className="flex text-gray-500 text-base my-4">Gateways</p>

          <Table>
            <THead>
              <Th>Gateway</Th>
              <Th>IP Address</Th>
            </THead>

            <TBody>
              <Tr>
                <Td>Aptible Gateway</Td>
                <Td>{vpnTunnel.ourGateway}</Td>
              </Tr>
              <Tr>
                <Td>Remote Gateway</Td>
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
                <Td>Algorithm</Td>
                <Td>{vpnTunnel.phase1Alg}</Td>
              </Tr>
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

          <p className="flex text-gray-500 text-base my-4">Aptible Networks</p>

          <Table>
            <THead>
              <Th>Network (As seen from Remote)</Th>
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

          <p className="flex text-gray-500 text-base my-4">Remote Networks</p>

          <Table>
            <THead>
              <Th>Network (As seen from Aptible)</Th>
              <Th>Network (As routed by Remote)</Th>
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
              <Th>Aptible Network</Th>
              <Th>Remote Network</Th>
              <Th>Status</Th>
            </THead>

            <TBody>
              {Object.values(vpnTunnel.tunnelAttributes.connections || {}).map(
                (connection) => (
                  <Tr key={connection.name}>
                    <Td>{connection.local_address}</Td>
                    <Td>{connection.remote_address}</Td>
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
