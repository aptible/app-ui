export const Box = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mt-8">
      <div className="bg-white py-8 shadow sm:rounded-lg sm:px-10">
        {children}
      </div>
    </div>
  );
};
