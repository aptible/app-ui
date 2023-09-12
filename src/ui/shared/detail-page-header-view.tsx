import { ReactNode } from "react";

import { ActionList, ActionListView } from "./action-list-view";
import { Box } from "./box";
import { Breadcrumbs, Crumb } from "./breadcrumbs";
import { ButtonLinkExternal } from "./button";
import { IconAlertTriangle, IconExternalLink } from "./icons";
import { TabItem, Tabs } from "./tabs";

interface HeaderProps {
  breadcrumbs?: Crumb[];
  actions?: ActionList;
  detailsBox?: React.ReactNode;
  title: string;
  tabs?: TabItem[];
  isError: boolean;
  message: string;
  meta: Record<string, any>;
}

const DetailErrorBox = ({
  message,
  meta = {},
}: { message: string; meta: Record<string, any> }) => {
  return (
    <Box className="flex items-center justify-center">
      <h1 className="text-lg text-red-500 font-semibold">
        <IconAlertTriangle
          className="inline pr-3 mb-1"
          style={{ width: 32 }}
          color="#AD1A1A"
        />
        <span className="ml-2">{message}</span>
      </h1>

      <div>
        {Object.keys(meta).map((key) => {
          return (
            <div key={key}>
              {key}: {meta[key]}
            </div>
          );
        })}
      </div>
    </Box>
  );
};

export const DetailPageHeaderView = ({
  breadcrumbs,
  title,
  detailsBox,
  actions,
  tabs,
  isError,
  message,
  meta,
}: HeaderProps) => {
  if (isError) {
    return <DetailErrorBox message={message} meta={meta} />;
  }

  return (
    <div className="flex flex-col">
      <div className="pb-[11px]">
        {breadcrumbs && (
          <Breadcrumbs crumbs={[...breadcrumbs, { to: null, name: title }]} />
        )}
      </div>

      <div className="flex items-center">
        {actions && <ActionListView actions={actions} />}
      </div>

      <div>{detailsBox ? detailsBox : null}</div>

      {tabs ? (
        <div className="pt-4">
          <Tabs tabs={tabs} />
        </div>
      ) : null}
    </div>
  );
};

export function DetailHeader({ children }: { children: ReactNode }) {
  return <Box className="flex flex-col gap-3">{children}</Box>;
}

export function DetailTitleBar({
  title,
  icon,
  docsUrl = "",
}: { title: string; icon?: JSX.Element; docsUrl?: string }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        {icon ? <div className="w-8 h-8 mr-3">{icon}</div> : null}
        <h1 className="text-lg text-gray-500">{title}</h1>
      </div>

      {docsUrl ? (
        <ButtonLinkExternal
          href={docsUrl}
          className="ml-5"
          variant="white"
          size="sm"
        >
          View Docs
          <IconExternalLink className="inline ml-1 h-5 mt-0" />
        </ButtonLinkExternal>
      ) : null}
    </div>
  );
}

export function DetailInfoGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid md:grid-cols-3 col-span-1 col-rows-1 gap-4">
      {children}
    </div>
  );
}

export function DetailInfoItem({
  title,
  children,
}: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <div>{children}</div>
    </div>
  );
}
