import { tokens } from "./tokens";
import cn from "classnames";
import { NavLink } from "react-router-dom";

export type Crumb = {
  name: string;
  to: string | null;
};

const navLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    "text-xl flex items-center",
    { [tokens.type.link]: !isActive },
    { [tokens.type.link]: isActive },
  );

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center">
        {crumbs.map((crumb, idx) => (
          <li key={crumb.name}>
            {crumb.to === null ? (
              <div className="text-xl">&nbsp;{crumb.name}</div>
            ) : (
              <NavLink className={navLink} to={crumb.to}>
                {" "}
                {crumb.name} {idx !== crumbs.length && "/"}
              </NavLink>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
