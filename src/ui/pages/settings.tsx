import { Outlet } from "react-router";
import { AppSidebarLayout } from "../layouts";
import { SettingsSidebar } from "../shared";

export function SettingsPage() {
  return (
    <AppSidebarLayout>
      <div className="flex w-64 flex-col inset-y-0 h-screen">
        <SettingsSidebar />
      </div>
      <div>
        <Outlet />
      </div>
    </AppSidebarLayout>
  );
}
