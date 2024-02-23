import cn from "classnames";
import { NavLink } from "react-router-dom";
import { tokens } from "./tokens";

export type Crumb = {
  name: string;
  to: string | null;
};

const navLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    "text-xl",
    "text-gray-900",
    "focus:text-gray-900",
    "font-semibold",
    { [tokens.type.link]: !isActive },
    { [tokens.type.link]: isActive },
  );

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <div>
        {crumbs.map((crumb, idx) => {
          // console.log(idx !== crumbs.length - 1, idx, crumbs.length)
          return (
            <span key={`${crumb.name}-${idx}`}>
              {crumb.to === null ? (
                <span className="text-xl font-semibold break-words">
                  {crumb.name}
                </span>
              ) : (
                <span className={idx === 0 ? "" : ""}>
                  <NavLink className={navLink} to={crumb.to}>
                    {" "}
                    {crumb.name}
                  </NavLink>
                  <span className="text-xl text-gray-500 break-words">
                    {idx !== crumbs.length - 1 && " / "}
                  </span>
                </span>
              )}
            </span>
          );
        })}
      </div>
    </nav>
  );
}
