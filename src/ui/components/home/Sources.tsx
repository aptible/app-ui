import { useState, useEffect } from "react";
import { GlobeAltIcon } from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectSourcesAsList } from "@app/source";
import { sourceDetailUrl } from "@app/routes";
import { selectSourcesForTableSearch } from "@app/deploy";
import type { WebState } from "@app/schema";
import { Group, Tooltip, GitRef } from "../../shared";

export const Sources = () => {
  const dispatch = useDispatch();
  const sources = useSelector(selectSourcesAsList);
  const sourcesWithLiveCommits = useSelector((state: WebState) => 
    selectSourcesForTableSearch(state, { search: '', sortBy: 'liveCommits', sortDir: 'desc' })
  );

  // Loading states
  const isSourcesInitialLoad = sources === null || sourcesWithLiveCommits === null;
  const [isForceLoading, setIsForceLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  
  // Add forced loading delay on initial mount
  useEffect(() => {
    // Always show skeleton for at least 800ms to prevent wrong data flash
    const skeletonTimer = setTimeout(() => {
      setShowSkeleton(false);
    }, 800);

    // Only start the data loading timer once we have the data
    if (!isSourcesInitialLoad) {
      const dataTimer = setTimeout(() => {
        setIsForceLoading(false);
      }, 500);
      return () => {
        clearTimeout(skeletonTimer);
        clearTimeout(dataTimer);
      };
    }

    return () => clearTimeout(skeletonTimer);
  }, [isSourcesInitialLoad]);
  
  // Combine loading states - show loading if any condition is true
  const isSourcesLoading = isSourcesInitialLoad || isForceLoading || showSkeleton;

  // Only compute sourceWithMostLiveCommits when all loading is complete
  const sourceWithMostLiveCommits = (!isSourcesInitialLoad && !isForceLoading && !showSkeleton) ? sourcesWithLiveCommits?.[0] : null;

  // Empty state check should only happen after all loading is complete
  const isSourcesEmpty = !isSourcesInitialLoad && !isForceLoading && !showSkeleton && (!sources?.length || !sourcesWithLiveCommits?.length);

  // Add useEffect to trigger sources data load
  useEffect(() => {
    dispatch({ type: 'FETCH_SOURCES_REQUEST' });
  }, [dispatch]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Sources</h2>
        <Link 
          to="http://localhost:4200/sources" 
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View All →
        </Link>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {/* Left block - Total Source Repositories */}
          <div className="p-4 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-gray-500 mb-2">
              <GlobeAltIcon className="w-4 h-4" />
              <h3 className="text-sm font-medium text-gray-600">Total Source Repositories</h3>
            </div>
            {isSourcesLoading ? (
              <div className="h-10 w-16 bg-gray-200 rounded animate-pulse" />
            ) : (
              <Link 
                to="http://localhost:4200/sources" 
                className="text-2xl sm:text-3xl font-semibold text-blue-600 hover:text-blue-800"
              >
                {Array.isArray(sources) ? sources.length : 0}
              </Link>
            )}
          </div>

          {/* Right block - Top Connected Repository */}
          <div className="p-4 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-gray-500 mb-2">
              <GlobeAltIcon className="w-4 h-4" />
              <h3 className="text-sm font-medium text-gray-600">Top Connected Repository</h3>
            </div>
            <div className="flex flex-col items-center gap-3">
              {isSourcesLoading ? (
                <div className="flex items-center gap-3">
                  {/* Repository name skeleton */}
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  
                  {/* Live commits visual skeleton */}
                  <div className="flex gap-1">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="h-4 w-1.5 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                </div>
              ) : isSourcesEmpty ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm text-gray-500">No repositories found</span>
                  <Link 
                    to="/sources/setup"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Setup a source →
                  </Link>
                </div>
              ) : sourceWithMostLiveCommits ? (
                <div className="flex items-center gap-3">
                  <Link
                    to={sourceDetailUrl(sourceWithMostLiveCommits?.id || '')}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    {sourceWithMostLiveCommits?.displayName}
                  </Link>
                  
                  {/* Live Commits Visual */}
                  {sourceWithMostLiveCommits?.liveCommits?.length > 0 ? (
                    <Group
                      variant="horizontal"
                      size="xs"
                      className="items-center"
                    >
                      {sourceWithMostLiveCommits.liveCommits.slice(0, 7).map((liveCommit) => (
                        <Tooltip
                          key={liveCommit.sha}
                          fluid
                          theme="light"
                          placement="top"
                          text={
                            <GitRef
                              gitRef={liveCommit.ref}
                              commitSha={liveCommit.sha}
                              commitUrl={liveCommit.url}
                            />
                          }
                        >
                          <Link
                            to="#"
                            className="block bg-gray-300 h-[16px] w-[6px] hover:bg-indigo rounded-md"
                          />
                        </Tooltip>
                      ))}
                      {sourceWithMostLiveCommits.liveCommits.length > 7 ? (
                        <p className="text-xs text-gray-500">+{sourceWithMostLiveCommits.liveCommits.length - 7}</p>
                      ) : null}
                    </Group>
                  ) : (
                    <span className="text-xs text-gray-500">No live commits</span>
                  )}
                </div>
              ) : (
                <span className="text-sm text-gray-500">No repositories found</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 