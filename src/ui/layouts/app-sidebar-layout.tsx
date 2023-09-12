import { selectNav } from "@app/nav";
import { useSelector } from "react-redux";
import { Outlet } from "react-router";
import { ApplicationSidebar, Footer } from "../shared";

type Props = {
  children?: React.ReactNode;
  header?: React.ReactNode;
};

export function AppSidebarLayout({ children, header }: Props) {
  const { collapsed } = useSelector(selectNav);
  const collapsedOffset = collapsed ? 15.2 : 64;

  return (
    <div className="flex h-full">
      <div
        className={`flex flex-col fixed inset-y-0 w-${collapsedOffset}`}
        style={{ width: collapsedOffset * 3.5 }}
      >
        <ApplicationSidebar />
      </div>
      <div
        className="flex w-full py-4 px-7"
        style={{ marginLeft: collapsedOffset * 3.5 }}
      >
        <div className="flex flex-col flex-1">
          {header ? <div className="mb-4">{header}</div> : null}

          <main className="flex-1">{children ? children : <Outlet />}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
