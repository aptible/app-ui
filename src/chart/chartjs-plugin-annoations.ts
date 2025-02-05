import { Chart as ChartJS } from "chart.js";


// Update ChartJS interface to include annotations
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

export type Annotation = {
  label: string;
  description: string;
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
};

// ChartJS plugin to draw annotations on a line chart
export const annotationsPlugin = {
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
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.fillRect(pixelX1, pixelY1, pixelX2 - pixelX1, pixelY2 - pixelY1);

      // Rectangle border
      ctx.strokeStyle = 'rgb(200, 0, 0)';
      ctx.strokeRect(pixelX1, pixelY1, pixelX2 - pixelX1, pixelY2 - pixelY1);

      // Annotation label
      ctx.save();
      const padding = 4;
      ctx.font = '10px monospace';
      const textMetrics = ctx.measureText(annotation.label);
      const textHeight = 12;
      const radius = 4;

      const boxX = pixelX1 + padding;
      const boxY = pixelY1 - textHeight - padding * 2;
      const boxWidth = textMetrics.width + padding * 2;
      const boxHeight = textHeight + padding * 2;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = 'rgba(200, 0, 0, 0.75)';
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, radius);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgb(200, 0, 0)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = 'white';
      ctx.textBaseline = 'bottom';
      ctx.fillText(annotation.label, pixelX1 + padding * 2, pixelY1 - padding);
      ctx.restore();
    });
  }
};
