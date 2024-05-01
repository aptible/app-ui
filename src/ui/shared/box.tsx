export const Box = ({
  children,
  className = "",
  size = "lg",
  bg = "white",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "lg" | "md" | "sm";
  bg?: string;
}) => {
  const cls = () => {
    if (size === "md") return "p-4";
    if (size === "sm") return "p-2";
    return "p-7";
  };

  return (
    <div
      className={`bg-${bg} ${cls()} shadow border border-black-100 rounded-lg ${className}`}
    >
      {children}
    </div>
  );
};

export const BoxGroup = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col gap-4">{children}</div>;
};
