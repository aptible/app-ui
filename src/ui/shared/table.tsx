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
    "pl-4 py-3",
    "whitespace-nowrap",
    className,
  );
  return <td className={classes}>{children}</td>;
};

export const Th = ({ children, className }: CellProps) => {
  const classes = cn(
    "pl-4 py-3",
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
  leftAlignedFirstCol = false,
  centerAlignedColIndices = [],
}: {
  headers: Header[];
  rightAlignedFinalCol?: boolean;
  leftAlignedFirstCol?: boolean;
  centerAlignedColIndices?: number[];
}) => {
  return (
    <thead className="bg-gray-50">
      <tr>
        {headers.map((header, i) => {
          let [className, label] =
            typeof header === "string"
              ? ["", header]
              : [header.className, header.name];

          if (centerAlignedColIndices.includes(i)) {
            className += "text-center";
          } else {
            if (leftAlignedFirstCol && i === 0) {
              className += " pl-4";
            }
            if (rightAlignedFinalCol && i === headers.length - 1) {
              className += " flex gap-2 justify-end mr-4";
            }
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
