import type { Operation } from "@app/aptible-ai";
import type React from "react";
import { useContext, useRef } from "react";
import type { HoverState } from "./hover";

export const OperationsTimeline = ({
  operations,
  startTime,
  endTime,
  synchronizedHoverContext,
  timezone = "utc",
}: {
  operations: Operation[];
  startTime: string;
  endTime: string;
  synchronizedHoverContext: React.Context<HoverState>;
  timezone?: "local" | "utc" | string;
}) => {
  const { timestamp, setTimestamp } = useContext(synchronizedHoverContext);
  const start = new Date(startTime);
  const end = new Date(endTime);
  const minutesDiff = Math.floor(
    (end.getTime() - start.getTime()) / (1000 * 60),
  );
  const timelineRef = useRef<HTMLDivElement>(null);

  // Create array of all minutes between start and end
  const minutes = Array.from({ length: minutesDiff + 1 }, (_, i) => i);

  // Map operations to their minute positions
  const operationsByMinute = operations.reduce(
    (acc, op) => {
      const opTime = new Date(op.created_at);
      const minute = Math.floor(
        (opTime.getTime() - start.getTime()) / (1000 * 60),
      );
      acc[minute] = op;
      return acc;
    },
    {} as { [key: number]: Operation },
  );

  // Handle mouse move over timeline
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const totalMilliseconds = end.getTime() - start.getTime();
    const hoverTime = new Date(
      start.getTime() + percentage * totalMilliseconds,
    );

    // Round to nearest minute
    hoverTime.setSeconds(0);
    hoverTime.setMilliseconds(0);

    // Format timestamp correctly
    const formattedTimestamp = `${hoverTime.toISOString().slice(0, -5)}Z`;
    setTimestamp(formattedTimestamp);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setTimestamp(null);
  };

  // Calculate vertical line position when timestamp changes
  const getVerticalLinePosition = () => {
    if (!timestamp) return null;

    try {
      const hoverTime = new Date(timestamp);
      const timeElapsed = hoverTime.getTime() - start.getTime();
      const totalDuration = end.getTime() - start.getTime();
      const position = (timeElapsed / totalDuration) * 100;

      // Ensure position is between 0 and 100
      return Math.max(0, Math.min(100, position));
    } catch (error) {
      console.error("Error calculating vertical line position:", error);
      return null;
    }
  };

  const verticalLinePosition = getVerticalLinePosition();

  // Helper function to extract operation type from description
  const getOperationType = (description: string) => {
    const match = description.match(/^\((succeeded|failed)\) (\w+)/);
    return match ? match[2] : "unknown";
  };

  return (
    <div className="mt-4">
      <div
        ref={timelineRef}
        className="relative h-16"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute w-full h-0.5 bg-gray-200 top-1/2 transform -translate-y-1/2" />

        {/* Vertical hover line */}
        {verticalLinePosition !== null && (
          <div
            className="absolute h-full w-px bg-transparent top-0"
            style={{
              left: `${verticalLinePosition}%`,
              borderLeft: "1px dashed #94a3b8",
            }}
          />
        )}

        {minutes.map((minute) => {
          const leftPercentage = (minute / minutesDiff) * 100;
          const operation = operationsByMinute[minute];

          return (
            <div
              key={minute}
              className="absolute top-1/2 transform -translate-y-1/2"
              style={{ left: `${leftPercentage}%` }}
            >
              <div className="group relative">
                {operation ? (
                  <>
                    <div
                      className={`relative w-3 h-3 ${operation.status === "succeeded" ? "bg-lime-400" : "bg-red-400"} rounded-full cursor-pointer before:absolute before:inset-0 before:rounded-full before:animate-ping before:opacity-75 ${operation.status === "succeeded" ? "before:bg-lime-400" : "before:bg-red-400"}`}
                    />

                    {/* Operation type label */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-100 px-1 rounded">
                      <span className="font-mono text-[10px] whitespace-nowrap uppercase">
                        {getOperationType(operation.description)}
                      </span>
                    </div>

                    {/* Tooltip */}
                    <div className="invisible group-hover:visible absolute bottom-full mb-2 -left-1/2 w-48 bg-gray-800 text-white text-sm rounded p-2 z-10">
                      <p className="text-sm">{operation.description}</p>
                      <p className="text-xs text-gray-300">
                        ({new Date(operation.created_at).toLocaleTimeString()}{" "}
                        {timezone === "local" ? "local" : timezone})
                      </p>
                    </div>
                  </>
                ) : (
                  // Empty marker for minutes without operations
                  <div className="hidden" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
