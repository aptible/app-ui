import { deleteDashboard, updateDashboard } from "@app/deploy/dashboard";
import { useDispatch, useSelector } from "@app/react";
import { diagnosticsUrl } from "@app/routes";
import { selectTokenHasWriteAccess } from "@app/token";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../hooks/use-dashboard";
import { AppSidebarLayout } from "../layouts";
import {
  Breadcrumbs,
  Button,
  type Crumb,
  IconEdit,
  IconTrash,
  Tooltip,
} from "../shared";
import { HoverContext } from "../shared/diagnostics/hover";
import { DiagnosticsLineChart } from "../shared/diagnostics/line-chart";
import { DiagnosticsMessages } from "../shared/diagnostics/messages";
import { DiagnosticsResource } from "../shared/diagnostics/resource";

export const DiagnosticsDetailPage = () => {
  const { id = "" } = useParams();
  const { dashboard, dashboardContents, loadingComplete } = useDashboard({
    id,
  });
  const [dashboardName, setDashboardName] = useState(dashboard.name);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [hoverTimestamp, setHoverTimestamp] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const canEditDiagnostics = useSelector(selectTokenHasWriteAccess);

  const diagnosticsCrumb: Crumb = {
    name: "Diagnostics",
    to: diagnosticsUrl(),
  };
  const [crumbs, setCrumbs] = useState<Crumb[]>([diagnosticsCrumb]);

  const deleteAction = deleteDashboard({ id: dashboard.id });

  // When dashboard loads, set name and add breadcrumb
  useEffect(() => {
    setDashboardName(dashboard.name);

    setCrumbs([
      diagnosticsCrumb,
      {
        name: dashboard.name,
        to: window.location.href,
      },
    ]);
  }, [dashboard]);

  const handleEditNameClick = () => {
    setCrumbs([diagnosticsCrumb]);
    setIsEditing(true);
  };

  const handleSaveNameClick = () => {
    setCrumbs([
      diagnosticsCrumb,
      {
        name: dashboardName,
        to: window.location.href,
      },
    ]);

    dispatch(updateDashboard({ id: dashboard.id, name: dashboardName }));

    setIsEditing(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveNameClick();
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDashboardName(e.target.value);
  };

  const handleDeleteClick = async () => {
    await dispatch(deleteAction);
    navigate(diagnosticsUrl());
  };

  return (
    <AppSidebarLayout>
      <div className="flex flex-row p-4">
        <Breadcrumbs crumbs={crumbs} />
        <div className="flex flex-row gap-2">
          {isEditing ? (
            <div className="flex flex-row gap-2 ml-2">
              <input
                type="text"
                value={dashboardName}
                onChange={handleNameChange}
                onKeyDown={handleNameKeyDown}
                className="border border-gray-300 rounded-md p-2"
              />
              <button
                type="button"
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded-md"
                onClick={handleSaveNameClick}
              >
                Save
              </button>
            </div>
          ) : (
            <>
              {canEditDiagnostics ? (
                <button type="button" onClick={handleEditNameClick}>
                  <IconEdit color="#aaa" className="w-3 h-3 ml-2" />
                </button>
              ) : (
                <Tooltip text="You do not have write access to edit diagnostics. Please contact support if you need to edit diagnostics.">
                  <button type="button" disabled>
                    <IconEdit color="#aaa" className="w-3 h-3 ml-2 mt-3" />
                  </button>
                </Tooltip>
              )}
            </>
          )}
        </div>
        {isEditing ? (
          <div className="flex flex-col gap-4 ml-auto">
            <Button
              type="submit"
              variant="delete"
              className="w-70 flex"
              onClick={handleDeleteClick}
            >
              <IconTrash color="#FFF" className="mr-2" />
              Delete Diagnostic
            </Button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 p-4">
        <HoverContext.Provider
          value={{ timestamp: hoverTimestamp, setTimestamp: setHoverTimestamp }}
        >
          <DiagnosticsMessages
            messages={dashboardContents.messages}
            showAllMessages={showAllMessages}
            setShowAllMessages={setShowAllMessages}
            loadingComplete={loadingComplete}
          />

          {dashboardContents.summary && (
            <>
              <h2 className="text-lg font-semibold">Summary</h2>
              <div className="text-gray-500">{dashboardContents.summary}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {Object.entries(dashboardContents.ranked_plots).map(
                  ([plotId, plot]) => (
                    <div
                      key={plotId}
                      className="border rounded-lg bg-white shadow-sm animate-fade-in"
                    >
                      <h3 className="font-medium text-gray-900 p-3 rounded-t-lg border-b">
                        {plot.resource_label} / {plot.title}
                      </h3>
                      <div className="pb-6 px-6">
                        <div className="mt-2 min-h-[200px]">
                          <DiagnosticsLineChart
                            showLegend={true}
                            keyId={plot.id}
                            chart={{
                              title: " ",
                              labels:
                                plot.series[0]?.points.map(
                                  (point) => point.timestamp,
                                ) || [],
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
                  ),
                )}
              </div>
            </>
          )}

          <h2 className="text-lg font-semibold mb-2">Resources</h2>
          <div className="space-y-4">
            {Object.entries(dashboardContents.resources).map(
              ([resourceId, resource]) => (
                <DiagnosticsResource
                  key={resourceId}
                  resource={resource}
                  startTime={dashboard.rangeBegin}
                  endTime={dashboard.rangeEnd}
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
