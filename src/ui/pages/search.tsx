import cn from "classnames";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import {
  AppItem,
  DbItem,
  EnvItem,
  ResourceItem,
  StackItem,
  selectResourcesForSearch,
} from "@app/search";
import { AppState } from "@app/types";

import { MenuWrappedPage } from "../layouts";
import {
  AppItemView,
  DatabaseItemView,
  EnvironmentItemView,
  InputSearch,
  StackItemView,
} from "../shared";

const ResourceView = ({ children }: { children: React.ReactNode }) => {
  const className = cn(
    "my-2 p-2 flex items-center justify-between",
    "cursor-pointer",
    "border border-gray-200 rounded-lg",
    "bg-white hover:bg-black-50",
  );
  return <div className={className}>{children}</div>;
};

const StackResource = ({ resource }: { resource: StackItem }) => {
  return (
    <ResourceView>
      <StackItemView stack={resource.data} />
      <div className="text-black-300 text-sm">{resource.type}</div>
    </ResourceView>
  );
};

const EnvResource = ({ resource }: { resource: EnvItem }) => {
  return (
    <ResourceView>
      <EnvironmentItemView environment={resource.data} />
      <div className="text-black-300 text-sm">{resource.type}</div>
    </ResourceView>
  );
};

const AppResource = ({ resource }: { resource: AppItem }) => {
  return (
    <ResourceView>
      <AppItemView app={resource.data} />
      <div className="text-black-300 text-sm">{resource.type}</div>
    </ResourceView>
  );
};

const DbResource = ({ resource }: { resource: DbItem }) => {
  return (
    <ResourceView>
      <DatabaseItemView database={resource.data} />
      <div className="text-black-300 text-sm">{resource.type}</div>
    </ResourceView>
  );
};

const ResourceItemView = ({ resource }: { resource: ResourceItem }) => {
  if (resource.type === "stack") {
    return <StackResource resource={resource} />;
  }

  if (resource.type === "environment") {
    return <EnvResource resource={resource} />;
  }

  if (resource.type === "app") {
    return <AppResource resource={resource} />;
  }

  return <DbResource resource={resource} />;
};

const SEARCH_DISPLAY_LIMIT = 15;

export const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const resources = useSelector((s: AppState) =>
    selectResourcesForSearch(s, { search }),
  );
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setParams({ search: ev.currentTarget.value });

  return (
    <MenuWrappedPage>
      <InputSearch search={search} onChange={onChange} className="w-full" />

      {/*<div className="mt-2">
        <div className="text-black-300">Recent Activity</div>
      </div>

      <hr className="text-black-300 mt-2" />*/}

      <div className="mt-2">
        {search === "" ? null : (
          <div>
            <div className="text-black-300 text-sm">
              Displaying {Math.min(resources.length, SEARCH_DISPLAY_LIMIT)} of{" "}
              {resources.length} results
            </div>
            <div>
              {resources.slice(0, SEARCH_DISPLAY_LIMIT).map((resource) => {
                return (
                  <ResourceItemView key={resource.id} resource={resource} />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MenuWrappedPage>
  );
};
