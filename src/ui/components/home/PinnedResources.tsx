import { selectAppById, selectDatabaseById } from "@app/deploy";
import { selectOrganizationSelectedId } from "@app/organizations";
import { useSelector } from "@app/react";
import { schema } from "@app/schema";
import type { PinnedResource } from "@app/types";
import { AppItemView, DatabaseItemView } from "@app/ui/shared";
import { StarIcon } from "@heroicons/react/24/outline";

const ResourceView = ({ resource }: { resource: PinnedResource }) => {
  const app = useSelector((s) => selectAppById(s, { id: resource.id }));
  const db = useSelector((s) => selectDatabaseById(s, { id: resource.id }));
  if (resource.type === "app") {
    return <AppItemView app={app} />;
  }
  return <DatabaseItemView database={db} />;
};

export const PinnedResources = () => {
  const orgId = useSelector(selectOrganizationSelectedId);
  const pinnedResources =
    useSelector((s) => schema.pinnedResources.selectById(s, { id: orgId })) ||
    [];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-medium">Pinned Resources</h2>
        <StarIcon className="w-4 h-4 text-yellow-500" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow">
        <div className="h-96 overflow-y-auto">
          {pinnedResources.length > 0 ? (
            <div
              className={`grid gap-2 p-2 ${pinnedResources.length > 5 ? "grid-cols-2" : "grid-cols-1"}`}
            >
              {pinnedResources.map((resource) => (
                <ResourceView
                  key={`${resource.type}-${resource.id}`}
                  resource={resource}
                />
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <StarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm mb-2">No pinned resources</p>
                <p className="text-xs text-gray-400">
                  Pin your most important resources for quick access
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
