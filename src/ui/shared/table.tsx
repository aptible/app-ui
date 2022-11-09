import cn from "classnames";

import { tokens } from "./tokens";

export type CellProps = {
  children: React.ReactNode;
  first?: boolean;
  last?: boolean;
  className?: string;
  colSpan?: number;
};

export const Td = ({ children, className }: CellProps) => {
  const classes = cn(
    tokens.type["small lighter"],
    tokens.spacing["table cell"],
    "whitespace-nowrap",
    className,
  );
  return <td className={classes}>{children}</td>;
};

export const Th = ({ children, className }: CellProps) => {
  const classes = cn(
    tokens.spacing["table cell"],
    tokens.type["small semibold darker"],
    "text-left",
    className,
  );

  return (
    <th scope="col" className={classes}>
      {children}
    </th>
  );
};
type Header = string | { name: string; className: string };
export const TableHead = ({ headers }: { headers: Header[] }) => {
  return (
    <thead className="bg-gray-50">
      <tr>
        {headers.map((header, i) => {
          const [className, label] =
            typeof header === "string"
              ? ["", header]
              : [header.className, header.name];
          return (
            <Th
              className={className}
              key={`table-header-${i}`}
              first={true}
              last={i === headers.length - 1}
            >
              {label}
            </Th>
          );
        })}
      </tr>
    </thead>
  );
};
