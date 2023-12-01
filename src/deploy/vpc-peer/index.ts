import { api } from "@app/api";
import { createSelector } from "@app/fx";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import { WebState, db } from "@app/schema";
import { DeployVpcPeer, LinkResponse } from "@app/types";

export interface DeployVpcPeerResponse {
  id: number;
  connection_id: string;
  connection_status: string;
  description: string;
  peer_account_id: string;
  peer_vpc_id: string;
  created_at: string;
  updated_at: string;
  _links: {
    stack: LinkResponse;
  };
  _type: "vpc_peer";
}

export const defaultVpcPeerResponse = (
  s: Partial<DeployVpcPeerResponse> = {},
): DeployVpcPeerResponse => {
  const now = new Date().toISOString();
  return {
    id: 1,
    connection_id: "",
    connection_status: "",
    description: "",
    peer_account_id: "",
    peer_vpc_id: "",
    created_at: now,
    updated_at: now,
    _links: { stack: { href: "" } },
    _type: "vpc_peer",
    ...s,
  };
};

export const deserializeDeployVpcPeer = (
  payload: DeployVpcPeerResponse,
): DeployVpcPeer => {
  return {
    id: `${payload.id}`,
    connectionId: payload.connection_id,
    connectionStatus: payload.connection_status,
    description: payload.description,
    peerAccountId: payload.peer_account_id,
    peerVpcId: payload.peer_vpc_id,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    stackId: extractIdFromLink(payload._links.stack),
  };
};

export const selectVpcPeerById = db.vpcPeers.selectById;
export const selectVpcPeers = db.vpcPeers.selectTable;
export const selectVpcPeersAsList = createSelector(
  db.vpcPeers.selectTableAsList,
  (vpcPeers) => vpcPeers.sort((a, b) => a.id.localeCompare(b.id)),
);
export const selectVpcPeersByStackId = createSelector(
  selectVpcPeersAsList,
  (_: WebState, props: { stackId: string }) => props.stackId,
  (vpcPeers, stackId) => {
    return vpcPeers.filter((vpcPeer) => vpcPeer.stackId === stackId);
  },
);

export const fetchVpcPeersByStackId = api.get<{ id: string }>(
  "/stacks/:id/vpc_peers",
);

export const vpcPeerEntities = {
  vpc_peer: defaultEntity({
    id: "vpc_peer",
    deserialize: deserializeDeployVpcPeer,
    save: db.vpcPeers.add,
  }),
};
