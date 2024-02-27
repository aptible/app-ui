import { fetchStack, getStackType, selectStackById } from "@app/deploy";
import { useDispatch, useQuery, useSelector } from "@app/react";
import {
  stackDetailEnvsUrl,
  stackDetailHidsUrl,
  stackDetailUrl,
  stackDetailVpcPeeringsUrl,
  stackDetailVpnTunnelsUrl,
  stacksUrl,
} from "@app/routes";
import { setResourceStats } from "@app/search";
import { capitalize } from "@app/string-utils";
import { DeployStack } from "@app/types";
import { useEffect } from "react";
import { Outlet, useParams } from "react-router";
import {
  CopyText,
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  IconInfo,
  TabItem,
  Tooltip,
} from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";

export function StackHeader({
  stack,
  isLoading,
}: { stack: DeployStack; isLoading: boolean }) {
  const stackType = getStackType(stack);
  return (
    <DetailHeader>
      <DetailTitleBar
        title="Stack Details"
        isLoading={isLoading}
        icon={
          <img
            alt="Stack icon"
            src={
              stackType === "dedicated"
                ? "/resource-types/logo-dedicated-stack.png"
                : "/resource-types/logo-stack.png"
            }
          />
        }
        docsUrl="https://aptible.com/docs/stacks"
      />

      <DetailInfoGrid>
        <DetailInfoItem title="ID">{stack.id}</DetailInfoItem>
        <DetailInfoItem title="Memory Management">
          {stack.memoryLimits ? "Enabled" : "Disabled"}
        </DetailInfoItem>
        <DetailInfoItem title="Tenancy">{capitalize(stackType)}</DetailInfoItem>
        <DetailInfoItem title="">
          <Tooltip text="When sharing outbound IP addresses with vendors/partners for whitelisting, make sure to add all the provided IP addresses to the whitelist.">
            <IconInfo
              className="inline-block mb-1 mr-1 opacity-50 hover:opacity-100"
              variant="sm"
            />
            <span className="text-base font-semibold text-gray-900">
              Outbound IP Addresses
            </span>
          </Tooltip>
          <CopyText text={stack.outboundIpAddresses.join(", ")} />
        </DetailInfoItem>
        <DetailInfoItem title="Region">{stack.region}</DetailInfoItem>
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

  if (stack.exposeIntrusionDetectionReports) {
    tabs.push({ name: "Managed HIDS", href: stackDetailHidsUrl(id) });
  }

  return (
    <DetailPageHeaderView
      {...loader}
      breadcrumbs={crumbs}
      title={stack.name}
      detailsBox={<StackHeader stack={stack} isLoading={loader.isLoading} />}
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
