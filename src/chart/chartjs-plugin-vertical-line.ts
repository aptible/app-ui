import { Chart as ChartJS } from "chart.js";

// ChartJS plugin to draw a vertical line on hover
export const verticalLinePlugin = {
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
