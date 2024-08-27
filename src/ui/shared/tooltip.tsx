import {
  type Placement,
  autoPlacement,
  autoUpdate,
  offset,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import cn from "classnames";
import { useState } from "react";

export interface TooltipProps {
  text: string | React.ReactNode;
  children: React.ReactNode;
  fluid?: boolean;
  className?: string;
  placement?: Placement;
  theme?: "light" | "dark";
}

export const Tooltip = ({
  fluid,
  children,
  text,
  className = "",
  placement,
  theme = "dark",
}: TooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    placement: placement,
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      autoPlacement({ allowedPlacements: placement && [placement] }),
      offset(10),
    ],
    whileElementsMounted: autoUpdate,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { move: false }),
    useFocus(context),
    useDismiss(context),
    useRole(context, { role: "tooltip" }),
  ]);

  return (
    <div className={className}>
      <div
        ref={refs.setReference}
        {...getReferenceProps()}
        className="cursor-pointer w-fit"
      >
        {children}
      </div>
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className="z-50"
        >
          <div
            className={cn([
              "shadow",
              "rounded-md",
              "px-3 py-2",
              "break-normal",
              "text-sm",
              "text-left",
              theme === "dark" ? "bg-black text-white" : "bg-white text-black",
              fluid ? "w-[60vw] md:w-max" : "w-96",
            ])}
          >
            {text}
          </div>
        </div>
      )}
    </div>
  );
};
