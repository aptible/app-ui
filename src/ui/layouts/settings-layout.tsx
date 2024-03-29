import { Outlet } from "react-router";
import { SettingsSidebar } from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";

export function SettingsLayout({ children }: { children?: React.ReactNode }) {
  return (
    <AppSidebarLayout>
      <div className="flex h-full pb-7 gap-7 flex-col md:flex-row">
        <div className="w-full md:w-52">
          <SettingsSidebar />
        </div>
        <div className="w-full flex-1">{children ? children : <Outlet />}</div>
      </div>
    </AppSidebarLayout>
  );
}
