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

  return (
    <>
      <div>
        <div
          className={`hidden md:flex md:w-${collapsedOffset} md:flex-col md:fixed md:inset-y-0`}
        >
          <ApplicationSidebar />
        </div>

        <div className={`md:pl-${collapsedOffset} flex flex-col flex-1`}>
          {header}
          <main className={cn(tokens.layout["main width"], "py-0")}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
