import { selectAptibleAiUrl } from "@app/config";
import { useSelector } from "@app/react";
import React, { useRef, useContext } from "react";
import { diagnosticsCreateUrl } from "@app/routes";
import { selectAccessToken } from "@app/token";
import { useEffect, useState, createContext } from "react";
import { useSearchParams } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { AppSidebarLayout } from "../layouts";
import { Breadcrumbs } from "../shared";
import {
  IconBox,
  IconCloud,
  IconCylinder,
  IconEndpoint,
  IconService,
  IconSource,
  IconInfo,
} from "../shared/icons";
import {
  CategoryScale,
  Chart as ChartJS,
  Colors,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  type TimeUnit,
  Title,
  Tooltip,
} from "chart.js";
import "chartjs-adapter-luxon";
import { Line } from "react-chartjs-2";
import { StreamingText } from "../shared/llm";

// Chart.js plugin to draw a vertical line on hover
const verticalLinePlugin = {
  id: 'verticalLine',
  beforeDraw: (chart: ChartJS) => {
    if (chart.tooltip?.getActiveElements()?.length) {
      const activePoint = chart.tooltip.getActiveElements()[0];
      const ctx = chart.ctx;
      const x = activePoint.element.x;
      const topY = chart.scales.y.top;
      const bottomY = chart.scales.y.bottom;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#94a3b8';
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.restore();
    }
  }
};

// ChartJS plugin to draw annotations
declare module 'chart.js' {
  interface Chart {
    annotationAreas?: Array<{
      x1: number;
      x2: number;
      y1: number;
      y2: number;
      description: string;
    }>;
  }

  interface PluginOptionsByType<TType> {
    annotations?: Annotation[];
  }
}

const annotationsPlugin = {
  id: 'annotations',
  afterDraw: (chart: ChartJS, args: any, options: any) => {
    const ctx = chart.ctx;
    const annotations = chart.options?.plugins?.annotations || [];

    annotations.forEach((annotation: any) => {
      // Convert timestamps to numbers for the time scale
      const xScale = chart.scales.x;
      const yScale = chart.scales.y;

      // Parse the timestamps into Date objects and get their timestamps
      const x1 = new Date(annotation.x_min).getTime();
      const x2 = new Date(annotation.x_max).getTime();

      // Convert to pixel coordinates
      const pixelX1 = xScale.getPixelForValue(x1);
      const pixelX2 = xScale.getPixelForValue(x2);
      const pixelY1 = yScale.getPixelForValue(annotation.y_max);
      const pixelY2 = yScale.getPixelForValue(annotation.y_min);

      // Draw annotation rectangle
      ctx.save();
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Solid red with 50% opacity
      ctx.fillRect(pixelX1, pixelY1, pixelX2 - pixelX1, pixelY2 - pixelY1);

      // Rectangle border
      ctx.strokeStyle = 'rgb(200, 0, 0)'; // Solid darker red
      ctx.strokeRect(pixelX1, pixelY1, pixelX2 - pixelX1, pixelY2 - pixelY1);

      // Annotation label
      ctx.save();
      const padding = 4;
      ctx.font = '10px monospace'; // Reduced font size
      const textMetrics = ctx.measureText(annotation.label);
      const textHeight = 12; // Reduced height to match smaller font
      const radius = 4; // Border radius

      // Calculate label box dimensions
      const boxX = pixelX1 + padding;
      const boxY = pixelY1 - textHeight - padding * 2;
      const boxWidth = textMetrics.width + padding * 2;
      const boxHeight = textHeight + padding * 2;

      // Label box shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Label box background
      ctx.fillStyle = 'rgba(200, 0, 0, 0.75)';
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, radius);
      ctx.fill();

      // Border
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgb(200, 0, 0)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label text
      ctx.fillStyle = 'white';
      ctx.textBaseline = 'bottom';
      ctx.fillText(annotation.label, pixelX1 + padding * 2, pixelY1 - padding);
      ctx.restore();
    });
  }
};

ChartJS.register(
  CategoryScale,
  Colors,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  verticalLinePlugin,
  annotationsPlugin
);

