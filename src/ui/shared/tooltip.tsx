import cn from "classnames";

export const Tooltip = ({
  autoSizeWidth = false,
  children,
  text,
}: { autoSizeWidth?: boolean; children: React.ReactNode; text: string }) => {
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
        ])}
      >
        {text}
      </div>
    </div>
  );
};
