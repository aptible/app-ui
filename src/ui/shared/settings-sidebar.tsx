import cn from "classnames";
import { NavLink } from "react-router-dom";
import { tokens } from "./tokens";

const companyNav = [
	{ name: "Team", to: "/settings/team" },
	{ name: "Single Sign-on", to: "/settings/sso" },
	{ name: "Contact Settings", to: "/settings/contact-settings" },
	{ name: "Stacks", to: "/setting/stacks" },
];

const billingNav = [
	{ name: "Contracts", to: "/settings/contracts" },
	{ name: "Invoices & Projections", to: "/settings/invoices" },
	{ name: "Payment Methods", to: "/settings/payment-methods" },
	{ name: "Credits", to: "/setting/credits" },
	{ name: "Billing Contacts", to: "/setting/billing-contacts" },
	{ name: "Address", to: "/setting/billing-address" },
];

export function SettingsSidebar() {
	const active = "bg-gray-200 text-gray-900";
	const inactive = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
	const navButton =
		"group flex items-center p-2 mb-1 text-sm font-medium rounded-md";

	const navLink = ({ isActive }: { isActive: boolean }) =>
		cn(navButton, { [inactive]: !isActive, [active]: isActive });

	return (
		<div className="flex-1 flex flex-col min-h-0 border-r border-gray-200">
			<div className="flex-1 flex flex-col py-5 overflow-y-auto">
				<nav className="flex-1 px-4">
					<div className="mb-6 pb-6 border-b border-gray-200">
						<div className={cn("mb-2 p-2", tokens.type["active link"])}>
							Company
						</div>
						{companyNav.map((item) => (
							<NavLink className={navLink} to={item.to} key={item.to}>
								{item.name}
							</NavLink>
						))}
					</div>
					<div className={cn("mb-2 p-2", tokens.type["active link"])}>
						Billing
					</div>
					{billingNav.map((item) => (
						<NavLink className={navLink} to={item.to} key={item.to}>
							{item.name}
						</NavLink>
					))}
				</nav>
			</div>
		</div>
	);
}
