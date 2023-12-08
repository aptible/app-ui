export const Code = ({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) => {
  return (
    <code
      className={`${className} bg-gray-200 font-mono text-black pt-0.5 pb-1 px-1.5 rounded-md text-[0.9rem]`}
    >
      {children}
    </code>
  );
};
