import { Outlet } from "react-router";
import { SettingsSidebar } from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";

export function SettingsLayout() {
  return (
    <AppSidebarLayout padding={false}>
      <div className="flex h-full">
        <div className="w-64 h-full">
          <SettingsSidebar />
        </div>
        <div className="flex-1 pt-4 pb-7 px-7">
          <Outlet />
        </div>
      </div>
    </AppSidebarLayout>
  );
}
