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
    { [tokens.type.link]: !isActive },
    { [tokens.type.link]: isActive },
  );

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <div>
        {crumbs.map((crumb, idx) => (
          <span key={`${crumb.name}-${idx}`}>
            {idx ? (
              <NavLink
                className="text-xl text-black focus:text-black hover:text-indigo font-semibold break-words"
                to={crumb.to}
              >
                {" "}
                {crumb.name}
              </NavLink>
            ) : (
              <span className={idx === 0 ? "" : ""}>
                <NavLink className={navLink} to={crumb.to}>
                  {" "}
                  {crumb.name}
                </NavLink>
                <span className="text-xl text-gray-500 break-words">
                  {idx !== crumbs.length && " / "}
                </span>
              </span>
            )}
          </span>
        ))}
      </div>
    </nav>
  );
}
