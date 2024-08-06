import { formatCurrency } from "@app/deploy";
import type { ComponentProps } from "react";
import { IconInfo } from "./icons";
import { Tooltip, type TooltipProps } from "./tooltip";

export interface CostEstimateTooltipProps
  extends ComponentProps<"div">,
    Omit<TooltipProps, "text" | "children"> {
  cost: number;
  text?: string;
}

export const CostEstimateTooltip = ({
  cost,
  text = "This is an estimate of the cost of running the current resources for one month. Please note: it does not represent your actual usage for the month.",
  ...tooltipProps
}: CostEstimateTooltipProps) => (
  <Tooltip text={text} {...tooltipProps}>
    <span className="mr-1">{formatCurrency(cost)}</span>
    <IconInfo
      className="inline-block mb-1 opacity-50 hover:opacity-100"
      variant="sm"
    />
  </Tooltip>
);
