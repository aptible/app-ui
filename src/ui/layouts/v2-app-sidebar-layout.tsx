import { selectNav } from "@app/nav";
import { useSelector } from "@app/react";
import { Outlet } from "react-router";
import { Footer, Group, V2ApplicationSidebar } from "../shared";

interface Props {
  children?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function V2AppSidebarLayout({
  children,
  header,
  className = "",
  padding = true,
}: Props) {
  const { collapsed } = useSelector(selectNav);
  const collapsedOffset = collapsed ? 15.2 : 64;

  return (
    <div className={`flex h-full ${className}`}>
      <div
        className={`flex flex-col fixed inset-y-0 w-${collapsedOffset}`}
        style={{ width: collapsedOffset * 3.5 }}
      >
        <V2ApplicationSidebar />
      </div>
      <div
        className="h-full w-full"
        style={{ marginLeft: collapsedOffset * 3.5 }}
      >
        <main className={`h-full flex flex-col ${padding ? "py-4 px-7" : ""}`}>
          <Group>
            {header ? header : null}
            {children ? children : <Outlet />}
          </Group>
          <Footer />
        </main>
      </div>
    </div>
  );
}
