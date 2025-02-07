import type { Resource } from "@app/aptible-ai";
import type React from "react";
import { useState } from "react";
import {
  IconBox,
  IconCloud,
  IconCylinder,
  IconEndpoint,
  IconInfo,
  IconService,
  IconSource,
} from "../../shared/icons";
import type { HoverState } from "./hover";
import { DiagnosticsLineChart } from "./line-chart";
import { OperationsTimeline } from "./operations-timeline";

const ResourceIcon = ({ type }: { type: Resource["type"] }) => {
  switch (type) {
    case "app":
      return <IconBox />;
    case "database":
      return <IconCylinder />;
    case "endpoint":
      return <IconEndpoint />;
    case "service":
      return <IconService />;
    case "source":
      return <IconSource />;
    default:
      return <IconCloud />;
  }
};

const AnalysisSection = ({ analysis }: { analysis: string }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const toggleAnalysis = () => setShowAnalysis((show) => !show);
  const getAnalysisText = (analysis: string) => {
    if (!showAnalysis) return `${analysis.slice(0, 75).trim()} [...]`;
    return analysis;
  };
  const analysisText = getAnalysisText(analysis);

  if (!analysis) return null;

  return (
    <div
      className="mt-4 bg-orange-100 p-3 rounded-md cursor-pointer"
      onClick={toggleAnalysis}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleAnalysis();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start gap-2">
        <IconInfo className="w-4 h-4 mt-1 text-yellow-600 flex-shrink-0" />
        <div>
          <p className="text-gray-600">
            <strong className="mr-1">Analysis:</strong>
            {analysisText}
          </p>
        </div>
      </div>
    </div>
  );
};

export const DiagnosticsResource = ({
  resourceId,
  resource,
  startTime,
  endTime,
  synchronizedHoverContext,
}: {
  resourceId: string;
  resource: Resource;
  startTime: string;
  endTime: string;
  synchronizedHoverContext: React.Context<HoverState>;
}) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium text-xl flex gap-2 items-center bg-gray-50 p-4 -m-4 mb-4 border-b rounded-t-lg">
        <ResourceIcon type={resource.type} />
        <span className="font-mono text-lg font-bold">{resourceId}</span>
      </h3>

      {/* Operations */}
      {resource.operations && resource.operations.length > 0 && (
        <div className="mt-2">
          <div className="border rounded-lg bg-white shadow-sm animate-fade-in">
            <h4 className="font-medium text-gray-900 p-3 rounded-t-lg border-b">
              Operations
            </h4>
            <div className="p-6">
              <OperationsTimeline
                operations={resource.operations}
                startTime={startTime}
                endTime={endTime}
                synchronizedHoverContext={synchronizedHoverContext}
              />
            </div>
          </div>
        </div>
      )}

      {/* Plots */}
      {resource.plots && Object.entries(resource.plots).length > 0 && (
        <div className="mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {Object.entries(resource.plots)
              .filter(([_, plot]) =>
                // Only show plots that have data
                plot.series.some(
                  (series) => series.points && series.points.length > 0,
                ),
              )
              .map(([plotId, plot]) => (
                <div
                  key={plotId}
                  className="border rounded-lg bg-white shadow-sm animate-fade-in"
                >
                  <h4 className="font-medium text-gray-900 p-3 rounded-t-lg border-b">
                    {plot.title}
                  </h4>
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
                            data: series.points.map((point) => point.value),
                          })),
                        }}
                        xAxisUnit="minute"
                        yAxisLabel={undefined}
                        yAxisUnit={plot.unit}
                        annotations={plot.annotations}
                        synchronizedHoverContext={synchronizedHoverContext}
                      />
                    </div>
                    <AnalysisSection analysis={plot.analysis} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
