import { Outlet } from "react-router";
import { AppSidebarLayout } from "../layouts";
import { SettingsSidebar } from "../shared";

export function SettingsLayout() {
  return (
    <AppSidebarLayout padding={false}>
      <div className="flex h-full">
        <div className="w-64 h-full">
          <SettingsSidebar />
        </div>
        <div className="flex-1 p-4">
          <Outlet />
        </div>
      </div>
    </AppSidebarLayout>
  );
}
