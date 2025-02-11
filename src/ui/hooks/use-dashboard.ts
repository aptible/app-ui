import type { Message, Resource } from "@app/aptible-ai";
import { selectAptibleAiUrl } from "@app/config";
import { useSelector } from "@app/react";
import { selectAccessToken } from "@app/token";
import { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

type Dashboard = {
  resources: {
    [key: string]: Resource;
  };
  messages: Message[];
};

type UseDashboardParams = {
  appId: string;
  symptomDescription: string;
  startTime: string;
  endTime: string;
};

const handleDashboardEvent = (
  dashboard: Dashboard,
  event: Record<string, any>,
): Dashboard => {
  switch (event?.type) {
    case "ResourceDiscovered":
      return {
        ...dashboard,
        resources: {
          ...dashboard.resources,
          [event.resource_id]: {
            id: event.resource_id,
            type: event.resource_type,
            notes: event.notes,
            plots: {},
            operations: [],
          },
        },
      };
    case "ResourceMetricsRetrieved":
      return {
        ...dashboard,
        resources: {
          ...dashboard.resources,
          [event.resource_id]: {
            ...dashboard.resources[event.resource_id],
            plots: {
              ...dashboard.resources[event.resource_id].plots,
              [event.plot.id]: {
                id: event.plot.id,
                title: event.plot.title,
                description: event.plot.description,
                interpretation: event.plot.interpretation,
                analysis: event.plot.analysis,
                unit: event.plot.unit,
                series: event.plot.series,
                annotations: event.plot.annotations,
                x_axis_range: event.plot.x_axis_range,
                y_axis_range: event.plot.y_axis_range,
              },
            },
          },
        },
      };
    case "PlotAnnotated":
      return {
        ...dashboard,
        resources: {
          ...dashboard.resources,
          [event.resource_id]: {
            ...dashboard.resources[event.resource_id],
            plots: {
              ...dashboard.resources[event.resource_id].plots,
              [event.plot_id]: {
                ...dashboard.resources[event.resource_id].plots[event.plot_id],
                analysis: event.analysis,
                annotations: event.annotations,
              },
            },
          },
        },
      };
    case "ResourceOperationsRetrieved":
      return {
        ...dashboard,
        resources: {
          ...dashboard.resources,
          [event.resource_id]: {
            ...dashboard.resources[event.resource_id],
            operations: [
              ...dashboard.resources[event.resource_id].operations,
              ...event.operations,
            ],
          },
        },
      };
    case "Message":
      return {
        ...dashboard,
        messages: [
          ...dashboard.messages,
          {
            id: event.id,
            severity: event.severity,
            message: event.message,
          },
        ],
      };
    default:
      console.log(`Unhandled event type ${event?.type}`, event);
      return dashboard;
  }
};

export const useDashboard = ({
  appId,
  symptomDescription,
  startTime,
  endTime,
}: UseDashboardParams) => {
  const aptibleAiUrl = useSelector(selectAptibleAiUrl);
  const accessToken = useSelector(selectAccessToken);
  const [socketConnected, setSocketConnected] = useState(true);
  const [dashboard, setDashboard] = useState<Dashboard>({
    resources: {},
    messages: [],
  });
  const [hasShownCompletion, setHasShownCompletion] = useState(false);

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

  useEffect(() => {
    if (readyState === ReadyState.CLOSED) {
      setSocketConnected(false);
    }
  }, [readyState]);

  useEffect(() => {
    if (event) {
      setDashboard((prevDashboard) =>
        handleDashboardEvent(prevDashboard, event),
      );
    }
  }, [JSON.stringify(event)]);

  // Show a message when the socket closes and the analysis is complete.
  useEffect(() => {
    if (readyState === ReadyState.CLOSED && !hasShownCompletion) {
      setHasShownCompletion(true);
      setDashboard((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: "completion-message",
            severity: "info",
            message: "Analysis complete.",
          },
        ],
      }));
    }
  }, [readyState, hasShownCompletion]);

  return {
    dashboard,
    isConnected: readyState === ReadyState.OPEN,
    isClosed: readyState === ReadyState.CLOSED,
  };
};
