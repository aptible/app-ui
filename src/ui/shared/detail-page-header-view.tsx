import cn from "classnames";
import { tokens } from "./tokens";
import { ActionList, ActionListView } from "./action-list-view";
import { Tabs, TabItem } from "./tabs";
import { Crumb, Breadcrumbs } from "./breadcrumbs";
type Element = JSX.Element | React.ReactNode;
type HeaderProps = {
  breadcrumbs?: Crumb[];
  actions?: ActionList;
  detailsBox?: React.ReactNode;
  title: Element;
  tabs: TabItem[];
};

export const DetailPageHeaderView = ({
  breadcrumbs,
  title,
  detailsBox,
  actions,
  tabs,
}: HeaderProps) => {
  return (
    <div className={cn("bg-white", "border-black-200", "border-b")}>
      <div className={cn(tokens.layout["main width"], "pt-8")}>
        {breadcrumbs && <Breadcrumbs crumbs={breadcrumbs} />}
      </div>

      <div className={cn("border-black-100", "border-b")}>
        <div
          className={cn(
            tokens.layout["main width"],
            "pb-6 pt-0 flex items-center",
          )}
        >
          <div className={cn(tokens.type.h1, "flex-1")}>{title}</div>
          {actions && <ActionListView actions={actions} />}
        </div>
      </div>

      {detailsBox ? detailsBox : null}

      {tabs && (
        <div className={cn(tokens.layout["main width"], "pt-1")}>
          <Tabs tabs={tabs} />
        </div>
      )}
    </div>
  );
};
