import cn from "classnames";

import { ApplicationSidebar, tokens } from "../shared";
import { selectNav } from "@app/nav";
import { useSelector } from "react-redux";

type Props = {
  children: React.ReactNode;
  header: React.ReactNode;
};

export function DetailPageLayout({ children, header }: Props) {
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
        {header}
        <main className={cn(tokens.layout["main width"], "py-0")}>
          {children}
        </main>
      </div>
    </div>
  );
}
