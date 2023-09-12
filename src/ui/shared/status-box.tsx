export const StatusBox = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mt-4 first:mt-0">
      <div className="bg-white pt-4 pb-5 px-5 shadow rounded-lg border border-black-100">
        {children}
      </div>
    </div>
  );
};
