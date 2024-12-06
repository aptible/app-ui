import { selectNav } from "@app/nav";
import { useSelector } from "@app/react";
import { schema } from "@app/schema";
import { selectCurrentUser } from "@app/users";
import { Outlet } from "react-router";
import {
  ApplicationSidebar,
  Footer,
  Group,
  NoticeBackupRpBanner,
} from "../shared";

interface Props {
  children?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function AppSidebarLayout({
  children,
  header,
  className = "",
  padding = true,
}: Props) {
  const { collapsed } = useSelector(selectNav);
  const collapsedOffset = collapsed ? 15.2 : 64;
  const user = useSelector(selectCurrentUser);
  const createdAt = new Date(user.createdAt);
  const notices = useSelector(schema.notices.select);
  const showNotice =
    notices["backup-rp-notice"] === "" &&
    createdAt < new Date(2024, 10 - 1, 17);

  return (
    <div className={`flex h-full ${className}`}>
      <div
        className={`flex flex-col fixed inset-y-0 w-${collapsedOffset}`}
        style={{ width: collapsedOffset * 3.5 }}
      >
        <ApplicationSidebar />
      </div>
      <div
        className="h-full w-full"
        style={{ marginLeft: collapsedOffset * 3.5 }}
      >
        <main className={`h-full flex flex-col ${padding ? "py-4 px-7" : ""}`}>
          <Group>
            {showNotice ? <NoticeBackupRpBanner /> : null}
            {header ? header : null}
            {children ? children : <Outlet />}
          </Group>
          <Footer />
        </main>
      </div>
    </div>
  );
}
