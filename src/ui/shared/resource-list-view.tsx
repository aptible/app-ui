import { PaginateProps } from "../hooks";
import { Group } from "./group";
import { IconArrowLeft, IconArrowRight, IconInfo } from "./icons";
import { tokens } from "./tokens";
import { Tooltip } from "./tooltip";

export const TitleBar = ({
  children,
  description,
  visible = true,
}: { children: React.ReactNode; description: string; visible?: boolean }) => {
  if (!visible) return null;

  return (
    <Group variant="horizontal" size="sm" className="items-center">
      <h2 className={tokens.type.h2}>{children}</h2>
      <Tooltip fluid text={description} variant="bottom">
        <IconInfo className="opacity-50 hover:opacity-100" variant="sm" />
      </Tooltip>
    </Group>
  );
};
export const FilterBar = ({ children }: { children: React.ReactNode }) => {
  return <Group size="sm">{children}</Group>;
};
export const ActionBar = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};
export const DescBar = ({ children }: { children: React.ReactNode }) => {
  return <div className="text-gray-500">{children}</div>;
};
export function PaginateBar<T>(
  paginate: Pick<PaginateProps<T>, "totalPages" | "page" | "prev" | "next">,
) {
  if (paginate.totalPages === 1) {
    return null;
  }

  return (
    <Group
      variant="horizontal"
      size="sm"
      className="items-center text-gray-500"
    >
      <div>
        Page {paginate.page} of {paginate.totalPages}
      </div>
      <Group variant="horizontal" size="sm" className="items-center">
        <IconArrowLeft
          color="#111920"
          className="cursor-pointer opacity-60 hover:opacity-100 border border-black-200 p-1 rounded-md hover:shadow"
          onClick={(e) => {
            e.preventDefault();
            paginate.prev();
          }}
        />

        <IconArrowRight
          color="#111920"
          className="cursor-pointer opacity-60 hover:opacity-100 border border-black-200 p-1 rounded-md hover:shadow"
          onClick={(e) => {
            e.preventDefault();
            paginate.next();
          }}
        />
      </Group>
    </Group>
  );
}
