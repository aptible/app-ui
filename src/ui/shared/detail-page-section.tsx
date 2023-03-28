import { tokens } from "./tokens";
import cn from "classnames";
import { Fragment } from "react";

type Element = React.ReactNode | JSX.Element;
type SectionProps = {
  title: Element;
  description?: Element;
  actions?: Element[];
  children: Element;
};

export const DetailPageSections = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className="flex flex-col gap-8">{children}</div>;
};

export function DetailPageSection({
  title,
  description,
  actions,
  children,
}: SectionProps) {
  return (
    <div>
      <div className="flex flex-row items-center">
        <div className="flex-1">
          <div className={cn(tokens.type.h3)}>{title}</div>
          <p className="mt-2 text-sm text-gray-700">{description}</p>
        </div>
        <div>
          {actions?.map((a, i) => (
            <Fragment key={`action-${i}`}>{a}</Fragment>
          ))}
        </div>
      </div>

      <div className="mt-5">{children}</div>
    </div>
  );
}
