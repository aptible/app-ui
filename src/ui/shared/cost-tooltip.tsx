import { formatCurrency } from "@app/deploy";
import type { ComponentProps } from "react";
import { IconInfo } from "./icons";
import { Tooltip, type TooltipProps } from "./tooltip";

export interface CostTooltipProps
  extends ComponentProps<"div">,
    Omit<TooltipProps, "text" | "children"> {
  cost: number;
  text?: string;
}

export const CostEstimateTooltip = ({
  cost,
  text = "This is an estimate of how much it would cost to run the current resources for a month. It does not reflect any scaling, either manual or automated, that may occur.",
  ...tooltipProps
}: CostTooltipProps) => (
  <Tooltip text={text} {...tooltipProps}>
    <span className="mr-1">{formatCurrency(cost)}</span>
    <IconInfo
      className="inline-block mb-1 opacity-50 hover:opacity-100"
      variant="sm"
    />
  </Tooltip>
);
