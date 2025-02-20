import { diagnosticsCreateUrl } from "@app/routes";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDashboard } from "../hooks/use-dashboard";
import { AppSidebarLayout } from "../layouts";
import { Breadcrumbs } from "../shared";
import { HoverContext } from "../shared/diagnostics/hover";
import { DiagnosticsMessages } from "../shared/diagnostics/messages";
import { DiagnosticsResource } from "../shared/diagnostics/resource";
import { DiagnosticsLineChart } from "../shared/diagnostics/line-chart";

export const DiagnosticsDetailPage = () => {
  const [searchParams] = useSearchParams();
  const appId = searchParams.get("appId");
  const symptomDescription = searchParams.get("symptomDescription");
  const startTime = searchParams.get("startTime");
  const endTime = searchParams.get("endTime");

  if (!appId || !symptomDescription || !startTime || !endTime) {
    throw new Error("Missing parameters");
  }

  const { dashboard } = useDashboard({
    appId,
    symptomDescription,
    startTime,
    endTime,
  });

  const [showAllMessages, setShowAllMessages] = useState(false);
  const [hoverTimestamp, setHoverTimestamp] = useState<string | null>(null);

  return (
    <AppSidebarLayout>
      <Breadcrumbs
        crumbs={[
          {
            name: "Diagnostics",
            to: diagnosticsCreateUrl(),
          },
          {
            name: `${appId} (${symptomDescription})`,
            to: window.location.href,
          },
        ]}
      />

      <div className="flex flex-col gap-4 p-4">
        <HoverContext.Provider
          value={{ timestamp: hoverTimestamp, setTimestamp: setHoverTimestamp }}
        >
          <DiagnosticsMessages
            messages={dashboard.messages}
            showAllMessages={showAllMessages}
            setShowAllMessages={setShowAllMessages}
          />

          {dashboard.summary && (
            <>
              <h2 className="text-lg font-semibold">Summary</h2>
              <div className="text-gray-500">{dashboard.summary}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {Object.entries(dashboard.ranked_plots).map(([plotId, plot]) => (
                  <div key={plotId} className="border rounded-lg bg-white shadow-sm animate-fade-in">
                    <h3 className="font-medium text-gray-900 p-3 rounded-t-lg border-b">
                      {plot.title}
                    </h3>
                    <div className="pb-6 px-6">
                      <div className="mt-2 min-h-[200px]">
                        <DiagnosticsLineChart
                          showLegend={true}
                          keyId={plot.id}
                          chart={{
                            title: " ",
                            labels: plot.series[0]?.points.map((point) => point.timestamp) || [],
                            datasets: plot.series.map((series) => ({
                              label: series.label,
                              data: series.points.map((point) => ({
                                x: point.timestamp,
                                y: point.value,
                              })),
                            })),
                          }}
                          xAxisMin={plot.x_axis_range[0]}
                          xAxisMax={plot.x_axis_range[1]}
                          xAxisUnit="minute"
                          yAxisLabel={undefined}
                          yAxisUnit={plot.unit}
                          annotations={plot.annotations}
                          synchronizedHoverContext={HoverContext}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

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
        </HoverContext.Provider>
      </div>
    </AppSidebarLayout>
  );
};
