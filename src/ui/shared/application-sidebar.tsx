import cn from "classnames";
import { NavLink } from "react-router-dom";

import { UserMenu } from "./user-menu";
import { AptibleLogo } from "./aptible-logo";

const navigation = [
  { name: "Apps", to: "/apps" },
  { name: "Data Stores", to: "/databases" },
  { name: "Company Settings", to: "/settings/team" },
];

export const ApplicationSidebar = () => {
  const active = "bg-gray-100 text-gray-900";
  const inactive = "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
  const navButton =
    "group flex items-center px-2 py-2 text-sm font-medium rounded-md";

  const navLink = ({ isActive }: { isActive: boolean }) =>
    cn(navButton, { [inactive]: !isActive, [active]: isActive });

  return (
    <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <AptibleLogo />
        </div>
        <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
          {navigation.map((item) => (
            <NavLink className={navLink} to={item.to} key={item.to}>
              <div
                className="mr-3 text-gray-400 flex-shrink-0 h-5 w-5"
                aria-hidden="true"
              >
                icn
              </div>
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="p-3 flex">
        <UserMenu />
      </div>
    </div>
  );
};
