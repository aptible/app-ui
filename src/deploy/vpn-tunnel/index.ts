import { api } from "@app/api";
import { createSelector } from "@app/fx";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import { WebState, schema } from "@app/schema";
import {
  DeployVpnTunnel,
  DeployVpnTunnelAttributes,
  DeployVpnTunnelState,
  LinkResponse,
} from "@app/types";

export interface DeployVpnTunnelResponse {
  id: number;
  handle: string;
  phase_1_alg: string;
  phase_1_dh_group: string;
  phase_1_lifetime: string;
  phase_2_alg: string;
  phase_2_dh_group: string;
  phase_2_lifetime: string;
  perfect_forward_secrecy: string;
  our_gateway: string;
  our_networks: string[];
  peer_gateway: string;
  peer_networks: string[];
  state: string;
  tunnel_attributes?: DeployVpnTunnelAttributes;
  auto: string;
  created_at: string;
  updated_at: string;
  _links: {
    stack: LinkResponse;
  };
  _type: "vpn_tunnel";
}

export const defaultVpnTunnelResponse = (
  s: Partial<DeployVpnTunnelResponse> = {},
): DeployVpnTunnelResponse => {
  const now = new Date().toISOString();
  return {
    id: 1,
    handle: "",
    phase_1_alg: "",
    phase_1_dh_group: "",
    phase_1_lifetime: "",
    phase_2_alg: "",
    phase_2_dh_group: "",
    phase_2_lifetime: "",
    perfect_forward_secrecy: "",
    our_gateway: "",
    our_networks: [],
    peer_gateway: "",
    peer_networks: [],
    state: "unknown",
    auto: "",
    tunnel_attributes: {
      connections: {},
      routed_connections: {},
      security_associations: {},
    },
    created_at: now,
    updated_at: now,
    _links: { stack: { href: "" } },
    _type: "vpn_tunnel",
    ...s,
  };
};

const deserializeVpnTunnelAttributes = (
  tun: DeployVpnTunnelResponse["tunnel_attributes"],
): DeployVpnTunnelAttributes => {
  if (!tun) {
    return {
      connections: {},
      routed_connections: {},
      security_associations: {},
    };
  }
  return tun;
};

const deserializeDeployVpnTunnel = (
  payload: DeployVpnTunnelResponse,
): DeployVpnTunnel => {
  return {
    id: `${payload.id}`,
    handle: payload.handle,
    phase1Alg: payload.phase_1_alg,
    phase1DhGroup: payload.phase_1_dh_group,
    phase1Lifetime: payload.phase_1_lifetime,
    phase2Alg: payload.phase_2_alg,
    phase2DhGroup: payload.phase_2_dh_group,
    phase2Lifetime: payload.phase_2_lifetime,
    ourGateway: payload.our_gateway,
    ourNetworks: payload.our_networks,
    peerGateway: payload.peer_gateway,
    peerNetworks: payload.peer_networks,
    perfectForwardSecrecy: payload.perfect_forward_secrecy,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    stackId: extractIdFromLink(payload._links.stack),
    state: payload.state as DeployVpnTunnelState,
    auto: payload.auto,
    tunnelAttributes: deserializeVpnTunnelAttributes(payload.tunnel_attributes),
  };
};

export const selectVpnTunnelById = schema.vpnTunnels.selectById;
export const selectVpnTunnel = schema.vpnTunnels.selectTable;
export const selectVpnTunnelsAsList = createSelector(
  schema.vpnTunnels.selectTableAsList,
  (vpnTunnels) =>
    [...vpnTunnels].sort((a, b) => a.handle.localeCompare(b.handle)),
);
export const selectVpnTunnelByStackId = createSelector(
  selectVpnTunnelsAsList,
  (_: WebState, props: { stackId: string }) => props.stackId,
  (vpnTunnels, stackId) => {
    return vpnTunnels.filter((vpnTunnel) => vpnTunnel.stackId === stackId);
  },
);

export const fetchVpnTunnelsByStackId = api.get<{ id: string }>(
  "/stacks/:id/vpn_tunnels",
);

export const vpnTunnelEntities = {
  vpn_tunnel: defaultEntity({
    id: "vpn_tunnel",
    deserialize: deserializeDeployVpnTunnel,
    save: schema.vpnTunnels.add,
  }),
};
