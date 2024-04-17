import {
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
  autoSizeWidth?: boolean;
  fluid?: boolean;
  rightAnchored?: boolean;
  className?: string;
  variant?: "auto" | "top" | "left" | "bottom" | "right";
  theme?: "light" | "dark";
}

export const Tooltip = ({
  autoSizeWidth = false,
  fluid,
  children,
  text,
  className = "",
  variant = "auto",
  theme = "dark",
}: TooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const placement = variant === "auto" ? undefined : variant;

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
        className="cursor-pointer"
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
              theme === "dark" ? "bg-black text-white" : "bg-white text-black",
              autoSizeWidth ? "w-96" : "",
              fluid ? "w-[60vw] md:w-max" : "",
            ])}
          >
            {text}
          </div>
        </div>
      )}
    </div>
  );
};
