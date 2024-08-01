import {
  calculateCost,
  fetchStack,
  findBackupsByEnvId,
  findDisksByEnvId,
  findEndpointsByEnvId,
  findServicesByEnvId,
  findVpnTunnelsByStackId,
  formatCurrency,
  getStackType,
  getStackTypeTitle,
  selectBackupsAsList,
  selectDisksAsList,
  selectEndpointsAsList,
  selectEnvironmentsByStackId,
  selectServices,
  selectStackById,
  selectVpnTunnelsAsList,
} from "@app/deploy";
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
import type { DeployStack } from "@app/types";
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
  type TabItem,
  Tooltip,
  getStackImg,
} from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";

export function StackHeader({
  stack,
  isLoading,
  cost,
}: { stack: DeployStack; isLoading: boolean; cost: number }) {
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
        <DetailInfoItem title="Est. Monthly Cost">
          {formatCurrency(cost)}
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

  // Cost
  const envs = useSelector((s) =>
    selectEnvironmentsByStackId(s, { stackId: stack.id }),
  );
  const services = useSelector((s) => selectServices(s));
  const disks = useSelector((s) => selectDisksAsList(s));
  const endpoints = useSelector((s) => selectEndpointsAsList(s));
  const backups = useSelector((s) => selectBackupsAsList(s));
  const vpnTunnels = useSelector((s) => selectVpnTunnelsAsList(s));

  const cost = calculateCost({
    services: envs.flatMap((env) =>
      findServicesByEnvId(Object.values(services), env.id),
    ),
    disks: envs.flatMap((env) => findDisksByEnvId(disks, env.id)),
    endpoints: envs.flatMap((env) =>
      findEndpointsByEnvId(endpoints, services, env.id),
    ),
    backups: envs.flatMap((env) => findBackupsByEnvId(backups, env.id)),
    vpnTunnels: findVpnTunnelsByStackId(vpnTunnels, stack.id),
    stacks: [stack],
  }).monthlyCost;

  if (stack.exposeIntrusionDetectionReports) {
    tabs.push({ name: "Managed HIDS", href: stackDetailHidsUrl(id) });
  }

  return (
    <DetailPageHeaderView
      {...loader}
      breadcrumbs={crumbs}
      title={stack.name}
      detailsBox={
        <StackHeader stack={stack} isLoading={loader.isLoading} cost={cost} />
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
