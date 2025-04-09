export interface ResourceNodeProps {
  id: string;
  isRoot: boolean;
}

export interface StandardNodeProps {
  children: React.ReactNode;
  isRoot: boolean;
  providerIconUrl?: string;
}

export const StandardNode = ({
  children,
  isRoot,
  providerIconUrl,
}: StandardNodeProps) => {
  return (
    <div
      className={`w-64 text-xs px-3 py-2 shadow border rounded-lg relative ${
        isRoot ? "border-blue-300 bg-white" : "border-black-100 bg-gray-50"
      }`}
    >
      {providerIconUrl && (
        <div className="flex w-6 h-6 absolute -top-3 -left-3 bg-white rounded-full border items-center justify-center p-0.5">
          <img
            src={providerIconUrl}
            className="rounded-full"
            alt="Resource Provider"
          />
        </div>
      )}
      {children}
    </div>
  );
};
