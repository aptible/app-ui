export const Box = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mt-8">
      <div className="bg-white py-8 px-10 shadow border border-black-100">
        {children}
      </div>
    </div>
  );
};
