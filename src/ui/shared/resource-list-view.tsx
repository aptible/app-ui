import cn from 'classnames';
import { tokens } from './tokens';
import { ActionList, ActionListView } from './action-list-view';

type Element = React.ReactNode | JSX.Element;
type GenericResourceListProps = {
  title?: Element;
  description?: Element;
  actions?: ActionList;
  filterBar?: JSX.Element;
  tableHeader: JSX.Element;
  tableBody: JSX.Element;
};

type EmptyResultProps = {
  title: Element;
  description: Element;
  action?: Element;
  className?: string;
};

export const EmptyResultView = ({
  title,
  description,
  action,
  className,
}: EmptyResultProps) => {
  return (
    <div className={cn('text-center', className)}>
      <h3 className={cn(tokens.type.h3, 'mt-2')}>{title}</h3>
      <p className={cn(tokens.type['small lighter'], 'mt-1')}>{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export const ResourceListView = ({
  title,
  filterBar,
  description,
  actions = [],
  tableHeader,
  tableBody,
}: GenericResourceListProps) => {
  const showHeader = title || description || actions.length;
  const header = showHeader ? (
    <div className="grid gap-4 grid-cols-8">
      <div className="col-span-6">
        <h1 className={cn(tokens.type.h2)}>{title}</h1>
        {description && (
          <p className="mt-2 text-sm text-gray-700">{description}</p>
        )}
      </div>
      {actions && (
        <div className="col-span-2">
          <ActionListView actions={actions} />
        </div>
      )}
    </div>
  ) : null;

  return (
    <div className="">
      {header && header}
      {filterBar && filterBar}
      <div className="mt-6 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                {tableHeader}
                <tbody className="divide-y divide-gray-200 bg-white">
                  {tableBody}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
