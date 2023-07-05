import { tokens } from "./tokens";
import cn from "classnames";
import { NavLink } from "react-router-dom";

export type Crumb = {
  name: string;
  to: string | null;
};

const navLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    "text-xl",
    { [tokens.type.link]: !isActive },
    { [tokens.type.link]: isActive },
  );

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <div className="flex items-center">
        {crumbs.map((crumb, idx) => (
          <div key={`${crumb.name}-${idx}`}>
            {crumb.to === null ? (
              <div className="text-xl font-semibold">&nbsp;{crumb.name}</div>
            ) : (
              <>
                <NavLink className={navLink} to={crumb.to}>
                  {" "}
                  {crumb.name}
                </NavLink>
                <span className="text-xl text-gray-500">
                  {idx !== crumbs.length && " /"}
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
