export const Box = ({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) => {
  return (
    <div
      className={`bg-white py-7 px-7 shadow border border-black-100 rounded-lg ${className}`}
    >
      {children}
    </div>
  );
};

export const BoxGroup = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col gap-4">{children}</div>;
};
