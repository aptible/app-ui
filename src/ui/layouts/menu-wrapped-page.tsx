import { useSelector } from "react-redux";

import { selectNav } from "@app/nav";

import { ApplicationSidebar } from "../shared";
import { Footer } from "../shared/footer";

type Props = {
  children: React.ReactNode;
  header?: React.ReactNode;
};

export function MenuWrappedPage({ children, header }: Props) {
  const { collapsed } = useSelector(selectNav);
  const collapsedOffset = collapsed ? 14 : 64;

  return (
    <div className="flex h-full">
      <div
        className={`flex flex-col fixed inset-y-0 w-${collapsedOffset}`}
        style={{ width: collapsedOffset * 3.5 }}
      >
        <ApplicationSidebar />
      </div>
      <div
        className="flex w-full p-8"
        style={{ marginLeft: collapsedOffset * 3.5 }}
      >
        <div className="flex flex-col flex-1">
          {header ? <div className="mb-4">{header}</div> : null}

          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
