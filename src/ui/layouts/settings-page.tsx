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
  const bodyLeftMargin = collapsed
    ? `pl-${collapsedOffset}`
    : `md:pl-${collapsedOffset}`;

  return (
    <div>
      <div
        className={`flex md:w-${collapsedOffset} flex-col fixed inset-y-0`}
        style={{ width: collapsedOffset * 3.5 }}
      >
        <ApplicationSidebar />
      </div>

      <div className={`${bodyLeftMargin} flex flex-col flex-1`}>
        <SettingsSidebar />
      </div>

      <div className="flex flex-col flex-1">
        <main className={cn(tokens.layout["main width"], "py-6")}>
          {children ? children : <Outlet />}
        </main>
      </div>
    </div>
  );
}
