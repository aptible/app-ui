import { ActionList, ActionListView } from "./action-list-view";
import { tokens } from "./tokens";
import cn from "classnames";

type Element = React.ReactNode | JSX.Element;

interface ResourceHeaderProps {
  title: Element;
  description?: Element;
  actions?: ActionList;
  filterBar?: JSX.Element;
}

interface GenericResourceListProps {
  header?: JSX.Element;
  tableHeader: JSX.Element;
  tableBody: JSX.Element;
}

interface EmptyResultProps {
  title: Element;
  description: Element;
  action?: Element;
  className?: string;
}

export const EmptyResultView = ({
  title,
  description,
  action,
  className,
}: EmptyResultProps) => {
  return (
    <div className={cn("text-center", className)}>
      <h3 className={cn(tokens.type.h3, "mt-2")}>{title}</h3>
      <p className={cn(tokens.type["small lighter"], "mt-1")}>{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export const ResourceHeader = ({
  title,
  filterBar,
  description = "",
  actions = [],
}: ResourceHeaderProps) => {
  return (
    <div>
      <div className="flex">
        <div className="flex-1">
          <h1 className={cn(tokens.type.h2)}>{title}</h1>
          {description && (
            <p className="mt-2 text-sm text-gray-700">{description}</p>
          )}
        </div>
        {actions.length > 0 ? (
          <div className="w-1/2 lg:w-1/3">
            <ActionListView actions={actions} />
          </div>
        ) : null}
      </div>

      {filterBar ? <div className="my-4">{filterBar}</div> : null}
    </div>
  );
};

export const ResourceListView = ({
  header,
  tableHeader,
  tableBody,
}: GenericResourceListProps) => {
  return (
    <div>
      {header ? header : null}

      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          {tableHeader}
          <tbody className="divide-y divide-gray-200 bg-white">
            {tableBody}
          </tbody>
        </table>
      </div>
    </div>
  );
};
