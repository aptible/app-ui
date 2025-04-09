export interface Message {
  id: string;
  severity: string;
  message: string;
}

export interface Operation {
  id: number;
  status: string;
  created_at: string;
  description: string;
  log_lines: string[];
}

export interface Point {
  timestamp: string;
  value: number;
}

export interface Series {
  label: string;
  description: string;
  interpretation: string;
  annotations: Annotation[];
  points: Point[];
}

export interface Plot {
  id: string;
  title: string;
  description: string;
  resource_id: string;
  resource_type: string;
  resource_label: string;
  interpretation: string;
  analysis: string;
  unit: string;
  series: Series[];
  annotations: Annotation[];
  x_axis_range: [string, string];
  y_axis_range: [number, number];
}

export interface Resource {
  id: string;
  label: string;
  type: string;
  notes: string;
  plots: {
    [key: string]: Plot;
  };
  operations: Operation[];
}

export interface Annotation {
  label: string;
  description: string;
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
}

export interface DashboardContents {
  resources: {
    [key: string]: Resource;
  };
  messages: Message[];
  summary: string;
  ranked_plots: Plot[];
}

export const handleDashboardEvent = (
  dashboard: DashboardContents,
  event: Record<string, any>,
): DashboardContents => {
  switch (event?.type) {
    case "ResourceDiscovered":
      return {
        ...dashboard,
        resources: {
          ...dashboard.resources,
          [event.resource_label]: {
            id: event.resource_id,
            label: event.resource_label,
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
          [event.resource_label]: {
            ...dashboard.resources[event.resource_label],
            plots: {
              ...dashboard.resources[event.resource_label].plots,
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
          [event.resource_label]: {
            ...dashboard.resources[event.resource_label],
            plots: {
              ...dashboard.resources[event.resource_label].plots,
              [event.plot_id]: {
                ...dashboard.resources[event.resource_label].plots[
                  event.plot_id
                ],
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
          [event.resource_label]: {
            ...dashboard.resources[event.resource_label],
            operations: [
              ...dashboard.resources[event.resource_label].operations,
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
    case "SummaryGenerated":
      return {
        ...dashboard,
        summary: event.summary,
        ranked_plots: event.plots,
      };
    default:
      console.log(`Unhandled event type ${event?.type}`, event);
      return dashboard;
  }
};
