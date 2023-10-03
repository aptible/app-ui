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
  const active = "bg-off-white font-semibold text-black focus:text-black";
  const inactive = "text-black-500 hover:bg-black-50 hover:text-black";
  const navButton =
    "group flex items-center p-2 text-base rounded-md hover:no-underline";

  const navLink = ({ isActive }: { isActive: boolean }) =>
    cn(navButton, { [inactive]: !isActive, [active]: isActive });

  return (
    <nav className="flex flex-col">
      <div>
        <h4 className={`${tokens.type.h4} ml-2`}>Profile</h4>
        {profileNav.map((item) => (
          <NavLink className={navLink} to={item.to} key={item.to}>
            {item.name}
          </NavLink>
        ))}
        <hr className="mt-3 mx-2" />
      </div>

      <div>
        <h4 className={`${tokens.type.h4} ml-2 mt-4`}>Team</h4>
        {companyNav.map((item) => (
          <NavLink className={navLink} to={item.to} key={item.to}>
            {item.name}
          </NavLink>
        ))}
        <hr className="mt-3 mx-2" />
      </div>

      <div>
        <h4 className={`${tokens.type.h4} ml-2 mt-4`}>Billing</h4>
        {billingNav.map((item) => (
          <NavLink className={navLink} to={item.to} key={item.to}>
            {item.name}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
