import { fetchStack, getStackType, selectStackById } from "@app/deploy";
import {
  stackDetailEnvsUrl,
  stackDetailVpcPeeringsUrl,
  stackDetailVpnTunnelsUrl,
  stacksUrl,
} from "@app/routes";
import { setResourceStats } from "@app/search";
import { capitalize } from "@app/string-utils";
import { AppState, DeployStack } from "@app/types";
import { SyntheticEvent } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useParams } from "react-router";
import { useQuery } from "saga-query/react";
import {
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  IconCopy,
  TabItem,
  Tooltip,
} from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";

const handleCopy = (e: SyntheticEvent, text: string) => {
  e.preventDefault();
  e.stopPropagation();
  navigator.clipboard.writeText(text);
};

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
        <DetailInfoItem title="ID">
          <div className="flex flex-row items-center">
            {stack.id}
            <Tooltip text="Copy">
              <IconCopy
                variant="sm"
                className="ml-2"
                color="#888C90"
                onClick={(e) => handleCopy(e, `${stack.id}`)}
              />
            </Tooltip>
          </div>
        </DetailInfoItem>
        <div className="col-span-2">
          <DetailInfoItem title="Memory Management">
            {stack.memoryLimits ? "Enabled" : "Disabled"}
          </DetailInfoItem>
        </div>
        <DetailInfoItem title="Tenancy">{capitalize(stackType)}</DetailInfoItem>
        <div className="col-span-2">
          <DetailInfoItem title="CPU Isolation">
            {stack.cpuLimits ? "Enabled" : "Disabled"}
          </DetailInfoItem>
        </div>
        <DetailInfoItem title="Region">{stack.region}</DetailInfoItem>
        <div className="col-span-2">
          <DetailInfoItem title="Outbound IP Addresses">
            {stack.outboundIpAddresses.join(", ")}
          </DetailInfoItem>
        </div>
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
    <AppSidebarLayout header={<StackPageHeader />}>
      <Outlet />
    </AppSidebarLayout>
  );
};
