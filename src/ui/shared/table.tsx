import cn from "classnames";

export const Table = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="overflow-x-scroll w-full shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <div className="min-w-[600px]">
        <table className="table-auto w-full divide-y divide-gray-300">
          {children}
        </table>
      </div>
    </div>
  );
};

export const THead = ({ children }: { children: React.ReactNode }) => {
  return (
    <thead className="bg-gray-50">
      <tr>{children}</tr>
    </thead>
  );
};

export const TBody = ({ children }: { children: React.ReactNode }) => {
  return (
    <tbody className="divide-y divide-gray-200 bg-white">{children}</tbody>
  );
};

export const Tr = ({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) => {
  return <tr className={`group hover:bg-gray-50 ${className}`}>{children}</tr>;
};

export const EmptyTr = ({
  children = "No resources found",
  colSpan = 1,
}: { children?: React.ReactNode; colSpan?: number }) => {
  return (
    <Tr>
      <Td colSpan={colSpan} variant="center">
        {children}
      </Td>
    </Tr>
  );
};

export interface CellProps {
  children: React.ReactNode;
  className?: string;
  variant?: "left" | "center" | "right";
  colSpan?: number;
}

export const Td = ({
  children,
  className,
  colSpan = 1,
  variant = "left",
}: CellProps) => {
  const align = () => {
    if (variant === "right") return "text-right pr-4 flex gap-2 justify-end";
    if (variant === "center") return "text-center";
    return "text-left";
  };
  const classes = cn(
    "text-sm text-gray-500",
    "pl-4 py-3",
    "break-words",
    align(),
    className,
  );
  return (
    <td colSpan={colSpan} className={classes}>
      {children}
    </td>
  );
};

export const Th = ({ children, className, variant = "left" }: CellProps) => {
  const align = () => {
    if (variant === "right") return "text-right pr-4";
    if (variant === "center") return "text-center";
    return "text-left";
  };
  const classes = cn(
    "pl-4 py-3",
    "text-sm font-normal text-gray-500",
    align(),
    className,
  );

  return (
    <th scope="col" className={classes}>
      {children}
    </th>
  );
};
