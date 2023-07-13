import cn from "classnames";

export const Tooltip = ({
  autoSizeWidth = false,
  fluid,
  children,
  text,
}: {
  autoSizeWidth?: boolean;
  fluid?: boolean;
  children: React.ReactNode;
  text: string;
}) => {
  return (
    <div className="relative tooltip">
      <div className="cursor-pointer">{children}</div>
      <div
        className={cn([
          "tooltip-inner",
          "z-50",
          "left-0 top-0",
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
