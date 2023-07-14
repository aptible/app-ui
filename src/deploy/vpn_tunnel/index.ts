import { selectDeploy } from "../slice";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import { AppState, DeployVpnTunnel, LinkResponse } from "@app/types";
import { createSelector } from "@reduxjs/toolkit";

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
    created_at: now,
    updated_at: now,
    _links: { stack: { href: "" } },
    _type: "vpn_tunnel",
    ...s,
  };
};

export const deserializeDeployVpnTunnel = (
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
  };
};

export const defaultDeployVpnTunnel = (
  s: Partial<DeployVpnTunnel> = {},
): DeployVpnTunnel => {
  const now = new Date().toISOString();
  return {
    id: "",
    handle: "",
    phase1Alg: "",
    phase1DhGroup: "",
    phase1Lifetime: "",
    phase2Alg: "",
    phase2DhGroup: "",
    phase2Lifetime: "",
    ourGateway: "",
    ourNetworks: [],
    peerGateway: "",
    peerNetworks: [],
    perfectForwardSecrecy: "",
    createdAt: now,
    updatedAt: now,
    stackId: "",
    ...s,
  };
};

export const DEPLOY_VPN_TUNNEL_NAME = "vpn_tunnels";
const slice = createTable<DeployVpnTunnel>({
  name: DEPLOY_VPN_TUNNEL_NAME,
});
const { add: addDeployVpnTunnel } = slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_VPN_TUNNEL_NAME],
);
const initVpnTunnel = defaultDeployVpnTunnel;
const must = mustSelectEntity(initVpnTunnel);
export const selectVpnTunnelById = must(selectors.selectById);
export const { selectTable: selectVpnTunnel } = selectors;
export const selectVpnTunnelsAsList = createSelector(
  selectors.selectTableAsList,
  (vpnTunnels) => vpnTunnels.sort((a, b) => a.handle.localeCompare(b.handle)),
);

export const vpnTunnelReducers = createReducerMap(slice);

export const vpnTunnelEntities = {
  vpn_tunnel: defaultEntity({
    id: "vpn_tunnel",
    deserialize: deserializeDeployVpnTunnel,
    save: addDeployVpnTunnel,
  }),
};