type Message = {
  id: string;
  severity: string;
  message: string;
};

type Operation = {
  id: number;
  status: string;
  created_at: string;
  description: string;
  log_lines: string[];
};

type Point = {
  timestamp: string;
  value: number;
};

type Annotation = {
  label: string;
  description: string;
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
};

type Series = {
  label: string;
  description: string;
  interpretation: string;
  annotations: Annotation[];
  points: Point[];
};

type Plot = {
  id: string;
  title: string;
  description: string;
  interpretation: string;
  analysis: string;
  unit: string;
  series: Series[];
  annotations: Annotation[];
};

type Resource = {
  id: string;
  type: string;
  notes: string;
  plots: {
    [key: string]: Plot;
  };
  operations: Operation[];
};

type Dashboard = {
  resources: {
    [key: string]: Resource;
  };
  messages: Message[];
};

type HoverState = {
  timestamp: string | null;
  setTimestamp: (timestamp: string | null) => void;
};

const HoverContext = createContext<HoverState>({
  timestamp: null,
  setTimestamp: () => { },
});

const OperationsTimeline = ({
  operations,
  startTime,
  endTime,
  synchronizedHoverContext
}: {
  operations: Operation[],
  startTime: string,
  endTime: string,
  synchronizedHoverContext: React.Context<HoverState>
}) => {
  const { timestamp, setTimestamp } = useContext(synchronizedHoverContext);
  const start = new Date(startTime);
  const end = new Date(endTime);
  const minutesDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  const timelineRef = useRef<HTMLDivElement>(null);

  // Create array of all minutes between start and end
  const minutes = Array.from({ length: minutesDiff + 1 }, (_, i) => i);

  // Map operations to their minute positions
  const operationsByMinute = operations.reduce((acc, op) => {
    const opTime = new Date(op.created_at);
    const minute = Math.floor((opTime.getTime() - start.getTime()) / (1000 * 60));
    acc[minute] = op;
    return acc;
  }, {} as { [key: number]: Operation });

  // Handle mouse move over timeline
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const totalMilliseconds = end.getTime() - start.getTime();
    const hoverTime = new Date(start.getTime() + (percentage * totalMilliseconds));

    // Round to nearest minute
    hoverTime.setSeconds(0);
    hoverTime.setMilliseconds(0);

    // Format timestamp correctly
    const formattedTimestamp = hoverTime.toISOString().slice(0, -5) + 'Z';
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
      console.error('Error calculating vertical line position:', error);
      return null;
    }
  };

  const verticalLinePosition = getVerticalLinePosition();

  // Helper function to extract operation type from description
  const getOperationType = (description: string) => {
    const match = description.match(/^\((succeeded|failed)\) (\w+)/);
    return match ? match[2] : 'unknown';
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
              borderLeft: '1px dashed #94a3b8'
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
                    <div className={`relative w-3 h-3 ${operation.status === 'succeeded' ? 'bg-lime-400' : 'bg-red-400'} rounded-full cursor-pointer before:absolute before:inset-0 before:rounded-full before:animate-ping before:opacity-75 ${operation.status === 'succeeded' ? 'before:bg-lime-400' : 'before:bg-red-400'}`} />

                    {/* Operation type label */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-100 px-1 rounded">
                      <span className="font-mono text-[10px] whitespace-nowrap uppercase">
                        {getOperationType(operation.description)}
                      </span>
                    </div>

                    {/* Tooltip */}
                    <div className="invisible group-hover:visible absolute bottom-full mb-2 -left-1/2 w-48 bg-gray-800 text-white text-sm rounded p-2 z-10">
                      <p className="text-sm">{operation.description}</p>
                      <p className="text-xs text-gray-300">({new Date(operation.created_at).toLocaleTimeString()} local)</p>
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

const DiagnosticsMessages = ({ messages, showAllMessages, setShowAllMessages }: {
  messages: Message[];
  showAllMessages: boolean;
  setShowAllMessages: (show: boolean) => void;
}) => {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Messages</h2>
        {messages.length > 1 && (
          <button
            onClick={() => setShowAllMessages(!showAllMessages)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {showAllMessages ? 'Show Latest' : `Show All (${messages.length})`}
          </button>
        )}
      </div>
      <div className="space-y-6">
        {(showAllMessages ? messages : messages.slice(-1)).map((message, index) => (
          <div
            key={message.id}
            className="flex items-start"
          >
            <img
              src={message.id === 'completion-message' ? '/aptible-mark.png' : '/thinking.gif'}
              className="w-[28px] h-[28px] mr-3"
              aria-label="App"
            />
            <div className="flex-1 bg-white rounded-lg px-4 py-2 shadow-sm">
              <StreamingText
                text={message.message}
                showEllipsis={(showAllMessages ? index === messages.length - 1 : true) && message.id !== 'completion-message'}
                animate={showAllMessages ? index === messages.length - 1 : true}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DiagnosticsResource = ({
  resourceId,
  resource,
  startTime,
  endTime,
  synchronizedHoverContext
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
        {resource.type === "app" ? <IconBox /> :
          resource.type === "database" ? <IconCylinder /> :
            resource.type === "endpoint" ? <IconEndpoint /> :
              resource.type === "service" ? <IconService /> :
                resource.type === "source" ? <IconSource /> :
                  <IconCloud />}
        <span className="font-mono text-lg font-bold">{resourceId}</span>
      </h3>

      {/* Operations */}
      {resource.operations && resource.operations.length > 0 && (
        <div className="mt-2">
          <div className="border rounded-lg bg-white shadow-sm animate-fade-in">
            <h4 className="font-medium text-gray-900 p-3 rounded-t-lg border-b">Operations</h4>
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
                plot.series.some(series => series.points && series.points.length > 0)
              )
              .map(([plotId, plot]) => (
                <div
                  key={plotId}
                  className="border rounded-lg bg-white shadow-sm animate-fade-in"
                >
                  <h4 className="font-medium text-gray-900 p-3 rounded-t-lg border-b">
                    {plot.title}
                  </h4>
                  <div className="p-6">
                    {plot.interpretation && (
                      <div className="mt-4 bg-orange-100 p-3 rounded-md">
                        <div className="flex items-start gap-2">
                          <IconInfo className="w-4 h-4 mt-1 text-yellow-600 flex-shrink-0" />
                          <div>
                            <p className="text-gray-600">
                              <strong className="mr-1">Interpretation:</strong>
                              {plot.interpretation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="mt-2 min-h-[200px]">
                      <SynchronizedHoverLineChartWrapper
                        showLegend={true}
                        keyId={plot.id}
                        chart={{
                          title: " ",
                          labels: plot.series[0]?.points.map(point => point.timestamp) || [],
                          datasets: plot.series.map(series => ({
                            label: series.label,
                            data: series.points.map(point => point.value)
                          }))
                        }}
                        xAxisUnit="minute"
                        yAxisLabel={plot.title}
                        yAxisUnit={plot.unit}
                        annotations={plot.annotations}
                        synchronizedHoverContext={synchronizedHoverContext}
                      />
                    </div>
                    {plot.analysis && (
                      <div className="mt-4">
                        <p className="mt-1 text-gray-500 text-xs">
                          <strong>Analysis:</strong>
                          {plot.analysis}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SynchronizedHoverLineChartWrapper = ({
  showLegend = true,
  keyId,
  chart: { labels, datasets: originalDatasets, title },
  xAxisUnit,
  yAxisLabel,
  yAxisUnit,
  annotations = [],
  synchronizedHoverContext,
}: {
  showLegend?: boolean;
  keyId: string;
  chart: {
    title: string;
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
    }>;
  };
  xAxisUnit: TimeUnit;
  yAxisLabel?: string;
  yAxisUnit?: string;
  annotations?: Annotation[];
  synchronizedHoverContext: React.Context<HoverState>;
}) => {
  const { timestamp, setTimestamp } = useContext(synchronizedHoverContext);
  const chartRef = React.useRef<ChartJS<"line">>();

  // Truncate sha256 resource names to 8 chars
  const datasets = originalDatasets.map(dataset => ({
    ...dataset,
    label: dataset.label.length === 64 ? dataset.label.slice(0, 8) : dataset.label
  }));

  if (!datasets || !title) return null;

  React.useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    if (!timestamp) {
      chart.setActiveElements([]);
      chart.tooltip?.setActiveElements([], { x: 0, y: 0 });
      chart.update();
      return;
    }

    const timestampIndex = labels.indexOf(timestamp);
    if (timestampIndex === -1) return;

    const activeElements = datasets.reduce<{
      datasetIndex: number;
      index: number;
    }[]>((acc, dataset, datasetIndex) => {
      if (!dataset.data[timestampIndex]) return acc;

      return [
        ...acc,
        {
          datasetIndex,
          index: timestampIndex,
        },
      ];
    }, []);

    chart.setActiveElements(activeElements);
    chart.tooltip?.setActiveElements(activeElements, { x: 0, y: 0 });
    chart.update();
  }, [timestamp, labels, datasets]);

  const formatYAxisTick = (value: number, unit?: string) => {
    if (!unit) return value;

    unit = unit.trim();
    if (unit === '%') return `${value}%`;
    if (unit.endsWith('B')) return `${value}${unit}`;

    return value;
  };

  return (
    <Line
      ref={chartRef}
      datasetIdKey={keyId}
      data={{
        labels,
        datasets,
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
          },
          colors: {
            forceOverride: true,
          },
          legend: {
            display: showLegend,
            labels: {
              usePointStyle: true,
              boxHeight: 5,
              boxWidth: 3,
              padding: 20,
            },
          },
          title: {
            font: {
              size: 16,
              weight: "normal",
            },
            color: "#595E63",
            align: "start",
            display: false,
            text: title,
            padding: showLegend
              ? undefined
              : {
                top: 10,
                bottom: 30,
              },
          },
          annotations: annotations,
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
        onHover: (event, elements, chart) => {
          if (!event.native) return;

          if (elements && elements.length > 0) {
            const timestamp = labels[elements[0].index];
            setTimestamp(timestamp);
          } else {
            setTimestamp(null);
          }
        },
        scales: {
          x: {
            border: {
              color: "#111920",
            },
            grid: {
              display: false,
            },
            ticks: {
              color: "#111920",
              maxRotation: 0,
              minRotation: 0,
              autoSkip: true,
              maxTicksLimit: 5,
            },
            adapters: {
              date: {
                zone: "UTC",
              },
            },
            time: {
              tooltipFormat: "yyyy-MM-dd HH:mm:ss 'UTC'",
              unit: xAxisUnit,
              displayFormats: {
                minute: "HH:mm 'UTC'",
                day: "MMM dd",
              },
            },
            type: "time",
          },
          y: {
            min: 0,
            border: {
              display: false,
            },
            title: yAxisLabel
              ? {
                display: true,
                text: yAxisLabel,
              }
              : undefined,
            ticks: {
              callback: (value) => formatYAxisTick(value as number, yAxisUnit),
              color: "#111920",
            },
          },
        },
      }}
    />
  );
};

export const DiagnosticsDetailPage = () => {
  // Parse the investigation parameters from the query string.
  const [searchParams, setSearchParams] = useSearchParams();
  const accessToken = useSelector(selectAccessToken);
  const appId = searchParams.get("appId");
  const symptomDescription = searchParams.get("symptomDescription");
  const startTime = searchParams.get("startTime");
  const endTime = searchParams.get("endTime");

  // If any of the parameters are missing, display an error message with a link
  // to the diagnostics create page.
  if (!appId || !symptomDescription || !startTime || !endTime) {
    throw new Error("Missing parameters");
  }

  // Connect to the Aptible AI WebSocket.
  const aptibleAiUrl = useSelector(selectAptibleAiUrl);
  const [socketConnected, setSocketConnected] = useState(true);
  const { lastJsonMessage: event, readyState } = useWebSocket<
    Record<string, any>
  >(
    `${aptibleAiUrl}/troubleshoot`,
    {
      queryParams: {
        token: accessToken,
        resource_id: appId,
        symptom_description: symptomDescription,
        start_time: startTime,
        end_time: endTime,
      },
    },
    socketConnected,
  );

  // If the socket is closed, set the socketConnected state to false (this is
  // mostly helpful for hot reloading, since the socket will typically close on
  // its own under normal circumstances).
  useEffect(() => {
    if (readyState === ReadyState.CLOSED) {
      setSocketConnected(false);
    }
  }, [readyState]);

  const [dashboard, setDashboard] = useState<Dashboard>({
    resources: {},
    messages: [],
  });

  const [showAllMessages, setShowAllMessages] = useState(false);
  const [hoverTimestamp, setHoverTimestamp] = useState<string | null>(null);
  const [hasShownCompletion, setHasShownCompletion] = useState(false);

  // Process each event from the websocket, and update the dashboard state.
  useEffect(() => {
    if (event?.type === "ResourceDiscovered") {
      setDashboard((prev) => ({
        ...prev,
        resources: {
          ...prev.resources,
          [event.resource_id]: {
            id: event.resource_id,
            type: event.resource_type,
            notes: event.notes,
            plots: {},
            operations: [],
          },
        },
      }));
    } else if (event?.type === "ResourceMetricsRetrieved") {
      setDashboard((prev) => ({
        ...prev,
        resources: {
          ...prev.resources,
          [event.resource_id]: {
            ...prev.resources[event.resource_id],
            plots: {
              ...prev.resources[event.resource_id].plots,
              [event.plot.id]: {
                id: event.plot.id,
                title: event.plot.title,
                description: event.plot.description,
                interpretation: event.plot.interpretation,
                analysis: event.plot.analysis,
                unit: event.plot.unit,
                series: event.plot.series,
                annotations: event.plot.annotations,
              },
            },
          },
        },
      }));
    } else if (event?.type === "PlotAnnotated") {
      setDashboard((prev) => ({
        ...prev,
        resources: {
          ...prev.resources,
          [event.resource_id]: {
            ...prev.resources[event.resource_id],
            plots: {
              ...prev.resources[event.resource_id].plots,
              [event.plot_id]: {
                ...prev.resources[event.resource_id].plots[event.plot_id],
                annotations: event.annotations,
              },
            },
          },
        },
      }));
    } else if (event?.type === "ResourceOperationsRetrieved") {
      setDashboard((prev) => ({
        ...prev,
        resources: {
          ...prev.resources,
          [event.resource_id]: {
            ...prev.resources[event.resource_id],
            operations: [
              ...prev.resources[event.resource_id].operations,
              ...event.operations,
            ],
          },
        },
      }));
    } else if (event?.type === "Message") {
      setDashboard((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: event.id,
            severity: event.severity,
            message: event.message,
          },
        ],
      }));
    } else {
      console.log(`Unhandled event type ${event?.type}`, event);
    }
  }, [JSON.stringify(event)]);

  // Insert an "analysis complete" message if the socket is closed
  useEffect(() => {
    if (readyState === ReadyState.CLOSED && !hasShownCompletion) {
      setHasShownCompletion(true);
      setDashboard((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: 'completion-message',
            severity: 'info',
            message: 'Analysis complete.',
          },
        ],
      }));
    }
  }, [readyState, hasShownCompletion]);

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
        <HoverContext.Provider value={{ timestamp: hoverTimestamp, setTimestamp: setHoverTimestamp }}>
          <DiagnosticsMessages
            messages={dashboard.messages}
            showAllMessages={showAllMessages}
            setShowAllMessages={setShowAllMessages}
          />

          {/* Resources Section */}
          <h2 className="text-lg font-semibold mb-2">Resources</h2>
          <div className="space-y-4">
            {Object.entries(dashboard.resources).map(([resourceId, resource]) => (
              <DiagnosticsResource
                key={resourceId}
                resourceId={resourceId}
                resource={resource}
                startTime={startTime!}
                endTime={endTime!}
                synchronizedHoverContext={HoverContext}
              />
            ))}
          </div>
        </HoverContext.Provider>
      </div>
    </AppSidebarLayout>
  );
};
