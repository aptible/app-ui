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
          "z-50",
          "left-0 top-0",
          "shadow",
          "absolute",
          "rounded-md",
          "px-3 py-2",
          "w-96",
          "bg-black text-white",
        ])}
      >
        {text}
      </div>
    </div>
  );
};
