import { diagnosticsCreateUrl } from "@app/routes";
// import { useState } from "react";
import { useParams } from "react-router-dom";
import { useDashboard } from "../hooks/use-dashboard";
import { AppSidebarLayout } from "../layouts";
import { Breadcrumbs, LoadingSpinner } from "../shared";
// import { HoverContext } from "../shared/diagnostics/hover";
// import { DiagnosticsMessages } from "../shared/diagnostics/messages";
// import { DiagnosticsResource } from "../shared/diagnostics/resource";

export const DiagnosticsDetailPage = () => {
  const { id = "" } = useParams();
  const { dashboard, isLoading } = useDashboard({ id });
  // const [showAllMessages, setShowAllMessages] = useState(false);
  // const [hoverTimestamp, setHoverTimestamp] = useState<string | null>(null);

  return (
    <AppSidebarLayout>
      <Breadcrumbs
        crumbs={[
          {
            name: "Diagnostics",
            to: diagnosticsCreateUrl(),
          },
          {
            name: dashboard.name,
            to: window.location.href,
          },
        ]}
      />

      <div className="flex flex-col gap-4 p-4">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div>
            <h1>{dashboard.name}</h1>
          </div>
        )}




        {/* <HoverContext.Provider
          value={{ timestamp: hoverTimestamp, setTimestamp: setHoverTimestamp }}
        >
          <DiagnosticsMessages
            messages={dashboard.messages}
            showAllMessages={showAllMessages}
            setShowAllMessages={setShowAllMessages}
          />

          <h2 className="text-lg font-semibold mb-2">Resources</h2>
          <div className="space-y-4">
            {Object.entries(dashboard.resources).map(
              ([resourceId, resource]) => (
                <DiagnosticsResource
                  key={resourceId}
                  resourceId={resourceId}
                  resource={resource}
                  startTime={startTime}
                  endTime={endTime}
                  synchronizedHoverContext={HoverContext}
                />
              ),
            )}
          </div>
        </HoverContext.Provider> */}
      </div>
    </AppSidebarLayout>
  );
};
