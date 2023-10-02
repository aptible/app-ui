import { securitySettingsUrl, teamUrl } from "@app/routes";
import cn from "classnames";
import { NavLink } from "react-router-dom";
import { tokens } from "./tokens";

export function SettingsSidebar() {
  const profileNav = [{ name: "Security Settings", to: securitySettingsUrl() }];

  const companyNav = [
    { name: "Team", to: teamUrl() },
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
  const active = "bg-gray-200 text-gray-900";
  const inactive = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
  const navButton =
    "group flex items-center p-2 mb-1 text-sm font-medium rounded-md hover:no-underline";

  const navLink = ({ isActive }: { isActive: boolean }) =>
    cn(navButton, { [inactive]: !isActive, [active]: isActive });

  return (
    <nav className="p-4 border-r border-gray-200 h-full flex flex-col gap-4">
      <div>
        <h3 className={tokens.type.h3}>Profile</h3>
        {profileNav.map((item) => (
          <NavLink className={navLink} to={item.to} key={item.to}>
            {item.name}
          </NavLink>
        ))}
      </div>

      <div>
        <h3 className={tokens.type.h3}>Company</h3>
        {companyNav.map((item) => (
          <NavLink className={navLink} to={item.to} key={item.to}>
            {item.name}
          </NavLink>
        ))}
      </div>

      <div>
        <h3 className={tokens.type.h3}>Billing</h3>
        {billingNav.map((item) => (
          <NavLink className={navLink} to={item.to} key={item.to}>
            {item.name}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
