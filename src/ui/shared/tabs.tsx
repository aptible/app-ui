import { NavLink } from "react-router-dom";
import { tokens } from "./tokens";
import cn from "classnames";

type TabViewProps = {
	isActive: boolean;
	to: string;
	label: string;
	className?: string;
};

export type TabItem = {
	name: string;
	current: boolean;
	href: string;
};

const navLink = ({ isActive }: { isActive: boolean }) =>
	cn(
		"flex items-center",
		{
			[tokens.type.link]: !isActive,
			"border-transparent  hover:border-gray-300": "!isActive",
			[tokens.type["subdued active link"]]: isActive,
			"border-emerald-500": isActive,
		},
		"whitespace-nowrap py-4 px-1 border-b-2",
	);

export const Tab = ({ label, to }: TabViewProps) => (
	<NavLink key={label} to={to} className={navLink}>
		{label}
	</NavLink>
);

export const Tabs = ({ tabs }: { tabs: TabItem[] }) => {
	return (
		<nav className="-mb-px flex space-x-8" aria-label="Tabs">
			{tabs.map((tab) => (
				<Tab
					key={tab.name}
					isActive={tab.current}
					label={tab.name}
					to={tab.href}
				/>
			))}
		</nav>
	);
};
