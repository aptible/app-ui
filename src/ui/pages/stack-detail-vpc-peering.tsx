import { useQuery } from "@app/fx";
import { useParams } from "react-router";

import type { AppState, DeployVpcPeer } from "@app/types";

import { fetchVpcPeersByStackId, selectVpcPeersByStackId } from "@app/deploy";
import { capitalize } from "@app/string-utils";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  ButtonLinkDocs,
  LoadResources,
  Pill,
  ResourceListView,
  TableHead,
  Td,
  pillStyles,
  tokens,
} from "../shared";
import { EmptyResourcesTable } from "../shared/empty-resources-table";

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
        <VPCPeerStatusPill vpcPeer={vpcPeer} />
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
    <div className="mb-4">
      <Box className="mb-4">
        <div class="flex justify-between items-center">
          <p className="flex mb-4 text-gray-500 text-md">
            Contact support to edit or add new VPC Peers.
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
                <tr className="group hover:bg-gray-50" key={vpcPeer.id}>
                  <VpcPeerPrimaryCell vpcPeer={vpcPeer} />
                  <VpcPeerHandle vpcPeer={vpcPeer} />
                  <VpcPeerDescription vpcPeer={vpcPeer} />
                </tr>
              ))}
            </>
          }
        />
      </LoadResources>
    </div>
  );
};
