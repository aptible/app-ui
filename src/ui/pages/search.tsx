import cn from "classnames";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { capitalize } from "@app/string-utils";

import {
  AppItem,
  DbItem,
  EnvItem,
  ResourceItem,
  StackItem,
  selectRecentResourcesByPopularity,
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
import {
  selectAppById,
  selectDatabaseById,
  selectEnvironmentById,
  selectStackById,
} from "@app/deploy";

const ResourceView = ({ children }: { children: React.ReactNode }) => {
  const className = cn(
    "my-2 px-3 flex items-center justify-between min-h-[48px]",
    "cursor-pointer",
    "border border-gray-200 rounded-lg",
    "bg-white hover:bg-black-50",
  );
  return <div className={className}>{children}</div>;
};

const StackResource = ({ resource }: { resource: StackItem }) => {
  const stack = useSelector((s: AppState) =>
    selectStackById(s, { id: resource.id }),
  );
  return (
    <ResourceView>
      <StackItemView stack={stack} />
      <div className="text-black-300 text-base">{capitalize(resource.type)} ID: {capitalize(resource.id)}</div>
    </ResourceView>
  );
};

const EnvResource = ({ resource }: { resource: EnvItem }) => {
  const env = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: resource.id }),
  );
  return (
    <ResourceView>
      <EnvironmentItemView environment={env} />
      <div className="text-black-300 text-base">{capitalize(resource.type)} ID: {capitalize(resource.id)}</div>
    </ResourceView>
  );
};

const AppResource = ({ resource }: { resource: AppItem }) => {
  const env = useSelector((s: AppState) =>
    selectAppById(s, { id: resource.id }),
  );
  return (
    <ResourceView>
      <AppItemView app={env} />
      <div className="text-black-300 text-base">{capitalize(resource.type)} ID: {capitalize(resource.id)}</div>
    </ResourceView>
  );
};

const DbResource = ({ resource }: { resource: DbItem }) => {
  const db = useSelector((s: AppState) =>
    selectDatabaseById(s, { id: resource.id }),
  );
  return (
    <ResourceView>
      <DatabaseItemView database={db} />
      <div className="text-black-300 text-base">{capitalize(resource.type)} ID: {capitalize(resource.id)}</div>
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
  const recentResources = useSelector(selectRecentResourcesByPopularity);
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setParams({ search: ev.currentTarget.value });
  const curLimit = Math.min(resources.length, SEARCH_DISPLAY_LIMIT);
  const resultText = `Displaying ${curLimit} of ${resources.length} results`;

  return (
    <MenuWrappedPage>
      <InputSearch search={search} onChange={onChange} className="w-full" />

      <div className="mt-2">
        {search === "" ? (
          <div className="mt-4">
            <div className="text-black-300">Recent Resources</div>
            <div>
              {recentResources.slice(0, 10).map((resource) => {
                return (
                  <ResourceItemView key={resource.id} resource={resource} />
                );
              })}
            </div>

            <hr className="text-black-300 my-4" />

            <div className="text-black-300 text-center">
              Search for Stacks, Environments, Apps, and Databases by Name or
              ID.
            </div>
          </div>
        ) : (
          <div>
            <div className="text-gray-500 mt-4 text-base">{resultText}</div>
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
