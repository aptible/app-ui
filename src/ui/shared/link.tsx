import cn from "classnames";
import { NavLink } from "react-router-dom";

const active = "bg-gray-100 text-gray-900";
const inactive = "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
const navButton =
  "group flex items-center px-2 py-2 text-sm font-medium rounded-md";

export const navLink = ({ isActive }: { isActive: boolean }) =>
  cn(navButton, { [inactive]: !isActive, [active]: isActive });

export const LinkNav = ({
  icon,
  name,
  to,
}: {
  icon: JSX.Element;
  name: string;
  to: string;
}) => (
  <NavLink className={navLink} to={to} key={to}>
    <div
      className="mr-3 text-gray-400 flex-shrink-0 h-5 w-5"
      aria-hidden="true"
    >
      {icon}
    </div>
    {name}
  </NavLink>
);
