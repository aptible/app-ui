import { selectAptibleAiUrl } from "@app/config";
import { useSelector } from "@app/react";
import { diagnosticsCreateUrl } from "@app/routes";
import { selectAccessToken } from "@app/token";
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { AppSidebarLayout } from "../layouts";
import { Breadcrumbs, PreText } from "../shared";

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
            metrics: [],
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
              [event.metric_name]: {
                name: event.metric_name,
                plot: event.plot,
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

      <div className="flex flex-row items-center justify-center flex-1 min-h-[500px]">
        <PreText
          className="max-w-7xl overflow-x-auto overflow-y-auto"
          text={JSON.stringify(dashboard, null, 2)}
          allowCopy
        />
      </div>
    </AppSidebarLayout>
  );
};
