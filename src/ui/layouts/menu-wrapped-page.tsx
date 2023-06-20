import { ApplicationSidebar } from "../shared";
import { selectNav } from "@app/nav";
import { useSelector } from "react-redux";

type Props = {
  children: React.ReactNode;
  header?: React.ReactNode;
  secondaryMenus?: React.ReactNode;
  withoutMargin?: boolean;
};

export function MenuWrappedPage({
  children,
  header,
  secondaryMenus,
  withoutMargin = false,
}: Props) {
  const { collapsed } = useSelector(selectNav);
  const collapsedOffset = collapsed ? 14 : 64;

  return (
    <div className="flex">
      <div
        className={`flex w-${collapsedOffset} flex-col fixed inset-y-0`}
        style={{ width: collapsedOffset * 3.5 }}
      >
        <ApplicationSidebar />
      </div>
      <div className="flex" style={{ marginLeft: collapsedOffset * 3.5 }} />
      {secondaryMenus}
      <div className={"flex flex-col flex-1"}>
        {header}
        <main className="flex-1">
          <div className={withoutMargin ? "" : "mx-auto px-8"}>
            <div className={withoutMargin ? "" : "py-4"}>{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
