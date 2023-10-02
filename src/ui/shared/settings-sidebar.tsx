import { securitySettingsUrl, teamUrl } from "@app/routes";
import cn from "classnames";
import { NavLink } from "react-router-dom";
import { tokens } from "./tokens";

export function SettingsSidebar() {
  const profileNav = [{ name: "Profile Settings", to: securitySettingsUrl() }];

  const companyNav = [
    { name: "Team Settings", to: teamUrl() },
    { name: "Single Sign-on", to: "/settings/sso" },
    { name: "Team Contacts", to: "/settings/contact-settings" },
    { name: "Stacks", to: "/setting/stacks" },
  ];

  const billingNav = [
    { name: "Contracts", to: "/settings/contracts" },
    { name: "Invoices & Projections", to: "/settings/invoices" },
    { name: "Payment Methods", to: "/settings/payment-methods" },
    { name: "Credits", to: "/setting/credits" },
    { name: "Billing Contacts", to: "/setting/billing-contacts" },
    { name: "Billing Address", to: "/setting/billing-address" },
  ];
  const active = "bg-off-white text-gray-900";
  const inactive = "text-gray-600 hover:bg-black-50 hover:text-gray-900";
  const navButton =
    "group flex items-center p-2 mb-1 text-base rounded-md hover:no-underline";

  const navLink = ({ isActive }: { isActive: boolean }) =>
    cn(navButton, { [inactive]: !isActive, [active]: isActive });

  return (
    <nav className="p-4 border-r border-gray-200 h-full flex flex-col gap-4">
      <div>
        <h4 className={`${tokens.type.h4} ml-2`}>Profile</h4>
        {profileNav.map((item) => (
          <NavLink className={navLink} to={item.to} key={item.to}>
            {item.name}
          </NavLink>
        ))}
      </div>

      <div>
        <h4 className={`${tokens.type.h4} ml-2`}>Team</h4>
        {companyNav.map((item) => (
          <NavLink className={navLink} to={item.to} key={item.to}>
            {item.name}
          </NavLink>
        ))}
      </div>

      <div>
        <h4 className={`${tokens.type.h4} ml-2`}>Billing</h4>
        {billingNav.map((item) => (
          <NavLink className={navLink} to={item.to} key={item.to}>
            {item.name}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
