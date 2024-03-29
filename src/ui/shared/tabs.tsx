import cn from "classnames";
import { NavLink } from "react-router-dom";

type TabViewProps = {
  isActive: boolean;
  to: string;
  label: string;
  className?: string;
};

export type TabItem = {
  name: string;
  current?: boolean;
  href: string;
};

const navLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center",
    {
      "font-normal text-base text-gray-500 hover:text-gray-700": !isActive,
      "border-transparent  hover:border-gray-300": !isActive,
      "font-semibold text-black": isActive,
      "border-orange-400": isActive,
    },
    "focus:text-black",
    "whitespace-nowrap pb-3 px-1 border-b-3",
    "hover:no-underline",
  );

export const Tab = ({ label, to }: TabViewProps) => (
  <NavLink key={label} to={to} className={navLink}>
    {label}
  </NavLink>
);

export const Tabs = ({ tabs }: { tabs: TabItem[] }) => {
  return (
    <nav
      className="flex space-x-8 bg-white border-black-100 border-b"
      aria-label="Tabs"
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.name}
          isActive={!!tab.current}
          label={tab.name}
          to={tab.href}
        />
      ))}
    </nav>
  );
};
