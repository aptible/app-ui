import { ActionList, ActionListView } from "./action-list-view";
import { Breadcrumbs, Crumb } from "./breadcrumbs";
import { TabItem, Tabs } from "./tabs";
import { tokens } from "./tokens";
import cn from "classnames";
type Element = JSX.Element | React.ReactNode;
type HeaderProps = {
  breadcrumbs?: Crumb[];
  actions?: ActionList;
  detailsBox?: React.ReactNode;
  title: string;
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
        {breadcrumbs && (
          <Breadcrumbs crumbs={[...breadcrumbs, { to: null, name: title }]} />
        )}
      </div>

      <div
        className={cn(
          tokens.layout["main width"],
          "pb-0 pt-0 flex items-center",
        )}
      >
        {actions && <ActionListView actions={actions} />}
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
