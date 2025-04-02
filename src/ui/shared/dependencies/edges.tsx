import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
} from "@xyflow/react";
import { IconAlertCircle } from "../icons";

export const DegradedEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  style.stroke = "#E09600"; // orange-400
  style.strokeWidth = "2px";

  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          className="button-edge__label nodrag nopan flex flex-row"
          style={{
            transform: `translate(-50%, -50%) translate(${midX}px,${midY}px)`,
            position: "absolute",
          }}
        >
          <div
            style={{ backgroundColor: "#E09600" }}
            className="text-white rounded-full inline-block text-xs p-1 vertical-center"
          >
            <IconAlertCircle color="white" className="w-4 h-4" />
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
