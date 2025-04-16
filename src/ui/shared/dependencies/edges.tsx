import { prettyDate } from "@app/date";
import { diagnosticsDetailUrl } from "@app/routes";
import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
} from "@xyflow/react";
import { Link } from "react-router-dom";
import { IconAlertCircle, IconDiagnostics } from "../icons";

export interface AnomalyHistory {
  [dashboardId: string]: {
    [observationTimestamp: string]: string;
  };
}

interface AnomalyHistoryEdgeProps extends EdgeProps {
  data?: {
    anomalyHistory?: AnomalyHistory;
    label?: string;
  };
}

export const AnomalyHistoryEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  label,
}: AnomalyHistoryEdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  style.stroke = "#E09600"; // orange-400
  style.strokeWidth = "1px";

  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  // Format relationship type by replacing underscores with spaces
  const relationshipLabel = data?.label ? data.label.replace(/_/g, " ") : "";

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan flex flex-row absolute z-10 cursor-default"
          style={{
            transform: `translate(-50%, -50%) translate(${midX}px,${midY}px)`,
            pointerEvents: "all",
          }}
        >
          <div className="group bg-white shadow border rounded-full inline-block text-xs p-1 vertical-center">
            <IconDiagnostics className="w-4 h-4" />

            <div className="group-hover:visible invisible absolute -top-7 w-auto p-6">
              <div className="flex flex-col bg-white shadow border rounded-md p-2 z-20 whitespace-nowrap">
                {relationshipLabel && (
                  <div className="font-medium border-b pb-1 mb-2">
                    {relationshipLabel}
                  </div>
                )}
                {Object.entries(data?.anomalyHistory || {}).map(
                  ([dashboardId, anomalyHistory]) => {
                    return (
                      <div
                        key={dashboardId}
                        className="flex flex-row gap-x-1 text-xs"
                      >
                        <Link
                          to={diagnosticsDetailUrl(dashboardId)}
                          className="flex"
                        >
                          {prettyDate(anomalyHistory.observationTimestamp)}
                        </Link>
                        <div>{anomalyHistory.label}</div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

interface DegradedEdgeProps extends EdgeProps {
  data?: {
    label?: string;
  };
}

export const DegradedEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  label,
}: DegradedEdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Create a new style object instead of modifying the existing one
  const edgeStyle = {
    ...style,
    stroke: "#E09600", // orange-400
    strokeWidth: "2px",
  };

  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  // Format the relationship type from the label by replacing underscores with spaces
  const relationshipLabel = data?.label ? data.label.replace(/_/g, " ") : "";

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan flex flex-row absolute z-10 cursor-default"
          style={{
            transform: `translate(-50%, -50%) translate(${midX}px,${midY}px)`,
            pointerEvents: "all",
          }}
        >
          <div
            style={{ backgroundColor: "#E09600" }}
            className="peer text-white rounded-full inline-block text-xs p-1 vertical-center"
          >
            <IconAlertCircle color="white" className="w-4 h-4" />
          </div>

          <div className="peer-hover:block hidden absolute -top-10 left-6 w-auto bg-black text-white rounded-md p-2 z-20 whitespace-nowrap">
            {relationshipLabel && <div>{relationshipLabel}</div>}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
