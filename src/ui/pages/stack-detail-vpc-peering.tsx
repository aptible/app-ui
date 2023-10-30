import { fetchVpcPeersByStackId, selectVpcPeersByStackId } from "@app/deploy";
import { useQuery } from "@app/fx";
import { capitalize } from "@app/string-utils";
import type { AppState, DeployVpcPeer } from "@app/types";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { usePaginate } from "../hooks";
import {
  Box,
  Button,
  ButtonLinkDocs,
  DescBar,
  EmptyTr,
  FilterBar,
  Group,
  PaginateBar,
  Pill,
  TBody,
  THead,
  Table,
  Td,
  Th,
  Tr,
  pillStyles,
  tokens,
} from "../shared";

const VPCPeerStatusPill = ({
  vpcPeer,
}: {
  vpcPeer: DeployVpcPeer;
}) => {
  const cls =
    vpcPeer.connectionStatus === "active"
      ? pillStyles.success
      : pillStyles.error;
  return <Pill className={cls}>{capitalize(vpcPeer.connectionStatus)}</Pill>;
};

export const StackDetailVpcPeeringPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchVpcPeersByStackId({ id }));
  const vpcPeers = useSelector((s: AppState) =>
    selectVpcPeersByStackId(s, { stackId: id }),
  );
  const paginated = usePaginate(vpcPeers);

  return (
    <Group>
      <Group size="sm">
        <Box className="mb-4">
          <div className="flex justify-between items-start">
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

        <FilterBar>
          <Group variant="horizontal" size="lg" className="items-center">
            <DescBar>{paginated.totalItems} Peers</DescBar>
            <PaginateBar {...paginated} />
          </Group>
        </FilterBar>
      </Group>

      <Table>
        <THead>
          <Th>Status</Th>
          <Th>VPC Peer</Th>
          <Th>Description</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={3} /> : null}
          {paginated.data.map((vpcPeer) => (
            <Tr key={vpcPeer.id}>
              <Td>
                <VPCPeerStatusPill vpcPeer={vpcPeer} />
              </Td>
              <Td>
                <span className={tokens.type.darker}>
                  {vpcPeer.connectionId}
                </span>
              </Td>
              <Td>
                <span className={tokens.type.darker}>
                  {vpcPeer.description}
                </span>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </Group>
  );
};
