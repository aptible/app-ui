import { useDispatch, useSelector } from "react-redux";
import { Outlet, useParams } from "react-router";

import { fetchStack, getStackType, selectStackById } from "@app/deploy";
import {
  stackDetailEnvsUrl,
  stackDetailVpcPeeringsUrl,
  stackDetailVpnTunnelsUrl,
  stacksUrl,
} from "@app/routes";
import { AppState, DeployStack } from "@app/types";

import {
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  TabItem,
} from "../shared";

import { MenuWrappedPage } from "./menu-wrapped-page";
import { setResourceStats } from "@app/search";
import { capitalize } from "@app/string-utils";
import { useEffect } from "react";
import { useQuery } from "saga-query/react";

export function StackHeader({ stack }: { stack: DeployStack }) {
  const stackType = getStackType(stack);
  return (
    <DetailHeader>
      <DetailTitleBar
        title="Stack Details"
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
        <div className="hidden md:block" />

        <DetailInfoItem title="Tenancy">{capitalize(stackType)}</DetailInfoItem>
        <DetailInfoItem title="CPU Isolation">
          {stack.cpuLimits ? "Enabled" : "Disabled"}
        </DetailInfoItem>
        <div className="hidden md:block" />
        <DetailInfoItem title="Region">{stack.region}</DetailInfoItem>
        <DetailInfoItem title="Outbound IP Addresses">
          {stack.outboundIpAddresses.join(", ")}
        </DetailInfoItem>
        <div className="hidden md:block" />
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

  const stack = useSelector((s: AppState) => selectStackById(s, { id }));
  const crumbs = [{ name: "Stacks", to: stacksUrl() }];

  const tabs: TabItem[] = [
    { name: "Environments", href: stackDetailEnvsUrl(id) },
    { name: "VPN Tunnels", href: stackDetailVpnTunnelsUrl(id) },
    { name: "VPC Peering", href: stackDetailVpcPeeringsUrl(id) },
  ];

  return (
    <DetailPageHeaderView
      {...loader}
      breadcrumbs={crumbs}
      title={stack.name}
      detailsBox={<StackHeader stack={stack} />}
      tabs={tabs}
    />
  );
}

export const StackDetailLayout = () => {
  return (
    <MenuWrappedPage header={<StackPageHeader />}>
      <Outlet />
    </MenuWrappedPage>
  );
};
