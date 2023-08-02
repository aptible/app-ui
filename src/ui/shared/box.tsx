export const Box = ({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) => {
  return (
    <div
      className={`bg-white py-10 px-10 shadow border border-black-100 rounded-lg ${className}`}
    >
      {children}
    </div>
  );
};

export const BoxGroup = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col gap-4">{children}</div>;
};
