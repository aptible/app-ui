import { capitalize } from "@app/string-utils";
import cn from "classnames";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import {
  selectAppById,
  selectDatabaseById,
  selectEnvironmentById,
  selectStackById,
} from "@app/deploy";
import {
  AppItem,
  DbItem,
  EnvItem,
  ResourceItem,
  StackItem,
  getResourceStatId,
  selectResourcesByLastAccessed,
  selectResourcesByMostVisited,
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
      <div className="text-black-300 text-base">
        {capitalize(resource.type)} ID: {capitalize(resource.id)}
      </div>
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
      <div className="text-black-300 text-base">
        {capitalize(resource.type)} ID: {capitalize(resource.id)}
      </div>
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
      <div className="text-black-300 text-base">
        {capitalize(resource.type)} ID: {capitalize(resource.id)}
      </div>
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
      <div className="text-black-300 text-base">
        {capitalize(resource.type)} ID: {capitalize(resource.id)}
      </div>
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

const EmptySearchView = () => {
  const recentResources = useSelector(selectResourcesByLastAccessed);
  const popularResources = useSelector(selectResourcesByMostVisited);

  return (
    <div>
      {recentResources.length > 0 ? (
        <div className="py-2">
          <div className="text-black-300">Recently Viewed</div>
          <div>
            {recentResources.slice(0, 5).map((resource) => {
              return (
                <ResourceItemView
                  key={getResourceStatId(resource)}
                  resource={resource}
                />
              );
            })}
          </div>
        </div>
      ) : null}

      {popularResources.length > 0 ? (
        <div className="py-2">
          <div className="text-black-300">Most Visited</div>
          <div>
            {popularResources.slice(0, 5).map((resource) => {
              return (
                <ResourceItemView
                  key={getResourceStatId(resource)}
                  resource={resource}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const resources = useSelector((s: AppState) =>
    selectResourcesForSearch(s, { search }),
  );
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setParams({ search: ev.currentTarget.value });
  const curLimit = Math.min(resources.length, SEARCH_DISPLAY_LIMIT);
  const resultText = `Displaying ${curLimit} of ${resources.length} results`;

  const isSearching = search === "";
  const noResults = !isSearching && resources.length === 0;
  const View = () => {
    if (noResults) {
      return (
        <div className="mt-4 text-black-300">
          No results found for this search query.
        </div>
      );
    }

    if (isSearching) {
      return (
        <div className="mt-4">
          <div className="text-black-300 text-center">
            Search for Stacks, Environments, Apps, and Databases by Name or ID.
          </div>

          <hr className="text-black-300 my-4" />

          <EmptySearchView />
        </div>
      );
    }

    return (
      <div>
        <div className="text-gray-500 mt-4 text-base">{resultText}</div>
        <div>
          {resources.slice(0, SEARCH_DISPLAY_LIMIT).map((resource) => {
            return (
              <ResourceItemView
                key={getResourceStatId(resource)}
                resource={resource}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <MenuWrappedPage>
      <InputSearch
        search={search}
        onChange={onChange}
        className="w-full"
        autoFocus
      />

      <div className="mt-2">
        <View />
      </div>
    </MenuWrappedPage>
  );
};
