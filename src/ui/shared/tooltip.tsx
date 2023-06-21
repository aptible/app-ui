import cn from "classnames";

export const Tooltip = ({
  children,
  text,
}: { children: React.ReactNode; text: string }) => {
  return (
    <div className="relative tooltip">
      <div className="cursor-pointer">{children}</div>
      <div
        className={cn([
          "tooltip-inner",
          "shadow",
          "absolute",
          "rounded-md",
          "px-3 py-2",
          "max-w-xs",
          "bg-black text-white",
          "tooltip-top",
        ])}
      >
        {text}
      </div>
    </div>
  );
};
