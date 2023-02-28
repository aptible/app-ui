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
    "px-3 py-4",
    "whitespace-nowrap",
    className,
  );
  return <td className={classes}>{children}</td>;
};

export const Th = ({ children, className }: CellProps) => {
  const classes = cn(
    "px-4 py-4",
    tokens.type["small normal lighter"],
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
export const TableHead = ({
  headers,
  rightAlignedFinalCol = false,
}: { headers: Header[]; rightAlignedFinalCol?: boolean }) => {
  return (
    <thead className="bg-gray-50">
      <tr>
        {headers.map((header, i) => {
          let [className, label] =
            typeof header === "string"
              ? ["", header]
              : [header.className, header.name];
          if (rightAlignedFinalCol && i === headers.length - 1) {
            className += " flex gap-2 justify-end";
          }
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
