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
