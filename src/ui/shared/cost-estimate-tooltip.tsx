import { formatCurrency } from "@app/deploy";
import type { ComponentProps } from "react";
import { IconInfo } from "./icons";
import { LoadingSpinner } from "./loading";
import { Tooltip, type TooltipProps } from "./tooltip";

export interface CostEstimateTooltipProps
  extends ComponentProps<"div">,
    Omit<TooltipProps, "text" | "children"> {
  cost: number | null;
  text?: string;
}

export const CostEstimateTooltip = ({
  cost,
  text = "This is an estimate of the cost of running the current resources for one month. Please note: it does not represent your actual usage for the month and does not reflect contract discounts or allocations.",
  ...tooltipProps
}: CostEstimateTooltipProps) => (
  <Tooltip text={text} {...tooltipProps}>
    <span className="flex space-x-1 items-center w-fit">
      {cost == null ? <LoadingSpinner /> : <span>{formatCurrency(cost)}</span>}
      <IconInfo
        className="inline-block opacity-50 hover:opacity-100"
        variant="sm"
      />
    </span>
  </Tooltip>
);
