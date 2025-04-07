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
  label,
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

          {label && (
            <div className="peer-hover:block hidden absolute -top-10 left-6 w-auto bg-black text-white rounded-md p-2 z-20 whitespace-nowrap">
              <div>{label}</div>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
