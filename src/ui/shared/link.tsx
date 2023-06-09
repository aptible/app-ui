import cn from "classnames";
import { NavLink } from "react-router-dom";

const active = "bg-off-white font-semibold text-black";
const inactive = "hover:bg-black-50 hover:text-black text-black-500";
const navButton = "block p-2 rounded-md hover:no-underline";

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
    <div className="flex items-center">
      <div className="mr-3" aria-hidden="true">
        {icon}
      </div>
      <div>{name}</div>
    </div>
  </NavLink>
);
