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
  IconArrowRight,
  Button,
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
          <div className="py-2 px-4 bg-black-50 flex flex-row items-center"><div className="text-md text-gray-500 flex-1">Enterprise Plan</div><p className="text-gray-500 text-sm">Last Updated: 5m ago</p></div>
          <div className="flex flex-row gap-4 py-4 px-8">
            <div className="flex-1"><div className="text-lg font-semibold">0</div><div>Dedicated Stacks</div></div>
            <div className="flex-1"><div className="text-lg font-semibold">2</div><div>Environments</div></div>
            <div className="flex-1"><div className="text-lg font-semibold">2</div><div>Apps</div></div>
            <div className="flex-1"><div className="text-lg font-semibold">1</div><div>Databases</div></div>
            <div className="flex-1"><div className="text-lg font-semibold">2</div><div>Members</div></div>
          </div>
        </Box>
        <Box className="flex flex-col !p-0 overflow-hidden">
          <div className="py-2 px-4 bg-black-50 flex flex-row items-center">
            <div className="text-md text-gray-500 flex-1">Operations Over Time</div>
            <div class="flex">
              <button disabled="" type="button" class="rounded-r-none hover:z-10 pointer-events-none !bg-black-100 flex items-center justify-center px-4 py-[1.5px] text-sm font-medium border border-black-100 font-bold shadow-sm text-black bg-white hover:bg-black-100 hover:border-black-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black-200 rounded-md opacity-50">1H</button>
              <button type="button" class="rounded-none -ml-[1px] -mr-[1px] hover:z-10  flex items-center justify-center px-4 py-[1.5px] text-sm font-medium border border-black-100 font-bold shadow-sm text-black bg-white hover:bg-black-100 hover:border-black-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black-200 rounded-md">1D</button>
              <button type="button" class="rounded-l-none hover:z-10  flex items-center justify-center px-4 py-[1.5px] text-sm font-medium border border-black-100 font-bold shadow-sm text-black bg-white hover:bg-black-100 hover:border-black-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black-200 rounded-md">1W</button>
              </div>
          </div>
          <div className="p-4">test</div>
        </Box>
        <Box>
          <div className="flex flex-row items-center gap-4 mb-3"><img src="/resource-types/logo-database.png" className="w-[30px] h-[30px]"></img><div className="text-xl font-semibold text-black">Introduction to Aptible</div></div>
          <div className="text-md text-black mb-4">Aptible is the No Infrastructure Platform as a Service that startups use to deploy in seconds, scale infinitely, and forget about infrastructure.</div>
          <Button>Start <IconArrowRight variant="sm" className="ml-1" /></Button>
        </Box>
        <Box className="flex flex-col !p-0 overflow-hidden">
          <div className="py-2 px-4 bg-black-50 flex flex-row items-center"><div className="text-md text-gray-500 flex-1">Getting Started</div><p className="text-gray-500 text-sm">3 of 4 Completed</p></div>
          <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-row items-center pb-4 border-b border-black-100"><div className="flex-1 flex items-center text-base text-indigo">Add SSH Keys <IconArrowRight variant="sm" className="ml-1 stroke-indigo" /></div><div className="text-base font-bold text-forest">DONE</div></div>
            <div className="flex flex-row items-center pb-4 border-b border-black-100"><div className="flex-1 flex items-center text-base text-indigo">Deploy App or Database <IconArrowRight variant="sm" className="ml-1 stroke-indigo" /></div><div className="text-base font-bold text-forest">DONE</div></div>
            <div className="flex flex-row items-center pb-4 border-b border-black-100"><div className="flex-1 flex items-center text-base text-indigo">Invite Members <IconArrowRight variant="sm" className="ml-1 stroke-indigo" /></div><div className="text-base font-bold text-forest">DONE</div></div>
            <div className="flex flex-row items-center"><div className="flex-1 flex items-center text-base text-indigo">Add Payment Option <IconArrowRight variant="sm" className="ml-1 stroke-indigo" /></div><div className="text-base font-bold text-gray-500">TODO</div></div>
          </div>
        </Box>
      </Group>
      <Box className="w-[600px] flex flex-col !p-0 overflow-hidden">
          <div className="py-2 px-4 bg-black-50 flex flex-row items-center">
            <div className="text-md text-gray-500 flex-1">Recent Activity</div>
            <div class="flex">
              <button disabled="" type="button" class="rounded-r-none hover:z-10 pointer-events-none !bg-black-100 flex items-center justify-center px-4 py-[1.5px] text-sm font-medium border border-black-100 font-bold shadow-sm text-black bg-white hover:bg-black-100 hover:border-black-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black-200 rounded-md opacity-50">All</button>
              <button type="button" class="rounded-l-none hover:z-10  flex items-center justify-center px-4 py-[1.5px] text-sm font-medium border border-black-100 font-bold shadow-sm text-black bg-white hover:bg-black-100 hover:border-black-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black-200 rounded-md">Failed</button>
              </div>
          </div>
          {/*Activity Item*/}
          <div className="flex flex-col">
            <div className="flex flex-row gap-3 py-2 px-4 border-b border-black-100 items-center">
              <img src="/resource-types/logo-database.png" className="w-[30px] h-[30px]"></img>
              <div className="break-words">app-ui backup restored<div className="text-sm text-gray-500 break-words">2025-01-16 02:41:40 UTC by Mark Corrigan</div></div>
            </div>
          </div>
          {/*Activity Item*/}
          <div className="flex flex-col">
            <div className="flex flex-row gap-3 py-2 px-4 border-b border-black-100 items-center">
              <img src="/resource-types/logo-environment.png" className="w-[30px] h-[30px]"></img>
              <div className="break-words">dashboard-production environment created<div className="text-sm text-gray-500 break-words">2025-01-16 02:41:40 UTC by Mark Corrigan</div></div>
            </div>
          </div>
          {/*Activity Item*/}
          <div className="flex flex-col">
            <div className="flex flex-row gap-3 py-2 px-4 border-b border-black-100 items-center">
              <img src="/resource-types/logo-database.png" className="w-[30px] h-[30px]"></img>
              <div className="break-words">app-ui backup deleted<div className="text-sm text-gray-500 break-words">2025-01-16 02:41:40 UTC by Mark Corrigan</div></div>
            </div>
          </div>
        </Box>
      </Group>
    </AppSidebarLayout>
  );
};
