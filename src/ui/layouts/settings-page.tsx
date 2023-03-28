import cn from "classnames";
import { Outlet } from "react-router";

import { ApplicationSidebar, SettingsSidebar, tokens } from "../shared";

export function SettingsPageLayout() {
  return (
    <>
      <div className="flex w-full h-full">
        <div className="flex w-64 flex-col inset-y-0 h-screen">
          <ApplicationSidebar />
        </div>

        <div className="flex w-64 flex-col inset-y-0 h-screen">
          <SettingsSidebar />
        </div>

        <div className="flex flex-col flex-1">
          <main className={cn(tokens.layout["main width"], "py-6")}>
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
