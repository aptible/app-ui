import { api } from "@app/api";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import { AppState, DeployVpcPeer, LinkResponse } from "@app/types";
import { createSelector } from "@reduxjs/toolkit";
import { selectDeploy } from "../slice";

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

export const defaultDeployVpcPeer = (
  s: Partial<DeployVpcPeer> = {},
): DeployVpcPeer => {
  const now = new Date().toISOString();
  return {
    id: "",
    connectionId: "",
    connectionStatus: "",
    description: "",
    peerAccountId: "",
    peerVpcId: "",
    createdAt: now,
    updatedAt: now,
    stackId: "",
    ...s,
  };
};

export const DEPLOY_VPC_PEER_NAME = "vpc_peers";
const slice = createTable<DeployVpcPeer>({
  name: DEPLOY_VPC_PEER_NAME,
});
const { add: addDeployVpcPeer } = slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_VPC_PEER_NAME],
);
const initVpcPeer = defaultDeployVpcPeer;
const must = mustSelectEntity(initVpcPeer);
export const selectVpcPeerById = must(selectors.selectById);
export const { selectTable: selectVpcPeers } = selectors;
export const selectVpcPeersAsList = createSelector(
  selectors.selectTableAsList,
  (vpcPeers) => vpcPeers.sort((a, b) => a.id.localeCompare(b.id)),
);
export const selectVpcPeersByStackId = createSelector(
  selectVpcPeersAsList,
  (_: AppState, props: { stackId: string }) => props.stackId,
  (vpcPeers, stackId) => {
    return vpcPeers.filter((vpcPeer) => vpcPeer.stackId === stackId);
  },
);

export const fetchVpcPeersByStackId = api.get<{ id: string }>(
  "/stacks/:id/vpc_peers",
);

export const vpcPeerReducers = createReducerMap(slice);

export const vpcPeerEntities = {
  vpc_peer: defaultEntity({
    id: "vpc_peer",
    deserialize: deserializeDeployVpcPeer,
    save: addDeployVpcPeer,
  }),
};
