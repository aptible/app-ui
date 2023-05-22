import { useNavigate } from "react-router";

import { IconBox, IconGlobe, IconLayers, IconPlusCircle } from "./icons";
import {
  appsUrl,
  createProjectGitUrl,
  databaseUrl,
  environmentsUrl,
} from "@app/routes";

import { AptibleLogo } from "./aptible-logo";
import { ButtonIcon } from "./button";
import { LinkNav } from "./link";
import { UserMenu } from "./user-menu";

export const ApplicationSidebar = () => {
  const navigate = useNavigate();
  const navigation = [
    { name: "Environments", to: environmentsUrl(), icon: <IconGlobe /> },
    { name: "Apps", to: appsUrl(), icon: <IconLayers /> },
    { name: "Databases", to: databaseUrl(), icon: <IconBox /> },
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
          onClick={() => navigate(createProjectGitUrl())}
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
