import {
  computeCostId,
  fetchCostsByStacks,
  fetchStack,
  getStackType,
  getStackTypeTitle,
  selectStackById,
} from "@app/deploy";
import { useDispatch, useLoader, useQuery, useSelector } from "@app/react";
import {
  stackDetailEnvsUrl,
  stackDetailHidsUrl,
  stackDetailUrl,
  stackDetailVpcPeeringsUrl,
  stackDetailVpnTunnelsUrl,
  stacksUrl,
} from "@app/routes";
import { schema } from "@app/schema";
import { setResourceStats } from "@app/search";
import type { DeployStack } from "@app/types";
import { useEffect } from "react";
import { Outlet, useParams } from "react-router";
import {
  CopyText,
  CostEstimateTooltip,
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  IconInfo,
  type TabItem,
  Tooltip,
  getStackImg,
} from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";

export function StackHeader({
  stack,
  isLoading,
  cost,
}: { stack: DeployStack; isLoading: boolean; cost: number | null }) {
  const stackType = getStackType(stack);
  return (
    <DetailHeader>
      <DetailTitleBar
        title="Stack Details"
        isLoading={isLoading}
        icon={<img alt="Stack icon" src={getStackImg(stackType)} />}
        docsUrl="https://aptible.com/docs/stacks"
      />

      <DetailInfoGrid>
        <DetailInfoItem title="ID">{stack.id}</DetailInfoItem>
        <DetailInfoItem title="Memory Management">
          {stack.memoryLimits ? "Enabled" : "Disabled"}
        </DetailInfoItem>
        <DetailInfoItem title="Tenancy">
          {getStackTypeTitle(stack)}
        </DetailInfoItem>
        <DetailInfoItem title="">
          <Tooltip text="When sharing outbound IP addresses with vendors/partners for whitelisting, make sure to add all the provided IP addresses to the whitelist.">
            <span className="text-base font-semibold text-gray-900 mr-1">
              Outbound IP Addresses
            </span>
            <IconInfo
              className="inline-block mb-1 opacity-50 hover:opacity-100"
              variant="sm"
            />
          </Tooltip>
          <CopyText text={stack.outboundIpAddresses.join(", ")} />
        </DetailInfoItem>
        <DetailInfoItem title="Region">{stack.region}</DetailInfoItem>
        <DetailInfoItem title="Est. Monthly Cost">
          <CostEstimateTooltip cost={cost} />
        </DetailInfoItem>
      </DetailInfoGrid>
    </DetailHeader>
  );
}

function StackPageHeader() {
  const { id = "" } = useParams();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setResourceStats({ id, type: "stack" }));
  }, []);
  const loader = useQuery(fetchStack({ id }));

  const stack = useSelector((s) => selectStackById(s, { id }));
  const crumbs = [{ name: "Stacks", to: stacksUrl() }];

  const tabs: TabItem[] = [
    { name: "Environments", href: stackDetailEnvsUrl(id) },
    { name: "VPN Tunnels", href: stackDetailVpnTunnelsUrl(id) },
    { name: "VPC Peering", href: stackDetailVpcPeeringsUrl(id) },
  ];

  const cost = useSelector((s) =>
    schema.costs.selectById(s, { id: computeCostId("Stack", id) }),
  );
  const { isLoading: isCostLoading } = useLoader(fetchCostsByStacks);

  if (stack.exposeIntrusionDetectionReports) {
    tabs.push({ name: "Managed HIDS", href: stackDetailHidsUrl(id) });
  }

  return (
    <DetailPageHeaderView
      {...loader}
      breadcrumbs={crumbs}
      title={stack.name}
      detailsBox={
        <StackHeader
          stack={stack}
          isLoading={loader.isLoading}
          cost={isCostLoading ? null : cost.estCost}
        />
      }
      tabs={tabs}
      lastBreadcrumbTo={stackDetailUrl(stack.id)}
    />
  );
}

export const StackDetailLayout = () => {
  return (
    <AppSidebarLayout header={<StackPageHeader />}>
      <Outlet />
    </AppSidebarLayout>
  );
};
