import { useQuery } from "@app/fx";
import { useParams } from "react-router";

import type { AppState, DeployVpcPeer } from "@app/types";

import {
  LoadResources,
  Pill,
  ResourceListView,
  TableHead,
  Td,
  pillStyles,
  tokens,
} from "../shared";
import { EmptyResourcesTable } from "../shared/empty-resources-table";
import { fetchVpcPeersByStackId, selectVpcPeersByStackId } from "@app/deploy";
import { useSelector } from "react-redux";
import { capitalize } from "@app/string-utils";

const VPCPeerStatusPill = ({
  vpcPeer,
}: {
  vpcPeer: DeployVpcPeer;
}) => {
  return (
    <Pill
      className={
        vpcPeer.connectionStatus === "active"
          ? pillStyles.success
          : pillStyles.error
      }
    >
      {capitalize(vpcPeer.connectionStatus)}
    </Pill>
  );
};

const VpcPeerPrimaryCell = ({ vpcPeer }: { vpcPeer: DeployVpcPeer }) => {
  return (
    <Td className="flex-1">
      <div className="flex">
        <p className="leading-4">
          <VPCPeerStatusPill vpcPeer={vpcPeer} />
        </p>
      </div>
    </Td>
  );
};

const VpcPeerHandle = ({ vpcPeer }: { vpcPeer: DeployVpcPeer }) => {
  return (
    <Td className="flex-1">
      <div className="flex">
        <p className="leading-4">
          <span className={tokens.type.darker}>{vpcPeer.connectionId}</span>
        </p>
      </div>
    </Td>
  );
};

const VpcPeerDescription = ({ vpcPeer }: { vpcPeer: DeployVpcPeer }) => {
  return (
    <Td className="flex-1">
      <div className="flex">
        <p className="leading-4">
          <span className={tokens.type.darker}>{vpcPeer.description}</span>
        </p>
      </div>
    </Td>
  );
};

const vpcPeersHeaders = ["Status", "VPC Peer", "Description"];

export const StackDetailVpcPeeringPage = () => {
  const { id = "" } = useParams();
  const query = useQuery(fetchVpcPeersByStackId({ id }));
  const vpcPeers = useSelector((s: AppState) =>
    selectVpcPeersByStackId(s, { stackId: id }),
  );

  return (
    <LoadResources
      empty={
        <EmptyResourcesTable
          headers={vpcPeersHeaders}
          titleBar={
            <p className="flex text-gray-500 text-base mb-4">
              {vpcPeers.length} VPC Peer
              {vpcPeers.length !== 1 && "s"}
            </p>
          }
        />
      }
      query={query}
      isEmpty={vpcPeers.length === 0}
    >
      <ResourceListView
        header={
          <p className="flex text-gray-500 text-base mb-4">
            {vpcPeers.length} VPC Peer{vpcPeers.length !== 1 && "s"}
          </p>
        }
        tableHeader={<TableHead headers={vpcPeersHeaders} />}
        tableBody={
          <>
            {vpcPeers.map((vpcPeer) => (
              <tr key={vpcPeer.id}>
                <VpcPeerPrimaryCell vpcPeer={vpcPeer} />
                <VpcPeerHandle vpcPeer={vpcPeer} />
                <VpcPeerDescription vpcPeer={vpcPeer} />
              </tr>
            ))}
          </>
        }
      />
    </LoadResources>
  );
};
