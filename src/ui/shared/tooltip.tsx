import cn from "classnames";

export const Tooltip = ({
  autoSizeWidth = false,
  fluid,
  children,
  rightAnchored = false,
  text,
}: {
  autoSizeWidth?: boolean;
  fluid?: boolean;
  children: React.ReactNode;
  rightAnchored?: boolean;
  text: string;
}) => {
  return (
    <div className="relative tooltip">
      <div className="cursor-pointer">{children}</div>
      <div
        className={cn([
          "tooltip-inner",
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
