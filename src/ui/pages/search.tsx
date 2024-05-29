import {
  selectAppById,
  selectDatabaseById,
  selectEndpointById,
  selectEnvironmentById,
  selectStackById,
} from "@app/deploy";
import { useSelector } from "@app/react";
import {
  type AppItem,
  type DbItem,
  type EndpointItem,
  type EnvItem,
  type ResourceItem,
  type StackItem,
  getResourceStatId,
  selectResourcesByLastAccessed,
  selectResourcesByMostVisited,
  selectResourcesForSearch,
} from "@app/search";
import { capitalize } from "@app/string-utils";
import cn from "classnames";
import { useSearchParams } from "react-router-dom";
import { AppSidebarLayout } from "../layouts";
import {
  AppItemView,
  DatabaseItemView,
  EndpointItemView,
  EnvironmentItemView,
  InputSearch,
  StackItemView,
} from "../shared";

const ResourceView = ({ children }: { children: React.ReactNode }) => {
  const className = cn(
    "my-2 px-2 flex items-center justify-between min-h-[48px]",
    "cursor-pointer",
    "border border-gray-200 rounded-lg",
    "bg-white hover:bg-black-50",
  );
  return <div className={className}>{children}</div>;
};

const StackResource = ({ resource }: { resource: StackItem }) => {
  const stack = useSelector((s) => selectStackById(s, { id: resource.id }));
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
  const env = useSelector((s) => selectEnvironmentById(s, { id: resource.id }));
  return (
    <ResourceView>
      <EnvironmentItemView env={env} />
      <div className="text-black-300 text-base">
        {capitalize(resource.type)} ID: {capitalize(resource.id)}
      </div>
    </ResourceView>
  );
};

const AppResource = ({ resource }: { resource: AppItem }) => {
  const env = useSelector((s) => selectAppById(s, { id: resource.id }));
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
  const db = useSelector((s) => selectDatabaseById(s, { id: resource.id }));
  return (
    <ResourceView>
      <DatabaseItemView database={db} />
      <div className="text-black-300 text-base">
        {capitalize(resource.type)} ID: {capitalize(resource.id)}
      </div>
    </ResourceView>
  );
};

const EndpointResource = ({ resource }: { resource: EndpointItem }) => {
  const enp = useSelector((s) => selectEndpointById(s, { id: resource.id }));
  return (
    <ResourceView>
      <EndpointItemView endpoint={enp} />
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

  if (resource.type === "endpoint") {
    return <EndpointResource resource={resource} />;
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
          <div className="text-black-500">Recently Viewed</div>
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
          <div className="text-black-500">Most Visited</div>
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
  const resources = useSelector((s) => selectResourcesForSearch(s, { search }));
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setParams({ search: ev.currentTarget.value }, { replace: true });
  const curLimit = Math.min(resources.length, SEARCH_DISPLAY_LIMIT);
  const resultText = `Displaying ${curLimit} of ${resources.length} results`;

  const isSearching = search === "";
  const noResults = !isSearching && resources.length === 0;
  const View = () => {
    if (noResults) {
      return (
        <div className="mt-4 text-black-500">
          No results found for this search query.
        </div>
      );
    }

    if (isSearching) {
      return (
        <div className="mt-4">
          <div className="text-black-300 text-center">
            Search for Stacks, Environments, Apps, Databases, and Endpoints by
            Name, Type, or ID.
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
    <AppSidebarLayout>
      <InputSearch
        search={search}
        onChange={onChange}
        className="w-full h-[36px] mt-4"
        autoFocus
      />

      <div className="mt-2">
        <View />
      </div>
    </AppSidebarLayout>
  );
};
