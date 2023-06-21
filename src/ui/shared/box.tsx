export const Box = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mt-4">
      <div className="bg-white py-8 px-8 shadow border border-black-100 rounded-lg">
        {children}
      </div>
    </div>
  );
};
