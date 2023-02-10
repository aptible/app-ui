import { UserMenu } from "./user-menu";
import { AptibleLogo } from "./aptible-logo";

import { IconCircleStack, IconCube, IconPlusCircle } from "@app/ui/shared";
import { appsUrl, createProjectUrl, databasesUrl } from "@app/routes";
import { ButtonIcon } from "./button";
import { LinkNav } from "./link";
import { useNavigate } from "react-router";

export const ApplicationSidebar = () => {
  const navigate = useNavigate();
  const navigation = [
    { name: "Apps", to: appsUrl(), icon: <IconCube /> },
    { name: "Databases", to: databasesUrl(), icon: <IconCircleStack /> },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <AptibleLogo />
        </div>
        <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
          {navigation.map((item) => (
            <LinkNav key={item.name} {...item} />
          ))}
        </nav>
      </div>
      <div className="px-3 w-full">
        <ButtonIcon
          className="w-full mb-4"
          onClick={() => navigate(createProjectUrl())}
          icon={<IconPlusCircle />}
        >
          Create
        </ButtonIcon>
        <UserMenu />
        <div className="my-6 flex justify-between text-xs text-gray-500">
          <a href="https://aptible.com/docs">DOCS</a>
          <a href="https://aptible.com/support">SUPPORT</a>
          <a href="https://aptible.com/cli">INSTALL CLI</a>
        </div>
      </div>
    </div>
  );
};
