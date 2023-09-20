import cn from "classnames";

export interface TooltipProps {
  text: string;
  children: React.ReactNode;
  autoSizeWidth?: boolean;
  fluid?: boolean;
  rightAnchored?: boolean;
  className?: string;
  relative?: boolean;
  variant?: "top" | "left";
}

export const Tooltip = ({
  autoSizeWidth = false,
  fluid,
  children,
  rightAnchored = false,
  text,
  className = "",
  relative = true,
  variant = "top",
}: TooltipProps) => {
  return (
    <div className={`tooltip ${relative ? "relative" : ""} ${className}`}>
      <div className="cursor-pointer">{children}</div>
      <div
        className={cn([
          `tooltip-${variant}`,
          "z-50",
          rightAnchored ? "-right-3 top-0" : "left-0 top-0",
          "shadow",
          "absolute",
          "rounded-md",
          "px-3 py-2",
          "bg-black text-white",
          autoSizeWidth ? "w-96" : "",
          fluid ? "w-[60vw] md:w-max" : "",
        ])}
      >
        {text}
      </div>
    </div>
  );
};
