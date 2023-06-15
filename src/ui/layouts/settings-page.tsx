import cn from "classnames";
import { Outlet } from "react-router";

import { ApplicationSidebar, SettingsSidebar, tokens } from "../shared";
import { selectNav } from "@app/nav";
import { useSelector } from "react-redux";

export function SettingsPageLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { collapsed } = useSelector(selectNav);
  const collapsedOffset = collapsed ? 14 : 64;

  return (
    <>
      <div className="flex w-full h-full">
        <div
          className={`hidden md:flex md:w-${collapsedOffset} md:flex-col md:fixed md:inset-y-0`}
        >
          <ApplicationSidebar />
        </div>

        <div className={`md:pl-${collapsedOffset} flex flex-col flex-1`}>
          <SettingsSidebar />
        </div>

        <div className="flex flex-col flex-1">
          <main className={cn(tokens.layout["main width"], "py-6")}>
            {children ? children : <Outlet />}
          </main>
        </div>
      </div>
    </>
  );
}
