import { dashboardUrl } from "@app/routes";
import { Link } from "react-router-dom";
import { AppSidebarLayout } from "../layouts";

import {
  ActionBar,
  Banner,
  ButtonLink,
  DescBar,
  FilterBar,
  Group,
  Box,
  IconPlusCircle,
  InputSearch,
  TBody,
  THead,
  Table,
  Td,
  Th,
  TitleBar,
  Tr,
  tokens,
} from "../shared";

export const DashboardPage = () => {
  return (
    <AppSidebarLayout>
      <TitleBar description="The dashboard for your organization.">
        Home
      </TitleBar>
      <Group variant="horizontal">
      <Group className="w-full">
        <Box className="flex flex-col !p-0 overflow-hidden">
          <div className="py-2 px-4 bg-black-50"><div className="text-md text-gray-500">Overview</div></div>
          <div className="flex flex-row gap-4 py-3 px-4">
            <div className="flex-1"><div className="text-lg">2</div><div>Dedicated Stacks</div></div>
            <div className="flex-1"><div className="text-lg">57</div><div>Environments</div></div>
            <div className="flex-1"><div className="text-lg">86</div><div>Apps</div></div>
            <div className="flex-1"><div className="text-lg">112</div><div>Databases</div></div>
            <div className="flex-1"><div className="text-lg">25</div><div>Members</div></div>
          </div>
        </Box>
        <Box className="flex flex-col !p-0 overflow-hidden">
          <div className="py-2 px-4 bg-black-50 flex flex-row items-center">
            <div className="text-md text-gray-500 flex-1">Operations Over Time</div>
            <div class="flex">
              <button disabled="" type="button" class="rounded-r-none hover:z-10 pointer-events-none !bg-black-100 flex items-center justify-center px-4 py-[1.5px] text-base font-medium border border-black-100 font-bold shadow-sm text-black bg-white hover:bg-black-100 hover:border-black-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black-200 rounded-md opacity-50">1H</button>
              <button type="button" class="rounded-none -ml-[1px] -mr-[1px] hover:z-10  flex items-center justify-center px-4 py-[1.5px] text-base font-medium border border-black-100 font-bold shadow-sm text-black bg-white hover:bg-black-100 hover:border-black-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black-200 rounded-md">1D</button>
              <button type="button" class="rounded-l-none hover:z-10  flex items-center justify-center px-4 py-[1.5px] text-base font-medium border border-black-100 font-bold shadow-sm text-black bg-white hover:bg-black-100 hover:border-black-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black-200 rounded-md">1W</button>
              </div>
          </div>
          <div className="p-4">test</div>
        </Box>
        <Box className="flex flex-col !p-0 overflow-hidden">
          <div className="py-2 px-4 bg-black-50"><div className="text-md text-gray-500">Growth Plan Invoice</div></div>
          <div className="p-4">test</div>
        </Box>
      </Group>
      <Box className="w-[600px] flex flex-col !p-0 overflow-hidden">
          <div className="py-2 px-4 bg-black-50 flex flex-row items-center">
            <div className="text-md text-gray-500 flex-1">Recent Activity</div>
            <div class="flex">
              <button disabled="" type="button" class="rounded-r-none hover:z-10 pointer-events-none !bg-black-100 flex items-center justify-center px-4 py-[1.5px] text-base font-medium border border-black-100 font-bold shadow-sm text-black bg-white hover:bg-black-100 hover:border-black-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black-200 rounded-md opacity-50">All</button>
              <button type="button" class="rounded-l-none hover:z-10  flex items-center justify-center px-4 py-[1.5px] text-base font-medium border border-black-100 font-bold shadow-sm text-black bg-white hover:bg-black-100 hover:border-black-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black-200 rounded-md">Errors</button>
              </div>
          </div>
          {/*Activity Item*/}
          <div className="flex flex-col">
            <div className="flex flex-row gap-4 p-4 border-b border-black-100 items-center">
              <img src="/resource-types/logo-database.png" className="w-[32px] h-[32px]"></img>
              <div><strong>Database Backup</strong> of app-ui<div className="text-black-500">5m ago by Mark Corrigan</div></div>
            </div>
          </div>
          {/*Activity Item*/}
          <div className="flex flex-col">
            <div className="flex flex-row gap-4 p-4 border-b border-black-100 items-center">
              <img src="/resource-types/logo-environment.png" className="w-[32px] h-[32px]"></img>
              <div><strong>New Environment</strong> in dashboard-production<div className="text-black-500">5m ago by Mark Corrigan</div></div>
            </div>
          </div>
          {/*Activity Item*/}
          <div className="flex flex-col">
            <div className="flex flex-row gap-4 p-4 border-b border-black-100 items-center">
              <img src="/resource-types/logo-database.png" className="w-[32px] h-[32px]"></img>
              <div><strong>Database Backup</strong> of app-ui<div className="text-black-500">5m ago by Mark Corrigan</div></div>
            </div>
          </div>
          {/*Activity Item*/}
          <div className="flex flex-col">
            <div className="flex flex-row gap-4 p-4 border-b border-black-100 items-center">
              <img src="/resource-types/logo-service.png" className="w-[32px] h-[32px]"></img>
              <div><strong>Autoscale</strong> of goldenboy-production<div className="text-black-500">5m ago by Mark Corrigan</div></div>
            </div>
          </div>
           {/*Activity Item*/}
          <div className="flex flex-col">
            <div className="flex flex-row gap-4 p-4 border-b border-black-100 items-center">
              <img src="/resource-types/logo-database.png" className="w-[32px] h-[32px]"></img>
              <div><strong>Database Backup</strong> of app-ui<div className="text-black-500">5m ago by Mark Corrigan</div></div>
            </div>
          </div>
          {/*Activity Item*/}
          <div className="flex flex-col">
            <div className="flex flex-row gap-4 p-4 border-b border-black-100 items-center">
              <img src="/resource-types/logo-environment.png" className="w-[32px] h-[32px]"></img>
              <div><strong>New Environment</strong> in dashboard-production<div className="text-black-500">5m ago by Mark Corrigan</div></div>
            </div>
          </div>
          {/*Activity Item*/}
          <div className="flex flex-col">
            <div className="flex flex-row gap-4 p-4 border-b border-black-100 items-center">
              <img src="/resource-types/logo-database.png" className="w-[32px] h-[32px]"></img>
              <div><strong>Database Backup</strong> of app-ui<div className="text-black-500">5m ago by Mark Corrigan</div></div>
            </div>
          </div>
          {/*Activity Item*/}
          <div className="flex flex-col">
            <div className="flex flex-row gap-4 p-4 border-b border-black-100 items-center">
              <img src="/resource-types/logo-service.png" className="w-[32px] h-[32px]"></img>
              <div><strong>Autoscale</strong> of goldenboy-production<div className="text-black-500">5m ago by Mark Corrigan</div></div>
            </div>
          </div>
        </Box>
      </Group>
    </AppSidebarLayout>
  );
};
