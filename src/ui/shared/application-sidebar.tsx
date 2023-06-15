import { useNavigate } from "react-router";

import {
  IconBox,
  IconCloud,
  IconGlobe,
  IconHamburger,
  IconHeart,
  IconLayers,
  IconPlusCircle,
} from "./icons";
import {
  activityUrl,
  appsUrl,
  createProjectGitUrl,
  databaseUrl,
  deploymentsUrl,
  environmentsUrl,
} from "@app/routes";

import { AptibleLogo, AptibleLogoOnly } from "./aptible-logo";
import { ButtonIcon } from "./button";
import { LinkNav } from "./link";
import { UserMenu } from "./user-menu";
import { selectNav, setCollapsed } from "@app/nav";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

export const ApplicationSidebar = () => {
  const dispatch = useDispatch();
  const { collapsed } = useSelector(selectNav);

  const navigate = useNavigate();
  const navigation = [
    { name: "Environments", to: environmentsUrl(), icon: <IconGlobe /> },
    { name: "Apps", to: appsUrl(), icon: <IconLayers /> },
    { name: "Databases", to: databaseUrl(), icon: <IconBox /> },
    { name: "Deployments", to: deploymentsUrl(), icon: <IconCloud /> },
    { name: "Activity", to: activityUrl(), icon: <IconHeart /> },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div
          className={`${
            collapsed ? "mt-0 mx-4 my-4" : "absolute top-4 right-4"
          } hover:cursor-pointer`}
          onClick={() => dispatch(setCollapsed({ collapsed: !collapsed }))}
        >
          <IconHamburger color="#888C90" />
        </div>
        <div className="flex items-center flex-shrink-0 px-4">
          <Link to={environmentsUrl()}>
            {collapsed ? <AptibleLogoOnly /> : <AptibleLogo />}
          </Link>
        </div>
        <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
          {navigation.map((item) => (
            <LinkNav key={item.name} {...item} hideName={collapsed} />
          ))}
        </nav>
      </div>
      <div className="px-2 w-full">
        <div className="ml-0">
          <ButtonIcon
            className="w-full mb-4"
            onClick={() => navigate(createProjectGitUrl())}
            icon={
              <IconPlusCircle
                style={
                  collapsed
                    ? {
                        width: 12,
                        height: 12,
                        marginRight: -8,
                        marginLeft: -2,
                        transform: "scale(2.5, 2.5)",
                      }
                    : {}
                }
              />
            }
          >
            {collapsed ? "" : "Create"}
          </ButtonIcon>
        </div>
        <UserMenu hideName={collapsed} />
        {collapsed ? null : (
          <div className="my-6 flex justify-between text-xs text-gray-500">
            <a
              className="text-gray-500 hover:text-indigo"
              href="https://aptible.com/docs"
            >
              DOCS
            </a>
            <a
              className="text-gray-500 hover:text-indigo"
              href="https://aptible.com/support"
            >
              SUPPORT
            </a>
            <a
              className="text-gray-500 hover:text-indigo"
              href="https://aptible.com/cli"
            >
              INSTALL CLI
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
