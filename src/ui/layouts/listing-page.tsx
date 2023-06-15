import { ApplicationSidebar } from "../shared";
import { selectNav } from "@app/nav";
import { useSelector } from "react-redux";

type Props = {
  children: React.ReactNode;
  withoutMargin?: boolean;
};

export function ListingPageLayout({ children, withoutMargin = false }: Props) {
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
          <main className="flex-1">
            <div
              className={withoutMargin ? "" : "mx-auto px-4 sm:px-6 md:px-8"}
            >
              <div className={withoutMargin ? "" : "py-4"}>{children}</div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
