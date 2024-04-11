import { PaginateProps } from "../hooks";
import { ButtonIcon } from "./button";
import { Group } from "./group";
import { IconArrowLeft, IconArrowRight, IconInfo } from "./icons";
import { LoadingSpinner } from "./loading";
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
export const LoadingBar = ({ isLoading = false }: { isLoading?: boolean }) => {
  if (isLoading) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }
  return null;
};

export function PaginateBar<T>(
  paginate: Pick<
    PaginateProps<T>,
    "totalPages" | "page" | "prev" | "next" | "isLoading"
  >,
) {
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
        <ButtonIcon
          variant="white"
          icon={<IconArrowLeft color="#111920" variant="sm" />}
          size="xs"
          disabled={paginate.page === 1}
          onClick={(e) => {
            e.preventDefault();
            paginate.prev();
          }}
        />

        <ButtonIcon
          variant="white"
          icon={<IconArrowRight color="#111920" variant="sm" />}
          size="xs"
          disabled={paginate.page === paginate.totalPages}
          onClick={(e) => {
            e.preventDefault();
            paginate.next();
          }}
        />
        <LoadingSpinner show={paginate?.isLoading} />
      </Group>
    </Group>
  );
}
